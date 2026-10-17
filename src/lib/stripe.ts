import Stripe from "stripe";
import { appConfig } from "@/lib/config";

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
  clientReferenceId?: string | null;
  successUrl: string;
  cancelUrl: string;
};

function resolveAnnualPriceId(): string | undefined {
  return (
    process.env.STRIPE_PRICE_ID_ANNUAL ||
    process.env.STRIPE_PRICE_ID ||
    undefined
  );
}

export function lineItemsAnnual(): Stripe.Checkout.SessionCreateParams.LineItem[] {
  const priceId = resolveAnnualPriceId();
  if (priceId) {
    return [{ price: priceId, quantity: 1 }];
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

export async function createAnnualCheckoutSession(
  params: CheckoutSessionParams
) {
  const client = getStripe();
  if (!client) {
    return {
      mock: true as const,
      plan: "year" as const,
      url: `${params.successUrl}${params.successUrl.includes("?") ? "&" : "?"}mock=1&plan=year&uid=${encodeURIComponent(params.uid)}&email=${encodeURIComponent(params.email)}`,
    };
  }

  const session = await client.checkout.sessions.create({
    mode: "subscription",
    customer_email: params.email,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    client_reference_id: params.clientReferenceId || undefined,
    metadata: {
      uid: params.uid,
      email: params.email,
      locale: params.locale,
      plan: "year",
    },
    subscription_data: {
      metadata: {
        uid: params.uid,
        email: params.email,
        plan: "year",
      },
    },
    line_items: lineItemsAnnual(),
  });

  return {
    mock: false as const,
    plan: "year" as const,
    url: session.url!,
    sessionId: session.id,
  };
}

/** @deprecated alias */
export const createPlanCheckoutSession = createAnnualCheckoutSession;
export const lineItemsForPlan = () => lineItemsAnnual();
