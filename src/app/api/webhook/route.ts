import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { grantProStatus } from "@/lib/firebase/admin";
import type Stripe from "stripe";

export const runtime = "nodejs";

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
            client_reference_id?: string;
          };
        };
      };

      if (body.type === "checkout.session.completed" && body.data?.object) {
        const obj = body.data.object;
        const uid = obj.metadata?.uid;
        const email = obj.metadata?.email || obj.customer_email;
        if (uid && email) {
          await grantProStatus({
            uid,
            email,
            stripeCustomerId:
              typeof obj.customer === "string" ? obj.customer : undefined,
            stripeSubscriptionId:
              typeof obj.subscription === "string"
                ? obj.subscription
                : undefined,
            stripeCheckoutSessionId: obj.id,
          });
          return NextResponse.json({ received: true, mock: true });
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
    const uid = session.metadata?.uid;
    const email =
      session.metadata?.email ||
      session.customer_details?.email ||
      session.customer_email;

    if (uid && email) {
      await grantProStatus({
        uid,
        email,
        stripeCustomerId:
          typeof session.customer === "string" ? session.customer : undefined,
        stripeSubscriptionId:
          typeof session.subscription === "string"
            ? session.subscription
            : undefined,
        stripeCheckoutSessionId: session.id,
      });
    } else {
      console.warn(
        "[webhook] checkout.session.completed missing uid/email",
        session.id
      );
    }
  }

  return NextResponse.json({ received: true });
}
