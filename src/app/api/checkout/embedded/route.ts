import { NextRequest, NextResponse } from "next/server";
import {
  buildCheckoutSuccessUrl,
  createAnnualCheckoutSession,
} from "@/lib/stripe";
import { FPR_COOKIE, parseAffiliateRef } from "@/lib/firstpromoter";
import {
  CheckoutIdentityError,
  grantProStatus,
  resolveCheckoutBuyer,
} from "@/lib/firebase/admin";
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
      idToken?: string;
      referral?: string;
    };

    const locale =
      body.locale === "pt" || body.locale === "es" || body.locale === "en"
        ? body.locale
        : "en";

    const buyer = await resolveCheckoutBuyer({
      idToken: body.idToken,
      claimedUid: body.uid,
      claimedEmail: body.email,
    });
    const { email, uid } = buyer;

    const affiliateRef =
      parseAffiliateRef(request.cookies.get(FPR_COOKIE)?.value) ||
      parseAffiliateRef(request.headers.get("x-fpr-ref"));

    const origin = getRequestOrigin(request);

    const referral =
      typeof body.referral === "string" ? body.referral.trim() : "";

    console.info("[checkout/embedded] referral for Stripe session", {
      hasReferral: Boolean(referral),
      // uid stays in metadata; referral becomes client_reference_id when set
      uid,
    });

    const session = await createAnnualCheckoutSession({
      email,
      uid,
      locale,
      // FPR tid → metadata.fpr only. Rewardful referral → client_reference_id.
      clientReferenceId: affiliateRef,
      referral: referral || undefined,
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
      await grantProStatus({
        uid,
        email,
        uidSource: "idToken",
        allowMock: true,
      });
    }

    return NextResponse.json({
      mock: session.mock,
      plan: "year",
      url: session.url,
      sessionId: "sessionId" in session ? session.sessionId : undefined,
      // Echo what Stripe will use: Rewardful referral when present, else uid
      client_reference_id: referral || uid,
      hasReferral: Boolean(referral),
      fpr: affiliateRef,
    });
  } catch (error) {
    if (error instanceof CheckoutIdentityError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[checkout/embedded]", error);
    const message =
      error instanceof Error ? error.message : "Failed to create checkout session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
