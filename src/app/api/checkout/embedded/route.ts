import { NextRequest, NextResponse } from "next/server";
import {
  buildCheckoutSuccessUrl,
  createAnnualCheckoutSession,
} from "@/lib/stripe";
import { FPR_COOKIE, parseAffiliateRef } from "@/lib/firstpromoter";
import { grantProStatus } from "@/lib/firebase/admin";
import { appConfig } from "@/lib/config";
import { getRequestOrigin } from "@/lib/request-origin";

export const runtime = "nodejs";

/**
 * Creates a hosted Stripe Checkout session (default ui_mode).
 * Path kept for existing clients; returns session.url for redirect.
 * Annual only — price_1UQFdLBMIFugty3a7b54OLdG via lineItemsAnnual.
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

    const session = await createAnnualCheckoutSession({
      email,
      uid,
      locale,
      clientReferenceId: affiliateRef,
      successUrl: buildCheckoutSuccessUrl(email),
      cancelUrl: `${origin}/${locale}/plans`,
    });

    if (session.mock) {
      if (!appConfig.mockMode) {
        return NextResponse.json(
          { error: "Stripe is not configured" },
          { status: 503 }
        );
      }
      await grantProStatus({ uid, email });
    }

    return NextResponse.json({
      mock: session.mock,
      plan: "year",
      url: session.url,
      sessionId: "sessionId" in session ? session.sessionId : undefined,
      client_reference_id: affiliateRef,
    });
  } catch (error) {
    console.error("[checkout/embedded]", error);
    const message =
      error instanceof Error ? error.message : "Failed to create checkout session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
