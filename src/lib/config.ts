/**
 * Runtime config with mock-friendly fallbacks so the UI can boot without secrets.
 *
 * Vercel production (breakapplimit) currently sets these exact names:
 *   FIRSTPROMOTER_ACCOUNT_ID
 *   FIRSTPROMOTER_API_KEY
 *   STRIPE_WEBHOOK_SECRET
 *   STRIPE_SECRET_KEY
 *
 * Mock/demo UI is NOT tied to Firebase public keys. Demo banner is off unless
 * NEXT_PUBLIC_MOCK_MODE=true. Checkout still uses real Stripe when
 * STRIPE_SECRET_KEY is present (server-only).
 */

function hasLiveServerSecrets() {
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
      process.env.STRIPE_WEBHOOK_SECRET &&
      (process.env.FIRSTPROMOTER_ACCOUNT_ID ||
        process.env.NEXT_PUBLIC_FIRSTPROMOTER_ACCOUNT_ID)
  );
}

function hasFirebaseClientConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  );
}

/**
 * Client + server mock gate for UI / client auth simulation.
 * - Explicit `NEXT_PUBLIC_MOCK_MODE=true` → mock on
 * - Otherwise mock off (so Vercel demo banner stays hidden when the four
 *   server secrets are set and MOCK_MODE is unset)
 *
 * Note: STRIPE_* / FIRSTPROMOTER_* are server-only and are not visible in the
 * browser bundle — do not gate the client banner on them.
 */
export const isMockMode = process.env.NEXT_PUBLIC_MOCK_MODE === "true";

/** Server-side: live Stripe + FirstPromoter secrets present (Vercel names). */
export const hasProductionSecrets = hasLiveServerSecrets();

export const appConfig = {
  name: "Break",
  /** Annual Pro — web price */
  priceAnnualUsd: 49.99,
  priceAnnualCents: 4999,
  /**
   * Annual Stripe Price ID: STRIPE_PRICE_ID_ANNUAL (or legacy STRIPE_PRICE_ID).
   * Defaults to price_1UQFdLBMIFugty3a7b54OLdG (Break Pro annual).
   */
  currency: "usd",
  appStoreUrl:
    process.env.NEXT_PUBLIC_APP_STORE_URL ||
    "https://apps.apple.com/us/app/break-app-limit/id6811685502",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://127.0.0.1:3000",
  /**
   * Post-checkout landing. Production defaults to breakapplimit.com/success;
   * local SITE_URL used only for localhost / 127.0.0.1.
   */
  checkoutSuccessBaseUrl: (() => {
    const site = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
    if (/localhost|127\.0\.0\.1/.test(site)) {
      return `${site}/success`;
    }
    return "https://breakapplimit.com/success";
  })(),
  /**
   * FirstPromoter company id (cid). Prefer Vercel name FIRSTPROMOTER_ACCOUNT_ID;
   * fall back to NEXT_PUBLIC_* for local.
   */
  firstPromoterAccountId:
    process.env.FIRSTPROMOTER_ACCOUNT_ID ||
    process.env.NEXT_PUBLIC_FIRSTPROMOTER_ACCOUNT_ID ||
    "p7zpnc3j",
  /** Server-only FirstPromoter API key (Vercel name). */
  firstPromoterApiKey: process.env.FIRSTPROMOTER_API_KEY || "",
  mockMode: isMockMode,
  firebaseReady: hasFirebaseClientConfig(),
  productionSecretsReady: hasProductionSecrets,
};

/** Firebase web project break-99b8e — public client config (domain-restricted). */
export const firebaseClientConfig: {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
} = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyC2XKYhnSRpSpHlQB-KbkRnUbyFqtq8Yw4",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "break-99b8e.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "break-99b8e",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "break-99b8e.firebasestorage.app",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "723058574787",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    "1:723058574787:web:8b4007d7a46c33dc42e976",
  ...(process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
    ? { measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID }
    : { measurementId: "G-865KC28F75" }),
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
 *   status: "active" (alias)
 *   email: string
 *   stripeCustomerId?: string
 *   stripeSubscriptionId?: string
 *   subscriptionId?: string (alias)
 *   stripeCheckoutSessionId?: string
 *   currentPeriodEnd?: ISO string
 *   proUpdatedAt: ISO string
 */
export const firestoreProFields = {
  collection: "users",
  isPro: true as const,
  plan: "pro" as const,
  subscriptionStatus: "active" as const,
};
