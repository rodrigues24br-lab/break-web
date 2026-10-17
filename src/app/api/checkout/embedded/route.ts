import { NextRequest, NextResponse } from "next/server";
import {
  createPlanCheckoutSession,
  getStripe,
  lineItemsForPlan,
} from "@/lib/stripe";
import { type PlanInterval } from "@/lib/config";
import { FPR_COOKIE, parseAffiliateRef } from "@/lib/firstpromoter";
import { grantProStatus } from "@/lib/firebase/admin";
import { getRequestOrigin } from "@/lib/request-origin";

export const runtime = "nodejs";

function parsePlan(value: unknown): PlanInterval {
  return value === "month" ? "month" : "year";
}

/**
 * Creates an embedded Stripe Checkout session (ui_mode: embedded)
 * or a mock client secret path when Stripe is not configured.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      email?: string;
      uid?: string;
      locale?: string;
      plan?: string;
    };

    const email = body.email?.trim().toLowerCase();
    const uid = body.uid?.trim();
    const locale =
      body.locale === "pt" || body.locale === "es" || body.locale === "en"
        ? body.locale
        : "en";
    const plan = parsePlan(body.plan);

    if (!email || !uid) {
      return NextResponse.json(
        { error: "email and uid are required" },
        { status: 400 }
      );
    }

    const affiliateRef =
      parseAffiliateRef(request.cookies.get(FPR_COOKIE)?.value) ||
      parseAffiliateRef(request.headers.get("x-fpr-ref"));

    const origin = getRequestOrigin(request);
    const returnUrl = `${origin}/${locale}/success?session_id={CHECKOUT_SESSION_ID}&plan=${plan}`;

    const stripe = getStripe();
    if (!stripe) {
      await grantProStatus({ uid, email });
      return NextResponse.json({
        mock: true,
        plan,
        clientSecret: null,
        returnUrl: `${origin}/${locale}/success?paid=1&mock=1&plan=${plan}&uid=${encodeURIComponent(uid)}&email=${encodeURIComponent(email)}`,
      });
    }

    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      mode: "subscription",
      customer_email: email,
      client_reference_id: affiliateRef || undefined,
      return_url: returnUrl,
      metadata: { uid, email, locale, plan },
      subscription_data: {
        metadata: { uid, email, plan },
      },
      line_items: lineItemsForPlan(plan),
    });

    return NextResponse.json({
      mock: false,
      plan,
      clientSecret: session.client_secret,
      sessionId: session.id,
      client_reference_id: affiliateRef,
    });
  } catch (error) {
    console.error("[checkout/embedded]", error);
    try {
      const body = (await request.clone().json().catch(() => ({}))) as {
        email?: string;
        uid?: string;
        locale?: string;
        plan?: string;
      };
      if (body.email && body.uid) {
        const origin = getRequestOrigin(request);
        const locale =
          body.locale === "pt" || body.locale === "es" || body.locale === "en"
            ? body.locale
            : "en";
        const plan = parsePlan(body.plan);
        const session = await createPlanCheckoutSession({
          email: body.email,
          uid: body.uid,
          locale,
          plan,
          clientReferenceId: parseAffiliateRef(
            request.cookies.get(FPR_COOKIE)?.value
          ),
          successUrl: `${origin}/${locale}/success?session_id={CHECKOUT_SESSION_ID}&plan=${plan}`,
          cancelUrl: `${origin}/${locale}/plans`,
        });
        return NextResponse.json({
          mock: session.mock,
          plan,
          url: session.url,
          clientSecret: null,
        });
      }
    } catch {
      /* ignore */
    }
    return NextResponse.json(
      { error: "Failed to create embedded checkout" },
      { status: 500 }
    );
  }
}
