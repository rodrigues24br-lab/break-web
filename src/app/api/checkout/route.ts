import { NextRequest, NextResponse } from "next/server";
import { createPlanCheckoutSession } from "@/lib/stripe";
import { type PlanInterval } from "@/lib/config";
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
      plan?: string;
      idToken?: string;
    };

    const email = body.email?.trim().toLowerCase();
    const uid = body.uid?.trim();
    const locale =
      body.locale === "pt" || body.locale === "es" || body.locale === "en"
        ? body.locale
        : "en";
    const plan: PlanInterval = body.plan === "month" ? "month" : "year";

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

    const successUrl = `${origin}/${locale}/success?session_id={CHECKOUT_SESSION_ID}&plan=${plan}`;
    const cancelUrl = `${origin}/${locale}/plans`;

    const session = await createPlanCheckoutSession({
      email,
      uid,
      locale,
      plan,
      clientReferenceId: affiliateRef,
      successUrl,
      cancelUrl,
    });

    if (session.mock) {
      await grantProStatus({ uid, email });
    }

    return NextResponse.json({
      url: session.url,
      mock: session.mock,
      plan,
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
