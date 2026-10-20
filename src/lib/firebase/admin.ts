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

type ServiceAccountCert = {
  projectId: string;
  clientEmail: string;
  privateKey: string;
};

let firestore: AdminFirestore | null = null;
let initAttempted = false;
const mockStore: Map<string, Record<string, unknown>> = new Map();

const ADMIN_ENV_HINT =
  "FIREBASE_SERVICE_ACCOUNT_KEY (JSON) or FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY";

/**
 * Prefer FIREBASE_SERVICE_ACCOUNT_KEY (full service-account JSON on Vercel).
 * Fall back to discrete FIREBASE_PROJECT_ID / CLIENT_EMAIL / PRIVATE_KEY.
 */
function parseServiceAccountKey(raw: string): ServiceAccountCert | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  let jsonText = trimmed;

  // Base64-encoded JSON (common when pasting into env UIs)
  if (!trimmed.startsWith("{")) {
    try {
      const decoded = Buffer.from(trimmed, "base64").toString("utf8").trim();
      if (decoded.startsWith("{")) {
        jsonText = decoded;
      }
    } catch {
      // keep original
    }
  }

  // Some dashboards store JSON with literal \n in private_key already escaped
  try {
    const parsed = JSON.parse(jsonText) as Record<string, unknown>;
    const projectId =
      (typeof parsed.project_id === "string" && parsed.project_id) ||
      (typeof parsed.projectId === "string" && parsed.projectId) ||
      "";
    const clientEmail =
      (typeof parsed.client_email === "string" && parsed.client_email) ||
      (typeof parsed.clientEmail === "string" && parsed.clientEmail) ||
      "";
    let privateKey =
      (typeof parsed.private_key === "string" && parsed.private_key) ||
      (typeof parsed.privateKey === "string" && parsed.privateKey) ||
      "";

    if (!projectId || !clientEmail || !privateKey) {
      console.error(
        "[firebase-admin] FIREBASE_SERVICE_ACCOUNT_KEY JSON missing project_id / client_email / private_key"
      );
      return null;
    }

    privateKey = privateKey.replace(/\\n/g, "\n");
    return { projectId, clientEmail, privateKey };
  } catch (err) {
    console.error(
      "[firebase-admin] Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY as JSON",
      err instanceof Error ? err.message : err
    );
    return null;
  }
}

function resolveServiceAccountCert(): ServiceAccountCert | null {
  const bundled = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (bundled) {
    const fromJson = parseServiceAccountKey(bundled);
    if (fromJson) return fromJson;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;
  if (projectId && clientEmail && privateKeyRaw) {
    return {
      projectId,
      clientEmail,
      privateKey: privateKeyRaw.replace(/\\n/g, "\n"),
    };
  }

  return null;
}

function hasAdminCredentials() {
  return resolveServiceAccountCert() !== null;
}

export function isFirebaseAdminConfigured() {
  return hasAdminCredentials();
}

export async function getAdminFirestore(): Promise<AdminFirestore | null> {
  if (firestore) return firestore;
  if (initAttempted) return firestore;
  initAttempted = true;

  const certFields = resolveServiceAccountCert();
  if (!certFields) {
    console.warn(
      `[firebase-admin] Missing credentials — set ${ADMIN_ENV_HINT}. Admin unavailable.`
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
        projectId: certFields.projectId,
        clientEmail: certFields.clientEmail,
        privateKey: certFields.privateKey,
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
      `Firebase Admin unavailable — set ${ADMIN_ENV_HINT}`
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
