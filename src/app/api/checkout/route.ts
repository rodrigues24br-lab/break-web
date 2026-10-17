import { NextRequest, NextResponse } from "next/server";
import { createAnnualCheckoutSession } from "@/lib/stripe";
import { FPR_COOKIE, parseAffiliateRef } from "@/lib/firstpromoter";
import { grantProStatus } from "@/lib/firebase/admin";
import { getRequestOrigin } from "@/lib/request-origin";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      email?: string;
      uid?: string;
      locale?: string;
      idToken?: string;
    };

    const email = body.email?.trim().toLowerCase();
    const uid = body.uid?.trim();
    const locale = body.locale === "pt" ? "pt" : "es";

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

    const successUrl = `${origin}/${locale}/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/${locale}/checkout`;

    const session = await createAnnualCheckoutSession({
      email,
      uid,
      locale,
      clientReferenceId: affiliateRef,
      successUrl,
      cancelUrl,
    });

    // Mock path: grant Pro immediately so confirmation works without Stripe.
    if (session.mock) {
      await grantProStatus({ uid, email });
    }

    return NextResponse.json({
      url: session.url,
      mock: session.mock,
      client_reference_id: affiliateRef,
    });
  } catch (error) {
    console.error("[checkout]", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
