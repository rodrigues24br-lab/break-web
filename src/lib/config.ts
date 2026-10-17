/**
 * Runtime config with mock-friendly fallbacks so the UI can boot without secrets.
 * Real Firebase / Stripe / FirstPromoter values are required for production flows.
 */

export const appConfig = {
  name: "Break",
  priceAnnualUsd: 49.99,
  priceAnnualCents: 4999,
  currency: "usd",
  appStoreUrl:
    process.env.NEXT_PUBLIC_APP_STORE_URL ||
    "https://apps.apple.com/app/break",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://127.0.0.1:4317",
  firstPromoterAccountId: process.env.NEXT_PUBLIC_FIRSTPROMOTER_ACCOUNT_ID || "",
  mockMode: process.env.NEXT_PUBLIC_MOCK_MODE === "true" || !process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
};

export const firebaseClientConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-api-key",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "demo.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-break-app",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "demo-break-app.appspot.com",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "000000000000",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:000000000000:web:demo",
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
