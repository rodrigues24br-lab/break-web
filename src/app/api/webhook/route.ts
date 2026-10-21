import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import {
  getAdminWriteTarget,
  grantProStatus,
  isFirebaseAdminConfigured,
  isLikelyFirebaseUid,
  resolveUserForCheckout,
} from "@/lib/firebase/admin";
import type Stripe from "stripe";

export const runtime = "nodejs";

async function currentPeriodEndFromSubscription(
  stripe: Stripe,
  subscriptionId: string
): Promise<number | null> {
  try {
    const sub = await stripe.subscriptions.retrieve(subscriptionId);
    const rootEnd =
      "current_period_end" in sub &&
      typeof (sub as { current_period_end?: unknown }).current_period_end ===
        "number"
        ? (sub as { current_period_end: number }).current_period_end
        : null;
    // Stripe API 2025+ moved the period end onto subscription items.
    const itemEnd = sub.items?.data?.[0]?.current_period_end;
    const end = rootEnd ?? itemEnd ?? null;
    if (typeof end === "number" && Number.isFinite(end) && end > 0) {
      const currentPeriodEndMs = Math.round(end * 1000);
      console.info("[webhook] subscription current_period_end", {
        subscriptionId,
        currentPeriodEndUnix: end,
        currentPeriodEndMs,
      });
      return currentPeriodEndMs;
    }
    console.warn(
      "[webhook] subscription has no current_period_end; granting pro with null currentPeriodEnd",
      { subscriptionId }
    );
  } catch (err) {
    console.error(
      "[webhook] failed to retrieve subscription; granting pro with null currentPeriodEnd",
      subscriptionId,
      err
    );
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
  // metadata.uid and client_reference_id are candidates. Short FirstPromoter
  // tids fail the uid shape check inside resolveUserForCheckout.
  const metadataUid = session.metadata?.uid?.trim() || null;
  const metadataEmail = session.metadata?.email?.trim().toLowerCase() || null;
  const customerEmail =
    session.customer_details?.email?.trim().toLowerCase() ||
    session.customer_email?.trim().toLowerCase() ||
    null;
  // Auth email fallback uses the Stripe customer email, not a client-supplied body.
  const email = customerEmail || metadataEmail;

  if (customerEmail && metadataEmail && customerEmail !== metadataEmail) {
    console.warn(
      "[webhook] metadata.email differs from Stripe customer email; getUserByEmail uses the Stripe customer email",
      { sessionId: session.id, customerEmail, metadataEmail }
    );
  }

  console.info("[webhook] resolving user for checkout", {
    sessionId: session.id,
    metadataUid,
    email,
    emailSource: customerEmail
      ? "customer_details.email|customer_email"
      : metadataEmail
        ? "metadata.email"
        : null,
    client_reference_id: session.client_reference_id ?? null,
    metadataUidLooksLikeFirebaseUid: metadataUid
      ? isLikelyFirebaseUid(metadataUid)
      : false,
    clientReferenceLooksLikeFirebaseUid: session.client_reference_id
      ? isLikelyFirebaseUid(session.client_reference_id)
      : false,
  });

  const user = await resolveUserForCheckout({
    metadataUid,
    clientReferenceId: session.client_reference_id,
    email,
  });

  if (!user || !user.uid) {
    console.error(
      "[webhook] checkout.session.completed: refused — no confirmed Auth user or existing users doc (will not create an orphan)",
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

  let currentPeriodEndMs: number | null = null;
  if (!stripeSubscriptionId) {
    console.info(
      "[webhook] subscription-less checkout session; granting pro with null subscriptionId and currentPeriodEnd",
      { sessionId: session.id }
    );
  } else if (!stripe) {
    console.info(
      "[webhook] no Stripe client to retrieve subscription; granting pro with null currentPeriodEnd",
      { sessionId: session.id, subscriptionId: stripeSubscriptionId }
    );
  } else {
    currentPeriodEndMs = await currentPeriodEndFromSubscription(
      stripe,
      stripeSubscriptionId
    );
  }

  const grant = await grantProStatus({
    uid: user.uid,
    uidSource: user.source,
    email: user.email,
    stripeCustomerId,
    stripeSubscriptionId,
    stripeCheckoutSessionId: session.id,
    currentPeriodEnd: currentPeriodEndMs,
    authConfirmed: user.authConfirmed === true,
    requireAuthForCreate: true,
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
  const readBackMatches =
    grant.readBackMatches === true &&
    grant.verified?.plan === "pro" &&
    grant.verified?.isPro === true &&
    grant.verified?.status === "active" &&
    (grant.verified?.subscriptionId ?? null) === (stripeSubscriptionId ?? null) &&
    grant.verified?.currentPeriodEndMs === currentPeriodEndMs;
  const grantOk =
    readBackMatches &&
    typeof grant.writeTime === "string" &&
    grant.writeTime.length > 0 &&
    (grant.existedBefore === true || grant.authConfirmed === true);

  if (!grantOk) {
    console.error(
      "[webhook] Pro grant read-back did not match written plan/status/subscriptionId",
      {
        sessionId: session.id,
        projectId: writeTarget.projectId,
        databaseId: writeTarget.databaseId,
        docRef: { path: grant.path },
        existedBefore: grant.existedBefore,
        writeTime: grant.writeTime,
        authConfirmed: grant.authConfirmed,
        expected: {
          plan: "pro",
          status: "active",
          subscriptionId: stripeSubscriptionId ?? null,
          currentPeriodEndMs,
        },
        verified: grant.verified ?? null,
      }
    );
    throw new Error(
      "Pro grant read-back did not match written plan/status/subscriptionId"
    );
  }

  console.info("[webhook] Pro grant ok (Firestore)", {
    sessionId: session.id,
    path: grant.path,
    metadataUid,
    resolvedUid: user.uid,
    uid: user.uid,
    email: user.email,
    source: user.source,
    reason: user.reason ?? null,
    authUid: user.authUid ?? null,
    docExisted: user.docExisted ?? null,
    grantStub: user.grantStub ?? null,
    existedBefore: grant.existedBefore,
    docRefPath: grant.path,
    docRef: { path: grant.path },
    subscriptionId: stripeSubscriptionId ?? null,
    status: grant.verified?.status,
    currentPeriodEndMs,
    mock: false,
    readBackMatches: true,
    verifiedPlan: grant.verified?.plan,
    verifiedStatus: grant.verified?.status,
    verifiedSubscriptionId: grant.verified?.subscriptionId,
    verifiedIsPro: grant.verified?.isPro,
    writeTime: grant.writeTime,
    // Real Admin binding — compare projectId to Console (must be break-99b8e)
    projectId: writeTarget.projectId,
    appProjectId: writeTarget.projectId,
    appName: writeTarget.appName,
    databaseId: writeTarget.databaseId,
    clientEmail: writeTarget.clientEmail,
    expectedClientProjectId: writeTarget.expectedClientProjectId,
    projectMismatch: writeTarget.projectMismatch,
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
