/**
 * Runtime config with mock-friendly fallbacks so the UI can boot without secrets.
 * Real Firebase / Stripe / FirstPromoter values are required for production flows.
 */

function hasFirebaseClientConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  );
}

/** Explicit mock, or incomplete Firebase client config → mock auth/checkout. */
export const isMockMode =
  process.env.NEXT_PUBLIC_MOCK_MODE === "true" || !hasFirebaseClientConfig();

export const appConfig = {
  name: "Break",
  /** Annual Pro — web price */
  priceAnnualUsd: 49.99,
  priceAnnualCents: 4999,
  /**
   * Override Stripe Price ID via STRIPE_PRICE_ID_ANNUAL (or legacy STRIPE_PRICE_ID).
   * If empty, Checkout uses inline $49.99/year price_data.
   */
  currency: "usd",
  appStoreUrl:
    process.env.NEXT_PUBLIC_APP_STORE_URL ||
    "https://apps.apple.com/app/break",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://127.0.0.1:3000",
  firstPromoterAccountId:
    process.env.NEXT_PUBLIC_FIRSTPROMOTER_ACCOUNT_ID || "p7zpnc3j",
  mockMode: isMockMode,
  firebaseReady: hasFirebaseClientConfig(),
};

export const firebaseClientConfig: {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
} = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-api-key",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "demo.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-break-app",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "demo-break-app.appspot.com",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "000000000000",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:000000000000:web:demo",
  ...(process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
    ? { measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID }
    : {}),
};

/**
 * Firestore Pro schema (native iOS reads this on login — do not rename fields lightly).
 *
 * Collection: `users`
 * Document ID: Firebase Auth `uid`
 *
 * Fields written on successful Stripe payment:
 *   isPro: true
 *   plan: "pro"
 *   subscriptionStatus: "active"
 *   email: string
 *   stripeCustomerId?: string
 *   stripeSubscriptionId?: string
 *   stripeCheckoutSessionId?: string
 *   proUpdatedAt: ISO string
 */
export const firestoreProFields = {
  collection: "users",
  isPro: true as const,
  plan: "pro" as const,
  subscriptionStatus: "active" as const,
};
