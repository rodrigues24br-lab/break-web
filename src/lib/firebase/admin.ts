import { firestoreProFields } from "@/lib/config";

type AdminFirestore = {
  collection: (name: string) => {
    doc: (id: string) => {
      set: (
        data: Record<string, unknown>,
        options?: { merge?: boolean }
      ) => Promise<void>;
      get: () => Promise<{
        exists: boolean;
        data: () => Record<string, unknown> | undefined;
      }>;
    };
  };
};

let firestore: AdminFirestore | null = null;
let initAttempted = false;
const mockStore: Map<string, Record<string, unknown>> = new Map();

function hasAdminCredentials() {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
  );
}

export async function getAdminFirestore(): Promise<AdminFirestore | null> {
  if (firestore) return firestore;
  if (initAttempted) return firestore;
  initAttempted = true;

  if (!hasAdminCredentials()) {
    console.warn(
      "[firebase-admin] Missing credentials — using in-memory mock Firestore"
    );
    return null;
  }

  const { getApps, initializeApp, cert, getFirestore } = await import(
    "firebase-admin/app"
  ).then(async (appMod) => {
    const fsMod = await import("firebase-admin/firestore");
    return {
      getApps: appMod.getApps,
      initializeApp: appMod.initializeApp,
      cert: appMod.cert,
      getFirestore: fsMod.getFirestore,
    };
  });

  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
  }

  firestore = getFirestore() as unknown as AdminFirestore;
  return firestore;
}

export type ProGrantInput = {
  uid: string;
  email: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripeCheckoutSessionId?: string;
};

/**
 * Marks a user as Pro in Firestore.
 * Document: users/{uid}
 * Core fields: isPro=true, plan="pro", subscriptionStatus="active"
 */
export async function grantProStatus(input: ProGrantInput) {
  const payload = {
    email: input.email.toLowerCase().trim(),
    isPro: firestoreProFields.isPro,
    plan: firestoreProFields.plan,
    subscriptionStatus: firestoreProFields.subscriptionStatus,
    stripeCustomerId: input.stripeCustomerId ?? null,
    stripeSubscriptionId: input.stripeSubscriptionId ?? null,
    stripeCheckoutSessionId: input.stripeCheckoutSessionId ?? null,
    proUpdatedAt: new Date().toISOString(),
  };

  const db = await getAdminFirestore();
  if (!db) {
    mockStore.set(input.uid, payload);
    console.info("[mock-firestore] Pro granted", payload);
    return { mock: true, ...payload };
  }

  await db
    .collection(firestoreProFields.collection)
    .doc(input.uid)
    .set(payload, { merge: true });

  return { mock: false, ...payload };
}

export function getMockProStore() {
  return Object.fromEntries(mockStore.entries());
}
