import { firestoreProFields } from "@/lib/config";

type AdminDocSnapshot = {
  exists: boolean;
  id: string;
  data: () => Record<string, unknown> | undefined;
};

type AdminDocRef = {
  id: string;
  set: (
    data: Record<string, unknown>,
    options?: { merge?: boolean }
  ) => Promise<void>;
  get: () => Promise<AdminDocSnapshot>;
};

type AdminQuerySnapshot = {
  empty: boolean;
  docs: AdminDocSnapshot[];
};

type AdminCollection = {
  doc: (id: string) => AdminDocRef;
  where: (
    field: string,
    op: "==",
    value: unknown
  ) => {
    limit: (n: number) => {
      get: () => Promise<AdminQuerySnapshot>;
    };
  };
};

type AdminFirestore = {
  collection: (name: string) => AdminCollection;
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

export function isFirebaseAdminConfigured() {
  return hasAdminCredentials();
}

export async function getAdminFirestore(): Promise<AdminFirestore | null> {
  if (firestore) return firestore;
  if (initAttempted) return firestore;
  initAttempted = true;

  if (!hasAdminCredentials()) {
    console.warn(
      "[firebase-admin] Missing FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY — Admin unavailable"
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
  currentPeriodEnd?: string | null;
  /** When true, allow in-memory mock if Admin credentials are missing. */
  allowMock?: boolean;
};

export type ResolvedUser = {
  uid: string;
  email: string;
  source: "metadata.uid" | "email";
};

/**
 * Resolve Firestore user for a Stripe Checkout session.
 * Prefer metadata.uid (Firebase Auth), then email lookup.
 * Never treat FirstPromoter client_reference_id as a uid.
 */
export async function resolveUserForCheckout(params: {
  metadataUid?: string | null;
  email?: string | null;
}): Promise<ResolvedUser | null> {
  const email = params.email?.trim().toLowerCase() || null;
  const metadataUid = params.metadataUid?.trim() || null;

  const db = await getAdminFirestore();
  if (!db) {
    // Without Admin we can still resolve from metadata for callers that
    // will fail later if grant requires Admin — surface identity when known.
    if (metadataUid && email) {
      return { uid: metadataUid, email, source: "metadata.uid" };
    }
    if (metadataUid) {
      return {
        uid: metadataUid,
        email: email || "",
        source: "metadata.uid",
      };
    }
    return null;
  }

  const users = db.collection(firestoreProFields.collection);

  if (metadataUid) {
    const snap = await users.doc(metadataUid).get();
    const data = snap.exists ? snap.data() : undefined;
    const resolvedEmail =
      (typeof data?.email === "string" && data.email) || email || "";
    return {
      uid: metadataUid,
      email: resolvedEmail.toLowerCase().trim(),
      source: "metadata.uid",
    };
  }

  if (!email) return null;

  const query = await users.where("email", "==", email).limit(1).get();
  if (query.empty || !query.docs[0]) return null;

  const doc = query.docs[0];
  const data = doc.data();
  return {
    uid: doc.id,
    email:
      (typeof data?.email === "string" && data.email.toLowerCase().trim()) ||
      email,
    source: "email",
  };
}

/**
 * Marks a user as Pro in Firestore.
 * Document: users/{uid}
 * Core fields: isPro=true, plan="pro", subscriptionStatus="active"
 */
export async function grantProStatus(input: ProGrantInput) {
  const subscriptionId = input.stripeSubscriptionId ?? null;
  const currentPeriodEnd = input.currentPeriodEnd ?? null;

  const payload = {
    email: input.email.toLowerCase().trim(),
    isPro: firestoreProFields.isPro,
    plan: firestoreProFields.plan,
    // Canonical + aliases (iOS / web readers)
    subscriptionStatus: firestoreProFields.subscriptionStatus,
    status: firestoreProFields.subscriptionStatus,
    stripeCustomerId: input.stripeCustomerId ?? null,
    stripeSubscriptionId: subscriptionId,
    subscriptionId,
    stripeCheckoutSessionId: input.stripeCheckoutSessionId ?? null,
    currentPeriodEnd,
    proUpdatedAt: new Date().toISOString(),
  };

  const db = await getAdminFirestore();
  if (!db) {
    if (input.allowMock || process.env.NEXT_PUBLIC_MOCK_MODE === "true") {
      mockStore.set(input.uid, payload);
      console.info("[mock-firestore] Pro granted", { uid: input.uid, ...payload });
      return { mock: true as const, ...payload };
    }
    console.error(
      "[firebase-admin] Cannot grant Pro — Firebase Admin credentials missing",
      { uid: input.uid, email: input.email }
    );
    throw new Error(
      "Firebase Admin unavailable — set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY"
    );
  }

  await db
    .collection(firestoreProFields.collection)
    .doc(input.uid)
    .set(payload, { merge: true });

  console.info("[firebase-admin] Pro granted", {
    uid: input.uid,
    email: payload.email,
    subscriptionId,
    currentPeriodEnd,
  });

  return { mock: false as const, ...payload };
}

export function getMockProStore() {
  return Object.fromEntries(mockStore.entries());
}
