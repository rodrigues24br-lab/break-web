import { NextRequest, NextResponse } from "next/server";
import {
  createAnnualCheckoutSession,
  getStripe,
  lineItemsAnnual,
} from "@/lib/stripe";
import { FPR_COOKIE, parseAffiliateRef } from "@/lib/firstpromoter";
import { grantProStatus } from "@/lib/firebase/admin";
import { getRequestOrigin } from "@/lib/request-origin";

export const runtime = "nodejs";

/**
 * Creates an embedded Stripe Checkout session (ui_mode: embedded)
 * or a mock path when Stripe is not configured. Annual only.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      email?: string;
      uid?: string;
      locale?: string;
    };

    const email = body.email?.trim().toLowerCase();
    const uid = body.uid?.trim();
    const locale =
      body.locale === "pt" || body.locale === "es" || body.locale === "en"
        ? body.locale
        : "en";

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
    const returnUrl = `${origin}/${locale}/success?session_id={CHECKOUT_SESSION_ID}&plan=year`;

    const stripe = getStripe();
    if (!stripe) {
      await grantProStatus({ uid, email });
      return NextResponse.json({
        mock: true,
        plan: "year",
        clientSecret: null,
        returnUrl: `${origin}/${locale}/success?paid=1&mock=1&plan=year&uid=${encodeURIComponent(uid)}&email=${encodeURIComponent(email)}`,
      });
    }

    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      mode: "subscription",
      customer_email: email,
      client_reference_id: affiliateRef || undefined,
      return_url: returnUrl,
      metadata: { uid, email, locale, plan: "year" },
      subscription_data: {
        metadata: { uid, email, plan: "year" },
      },
      line_items: lineItemsAnnual(),
    });

    return NextResponse.json({
      mock: false,
      plan: "year",
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
      };
      if (body.email && body.uid) {
        const origin = getRequestOrigin(request);
        const locale =
          body.locale === "pt" || body.locale === "es" || body.locale === "en"
            ? body.locale
            : "en";
        const session = await createAnnualCheckoutSession({
          email: body.email,
          uid: body.uid,
          locale,
          clientReferenceId: parseAffiliateRef(
            request.cookies.get(FPR_COOKIE)?.value
          ),
          successUrl: `${origin}/${locale}/success?session_id={CHECKOUT_SESSION_ID}&plan=year`,
          cancelUrl: `${origin}/${locale}/plans`,
        });
        return NextResponse.json({
          mock: session.mock,
          plan: "year",
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
