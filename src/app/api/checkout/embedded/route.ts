import { NextRequest, NextResponse } from "next/server";
import { createAnnualCheckoutSession, getStripe } from "@/lib/stripe";
import { appConfig } from "@/lib/config";
import { FPR_COOKIE, parseAffiliateRef } from "@/lib/firstpromoter";
import { grantProStatus } from "@/lib/firebase/admin";
import { getRequestOrigin } from "@/lib/request-origin";

export const runtime = "nodejs";

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
    const returnUrl = `${origin}/${locale}?paid=1&session_id={CHECKOUT_SESSION_ID}`;

    const stripe = getStripe();
    if (!stripe) {
      // Mock: grant Pro immediately; client shows success UI
      await grantProStatus({ uid, email });
      return NextResponse.json({
        mock: true,
        clientSecret: null,
        returnUrl: `${origin}/${locale}?paid=1&mock=1&uid=${encodeURIComponent(uid)}&email=${encodeURIComponent(email)}`,
      });
    }

    const priceId = process.env.STRIPE_PRICE_ID;
    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      mode: "subscription",
      customer_email: email,
      client_reference_id: affiliateRef || undefined,
      return_url: returnUrl,
      metadata: { uid, email, locale },
      subscription_data: {
        metadata: { uid, email },
      },
      line_items: priceId
        ? [{ price: priceId, quantity: 1 }]
        : [
            {
              quantity: 1,
              price_data: {
                currency: appConfig.currency,
                unit_amount: appConfig.priceAnnualCents,
                recurring: { interval: "year" },
                product_data: {
                  name: "Break Pro (Annual)",
                  description: "Annual Break Pro subscription",
                },
              },
            },
          ],
    });

    return NextResponse.json({
      mock: false,
      clientSecret: session.client_secret,
      sessionId: session.id,
      client_reference_id: affiliateRef,
    });
  } catch (error) {
    console.error("[checkout/embedded]", error);
    // Fallback: try classic session URL if embedded fails
    try {
      const body = (await request.clone().json().catch(() => ({}))) as {
        email?: string;
        uid?: string;
        locale?: string;
      };
      if (body.email && body.uid) {
        const origin = getRequestOrigin(request);
        const locale = body.locale === "pt" || body.locale === "es" ? body.locale : "en";
        const session = await createAnnualCheckoutSession({
          email: body.email,
          uid: body.uid,
          locale,
          clientReferenceId: parseAffiliateRef(
            request.cookies.get(FPR_COOKIE)?.value
          ),
          successUrl: `${origin}/${locale}?paid=1&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${origin}/${locale}#pay`,
        });
        return NextResponse.json({
          mock: session.mock,
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
