import { NextRequest, NextResponse } from "next/server";
import {
  getAdminProjectId,
  grantProStatus,
  isFirebaseAdminConfigured,
} from "@/lib/firebase/admin";

export const runtime = "nodejs";

/**
 * One-shot Pro grant write+read test.
 * Auth: Authorization: Bearer <PRO_GRANT_TEST_SECRET|CRON_SECRET>
 * Body (optional JSON): { "uid"?: string, "email"?: string }
 */
export async function POST(request: NextRequest) {
  const secret =
    process.env.PRO_GRANT_TEST_SECRET?.trim() ||
    process.env.CRON_SECRET?.trim();
  if (!secret) {
    return NextResponse.json(
      { error: "PRO_GRANT_TEST_SECRET (or CRON_SECRET) not configured" },
      { status: 503 }
    );
  }

  const auth = request.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const headerSecret = request.headers.get("x-pro-grant-test-secret")?.trim();
  if (token !== secret && headerSecret !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json(
      {
        error: "Firebase Admin not configured",
        hint: "Set FIREBASE_SERVICE_ACCOUNT_KEY on Vercel",
      },
      { status: 500 }
    );
  }

  let body: { uid?: string; email?: string } = {};
  try {
    body = (await request.json()) as { uid?: string; email?: string };
  } catch {
    body = {};
  }

  const uid =
    body.uid?.trim() || `webhook-test-${Date.now().toString(36)}`;
  const email =
    body.email?.trim().toLowerCase() || `${uid}@break-webhook-test.local`;

  try {
    const grant = await grantProStatus({
      uid,
      email,
      stripeSubscriptionId: "sub_test_pro_grant",
      stripeCheckoutSessionId: `cs_test_${uid}`,
      currentPeriodEnd: new Date(Date.now() + 365 * 864e5).toISOString(),
      allowMock: false,
    });

    if (grant.mock) {
      return NextResponse.json(
        {
          ok: false,
          error: "Grant returned mock — Firestore was not written",
          grant,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      path: grant.path,
      projectId: grant.projectId ?? getAdminProjectId(),
      uid,
      email,
      mock: false,
      verified: grant.verified,
      fields: {
        isPro: grant.isPro,
        plan: grant.plan,
        subscriptionStatus: grant.subscriptionStatus,
        status: grant.status,
        subscriptionId: grant.subscriptionId,
        currentPeriodEnd: grant.currentPeriodEnd,
      },
    });
  } catch (err) {
    console.error("[debug/pro-grant] failed", err);
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "grant failed",
        projectId: getAdminProjectId(),
        path: `users/${uid}`,
      },
      { status: 500 }
    );
  }
}
