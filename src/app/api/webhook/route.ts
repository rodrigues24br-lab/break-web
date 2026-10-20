import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import {
  getAdminWriteTarget,
  grantProStatus,
  isFirebaseAdminConfigured,
  resolveUserForCheckout,
} from "@/lib/firebase/admin";
import type Stripe from "stripe";

export const runtime = "nodejs";

async function currentPeriodEndFromSubscription(
  stripe: Stripe,
  subscriptionId: string | null | undefined
): Promise<string | null> {
  if (!subscriptionId) return null;
  try {
    const sub = await stripe.subscriptions.retrieve(subscriptionId);
    // Stripe API 2025+: period end lives on subscription items (not the Subscription root).
    const itemEnd = sub.items?.data?.[0]?.current_period_end;
    const rootEnd =
      "current_period_end" in sub &&
      typeof (sub as { current_period_end?: unknown }).current_period_end ===
        "number"
        ? (sub as { current_period_end: number }).current_period_end
        : null;
    const end = itemEnd ?? rootEnd;
    if (end) {
      return new Date(end * 1000).toISOString();
    }
  } catch (err) {
    console.error("[webhook] failed to retrieve subscription", subscriptionId, err);
  }
  return null;
}

async function handleCheckoutCompleted(
  session: {
    id?: string;
    metadata?: { uid?: string; email?: string } | null;
    customer?: string | { id?: string } | null;
    subscription?: string | { id?: string } | null;
    customer_email?: string | null;
    customer_details?: { email?: string | null } | null;
    client_reference_id?: string | null;
  },
  stripe: Stripe | null,
  options?: { allowMock?: boolean }
) {
  // Never treat FirstPromoter tid (client_reference_id) as a Firebase uid.
  const metadataUid = session.metadata?.uid?.trim() || null;
  const email =
    session.metadata?.email ||
    session.customer_details?.email ||
    session.customer_email ||
    null;

  if (session.client_reference_id && !metadataUid) {
    console.warn(
      "[webhook] ignoring client_reference_id as uid (likely FirstPromoter tid)",
      {
        sessionId: session.id,
        client_reference_id: session.client_reference_id,
      }
    );
  }

  console.info("[webhook] resolving user for checkout", {
    sessionId: session.id,
    metadataUid,
    email,
    client_reference_id: session.client_reference_id,
    expectedUidHint: "1PrC18HWGRVQLSGp24AGSvPHiP2",
    metadataUidMatchesExpected:
      metadataUid === "1PrC18HWGRVQLSGp24AGSvPHiP2",
  });

  const user = await resolveUserForCheckout({
    metadataUid,
    email,
  });

  if (!user || !user.uid) {
    console.error(
      "[webhook] checkout.session.completed: user not found (no metadata.uid and no Firestore email match)",
      {
        sessionId: session.id,
        metadataUid,
        email,
        client_reference_id: session.client_reference_id,
      }
    );
    throw new Error("User not found for checkout session");
  }

  if (!user.email) {
    console.error(
      "[webhook] checkout.session.completed: resolved uid but missing email",
      { sessionId: session.id, uid: user.uid, source: user.source }
    );
    throw new Error("Email missing for checkout session user");
  }

  const stripeCustomerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer && typeof session.customer === "object"
        ? session.customer.id
        : undefined;

  const stripeSubscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription && typeof session.subscription === "object"
        ? session.subscription.id
        : undefined;

  const currentPeriodEnd = stripe
    ? await currentPeriodEndFromSubscription(stripe, stripeSubscriptionId)
    : null;

  const grant = await grantProStatus({
    uid: user.uid,
    email: user.email,
    stripeCustomerId,
    stripeSubscriptionId,
    stripeCheckoutSessionId: session.id,
    currentPeriodEnd,
    // Signed Stripe webhooks never allow mock. Local unsigned mock may.
    allowMock: options?.allowMock === true,
  });

  if (grant.mock) {
    console.error("[webhook] Pro grant was IN-MEMORY MOCK — not written to Firestore", {
      sessionId: session.id,
      path: grant.path,
      uid: user.uid,
      mock: true,
    });
    // Local mock path may ACK with mock:true; signed path must not reach here.
    if (!options?.allowMock) {
      throw new Error("Pro grant used in-memory mock; refusing to ACK as success");
    }
    return { mock: true as const, grant, user };
  }

  const writeTarget = grant.writeTarget ?? getAdminWriteTarget();
  console.info("[webhook] Pro grant ok (Firestore)", {
    sessionId: session.id,
    path: grant.path,
    uid: user.uid,
    email: user.email,
    source: user.source,
    subscriptionId: stripeSubscriptionId,
    currentPeriodEnd,
    mock: false,
    verifiedPlan: grant.verified?.plan,
    verifiedIsPro: grant.verified?.isPro,
    // Real Admin binding — compare projectId to Console (must be break-99b8e)
    projectId: writeTarget.projectId,
    appName: writeTarget.appName,
    databaseId: writeTarget.databaseId,
    clientEmail: writeTarget.clientEmail,
    expectedClientProjectId: writeTarget.expectedClientProjectId,
    projectMismatch: writeTarget.projectMismatch,
    uidMatchesExpectedUser: user.uid === "1PrC18HWGRVQLSGp24AGSvPHiP2",
  });
  return { mock: false as const, grant, user };
}

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    // Local / mock: accept JSON payloads that look like checkout.session.completed
    try {
      const body = (await request.json()) as {
        type?: string;
        data?: {
          object?: {
            metadata?: { uid?: string; email?: string };
            customer?: string;
            subscription?: string;
            id?: string;
            customer_email?: string;
            customer_details?: { email?: string | null };
            client_reference_id?: string;
          };
        };
      };

      if (body.type === "checkout.session.completed" && body.data?.object) {
        // Unsigned / no Stripe secrets: only for local mock. Never silent success.
        if (process.env.NEXT_PUBLIC_MOCK_MODE !== "true") {
          return NextResponse.json(
            { error: "Stripe webhook not configured" },
            { status: 503 }
          );
        }
        try {
          const result = await handleCheckoutCompleted(
            body.data.object,
            null,
            { allowMock: true }
          );
          return NextResponse.json({
            received: true,
            mock: true,
            path: result.grant.path,
            uid: result.user.uid,
          });
        } catch (err) {
          console.error("[webhook] local mock path grant failed", err);
          return NextResponse.json(
            {
              error:
                err instanceof Error ? err.message : "Pro grant failed",
            },
            { status: 500 }
          );
        }
      }
      return NextResponse.json(
        { error: "Stripe not configured and payload not usable" },
        { status: 400 }
      );
    } catch {
      return NextResponse.json(
        { error: "Stripe webhook not configured" },
        { status: 503 }
      );
    }
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("[webhook] signature", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    if (!isFirebaseAdminConfigured()) {
      console.error(
        "[webhook] Firebase Admin not configured — refusing to ACK so Stripe will retry. Set FIREBASE_SERVICE_ACCOUNT_KEY (JSON) or FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY on Vercel."
      );
      return NextResponse.json(
        { error: "Firebase Admin unavailable" },
        { status: 500 }
      );
    }

    try {
      await handleCheckoutCompleted(session, stripe);
    } catch (err) {
      console.error("[webhook] Pro grant failed — returning 500 for Stripe retry", err);
      return NextResponse.json(
        {
          error: err instanceof Error ? err.message : "Pro grant failed",
        },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}
