import Stripe from "stripe";
import { appConfig } from "@/lib/config";

let stripe: Stripe | null = null;

/** Hosted Checkout success_url → breakapplimit.com/success (or local SITE_URL). */
export function buildCheckoutSuccessUrl(email: string): string {
  const base = appConfig.checkoutSuccessBaseUrl.replace(/\/$/, "");
  const params = new URLSearchParams({
    plan: "year",
    email: email.trim().toLowerCase(),
  });
  // Stripe replaces the literal template token (must not be URL-encoded).
  return `${base}?session_id={CHECKOUT_SESSION_ID}&${params.toString()}`;
}

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
  /** Auth email. Stored as customer_email unless an existing customer matches it. */
  email: string;
  uid: string;
  locale: string;
  clientReferenceId?: string | null;
  /** Existing Stripe customer. Used only when that customer's email matches `email`. */
  customerId?: string | null;
  /** Rewardful referral UUID — stored in session/subscription metadata.referral only. */
  referral?: string | null;
  successUrl: string;
  cancelUrl: string;
};

/** Break Pro annual Price ID (Stripe Dashboard). */
export const BREAK_PRO_ANNUAL_PRICE_ID = "price_1UQFdLBMIFugty3a7b54OLdG";

function resolveAnnualPriceId(): string {
  return (
    process.env.STRIPE_PRICE_ID_ANNUAL ||
    process.env.STRIPE_PRICE_ID ||
    BREAK_PRO_ANNUAL_PRICE_ID
  );
}

export function lineItemsAnnual(): Stripe.Checkout.SessionCreateParams.LineItem[] {
  return [{ price: resolveAnnualPriceId(), quantity: 1 }];
}

export async function createAnnualCheckoutSession(
  params: CheckoutSessionParams
) {
  const client = getStripe();
  if (!client) {
    // Simulated checkout only when explicitly in mock mode — never on live.
    if (process.env.NEXT_PUBLIC_MOCK_MODE === "true") {
      return {
        mock: true as const,
        plan: "year" as const,
        url: `${params.successUrl}${params.successUrl.includes("?") ? "&" : "?"}mock=1&plan=year&uid=${encodeURIComponent(params.uid)}&email=${encodeURIComponent(params.email)}`,
      };
    }
    throw new Error(
      "Stripe is not configured (set STRIPE_SECRET_KEY on the server)"
    );
  }

  // client_reference_id = Firebase uid (never FirstPromoter tid).
  // Affiliate / FPR tid stays in metadata only for Stripe + FirstPromoter.
  const affiliateTid = params.clientReferenceId?.trim() || undefined;
  const referral = params.referral?.trim() || undefined;
  const authEmail = params.email.trim().toLowerCase();

  // Stripe rejects customer + customer_email together. Prefer customer_email
  // unless the given customer id already belongs to this Auth email.
  let stripeCustomerId: string | undefined;
  const requestedCustomerId = params.customerId?.trim() || "";
  if (requestedCustomerId) {
    const customer = await client.customers.retrieve(requestedCustomerId);
    const customerEmail =
      !customer.deleted && typeof customer.email === "string"
        ? customer.email.trim().toLowerCase()
        : null;
    if (customerEmail && customerEmail === authEmail) {
      stripeCustomerId = requestedCustomerId;
    } else {
      console.warn(
        "[checkout] Stripe customer email does not match Auth email; using customer_email",
        {
          customerId: requestedCustomerId,
          customerEmail,
          authEmail,
        }
      );
    }
  }

  const session = await client.checkout.sessions.create({
    mode: "subscription",
    ...(stripeCustomerId
      ? { customer: stripeCustomerId }
      : { customer_email: authEmail }),
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    client_reference_id: params.uid,
    metadata: {
      uid: params.uid,
      email: authEmail,
      locale: params.locale,
      plan: "year",
      ...(affiliateTid
        ? { fpr: affiliateTid, affiliateRef: affiliateTid }
        : {}),
      ...(referral ? { referral } : {}),
    },
    subscription_data: {
      metadata: {
        uid: params.uid,
        email: authEmail,
        plan: "year",
        ...(affiliateTid
          ? { fpr: affiliateTid, affiliateRef: affiliateTid }
          : {}),
        ...(referral ? { referral } : {}),
      },
    },
    line_items: lineItemsAnnual(),
  });

  if (!session.url) {
    throw new Error("Stripe Checkout session missing url");
  }

  return {
    mock: false as const,
    plan: "year" as const,
    url: session.url,
    sessionId: session.id,
  };
}

/** @deprecated alias */
export const createPlanCheckoutSession = createAnnualCheckoutSession;
export const lineItemsForPlan = () => lineItemsAnnual();
