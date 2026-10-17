import Stripe from "stripe";
import { appConfig, type PlanInterval } from "@/lib/config";

let stripe: Stripe | null = null;

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!stripe) {
    stripe = new Stripe(key);
  }
  return stripe;
}

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export type CheckoutSessionParams = {
  email: string;
  uid: string;
  locale: string;
  plan?: PlanInterval;
  clientReferenceId?: string | null;
  successUrl: string;
  cancelUrl: string;
};

function resolvePriceId(plan: PlanInterval): string | undefined {
  if (plan === "month") {
    return process.env.STRIPE_PRICE_ID_MONTHLY || undefined;
  }
  return (
    process.env.STRIPE_PRICE_ID_ANNUAL ||
    process.env.STRIPE_PRICE_ID ||
    undefined
  );
}

function lineItemsForPlan(
  plan: PlanInterval
): Stripe.Checkout.SessionCreateParams.LineItem[] {
  const priceId = resolvePriceId(plan);
  if (priceId) {
    return [{ price: priceId, quantity: 1 }];
  }
  if (plan === "month") {
    return [
      {
        quantity: 1,
        price_data: {
          currency: appConfig.currency,
          unit_amount: appConfig.priceMonthlyCents,
          recurring: { interval: "month" },
          product_data: {
            name: "Break Pro (Monthly)",
            description: "Monthly Break Pro subscription",
          },
        },
      },
    ];
  }
  return [
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
  ];
}

export async function createPlanCheckoutSession(
  params: CheckoutSessionParams
) {
  const plan: PlanInterval = params.plan === "month" ? "month" : "year";
  const client = getStripe();
  if (!client) {
    return {
      mock: true as const,
      plan,
      url: `${params.successUrl}${params.successUrl.includes("?") ? "&" : "?"}mock=1&plan=${plan}&uid=${encodeURIComponent(params.uid)}&email=${encodeURIComponent(params.email)}`,
    };
  }

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: "subscription",
    customer_email: params.email,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    client_reference_id: params.clientReferenceId || undefined,
    metadata: {
      uid: params.uid,
      email: params.email,
      locale: params.locale,
      plan,
    },
    subscription_data: {
      metadata: {
        uid: params.uid,
        email: params.email,
        plan,
      },
    },
    line_items: lineItemsForPlan(plan),
  };

  const session = await client.checkout.sessions.create(sessionParams);
  return {
    mock: false as const,
    plan,
    url: session.url!,
    sessionId: session.id,
  };
}

/** @deprecated Use createPlanCheckoutSession */
export async function createAnnualCheckoutSession(
  params: CheckoutSessionParams
) {
  return createPlanCheckoutSession({ ...params, plan: "year" });
}

export { lineItemsForPlan, resolvePriceId };
