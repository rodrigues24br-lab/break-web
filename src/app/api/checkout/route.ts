import { NextRequest, NextResponse } from "next/server";
import {
  buildCheckoutSuccessUrl,
  createAnnualCheckoutSession,
} from "@/lib/stripe";
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
      await grantProStatus({ uid, email });
    }

    return NextResponse.json({
      url: session.url,
      mock: session.mock,
      plan: "year",
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
