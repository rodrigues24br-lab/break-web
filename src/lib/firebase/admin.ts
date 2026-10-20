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
  "FIREBASE_SERVICE_ACCOUNT_KEY (JSON; private_key may use real newlines) or FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY";

/** Env names checked for a full service-account JSON blob (first match wins). */
const SERVICE_ACCOUNT_ENV_NAMES = [
  "FIREBASE_SERVICE_ACCOUNT_KEY",
  "FIREBASE_ADMIN_SDK",
  "FIREBASE_ADMIN_CREDENTIALS",
  "GOOGLE_SERVICE_ACCOUNT_JSON",
  "FIREBASE_ADMIN_KEY",
] as const;

function normalizePrivateKey(key: string): string {
  return key.replace(/\\n/g, "\n").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function stripServiceAccountJunk(raw: string): string {
  let s = raw.replace(/^\uFEFF/, "").trim();
  // Wrapping quotes from some env UIs
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim();
  }
  // Prefix junk e.g. serviceAccount={...}
  s = s.replace(/^serviceAccount\s*=\s*/i, "").trim();
  return s;
}

function certFromParsedObject(
  parsed: Record<string, unknown>,
  envName: string
): ServiceAccountCert | null {
  const projectId =
    (typeof parsed.project_id === "string" && parsed.project_id) ||
    (typeof parsed.projectId === "string" && parsed.projectId) ||
    "";
  const clientEmail =
    (typeof parsed.client_email === "string" && parsed.client_email) ||
    (typeof parsed.clientEmail === "string" && parsed.clientEmail) ||
    "";
  const privateKeyRaw =
    (typeof parsed.private_key === "string" && parsed.private_key) ||
    (typeof parsed.privateKey === "string" && parsed.privateKey) ||
    "";

  if (!projectId || !clientEmail || !privateKeyRaw) {
    console.error(
      `[firebase-admin] ${envName} JSON missing project_id / client_email / private_key`
    );
    return null;
  }

  return {
    projectId,
    clientEmail,
    privateKey: normalizePrivateKey(privateKeyRaw),
  };
}

/**
 * Escape literal newlines inside "private_key" / "privateKey" string values so
 * JSON.parse can succeed when the PEM was pasted with real line breaks (invalid JSON).
 */
function repairPrivateKeyLiteralNewlines(jsonText: string): string {
  return jsonText.replace(
    /("private_key"|"privateKey")\s*:\s*"([\s\S]*?)"(\s*[,}])/g,
    (match, key: string, body: string, tail: string) => {
      if (!/[\r\n]/.test(body)) return match;
      const escaped = body
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"')
        .replace(/\r\n/g, "\\n")
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\n");
      return `${key}: "${escaped}"${tail}`;
    }
  );
}

/** Last-resort: regex-extract fields when JSON remains unparsable. */
function extractCertViaRegex(text: string): ServiceAccountCert | null {
  const projectId =
    text.match(/"project_id"\s*:\s*"([^"]+)"/)?.[1] ||
    text.match(/"projectId"\s*:\s*"([^"]+)"/)?.[1] ||
    "";
  const clientEmail =
    text.match(/"client_email"\s*:\s*"([^"]+)"/)?.[1] ||
    text.match(/"clientEmail"\s*:\s*"([^"]+)"/)?.[1] ||
    "";
  const pem = text.match(
    /-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z0-9 ]*PRIVATE KEY-----/
  )?.[0];

  if (!projectId || !clientEmail || !pem) return null;

  return {
    projectId,
    clientEmail,
    privateKey: normalizePrivateKey(pem),
  };
}

/**
 * Prefer FIREBASE_SERVICE_ACCOUNT_KEY (full service-account JSON on Vercel).
 * Hardened for private_key pasted with real newlines (invalid JSON).
 */
function parseServiceAccountKey(
  raw: string,
  envName: string
): ServiceAccountCert | null {
  let jsonText = stripServiceAccountJunk(raw);
  if (!jsonText) return null;

  // Base64-encoded JSON (common when pasting into env UIs)
  if (!jsonText.startsWith("{")) {
    try {
      const decoded = Buffer.from(jsonText, "base64").toString("utf8");
      const stripped = stripServiceAccountJunk(decoded);
      if (stripped.startsWith("{")) {
        jsonText = stripped;
      }
    } catch {
      // keep original
    }
  }

  const tryParse = (text: string): ServiceAccountCert | null => {
    try {
      const parsed = JSON.parse(text) as Record<string, unknown>;
      return certFromParsedObject(parsed, envName);
    } catch {
      return null;
    }
  };

  // 1) As-is
  let certFields = tryParse(jsonText);
  if (certFields) return certFields;

  // 2) Repair literal newlines inside private_key PEM
  const repaired = repairPrivateKeyLiteralNewlines(jsonText);
  if (repaired !== jsonText) {
    certFields = tryParse(repaired);
    if (certFields) {
      console.info(
        `[firebase-admin] Parsed ${envName} after repairing private_key newlines`
      );
      return certFields;
    }
  }

  // 3) Regex extract project_id / client_email / PEM block
  certFields = extractCertViaRegex(jsonText);
  if (certFields) {
    console.info(
      `[firebase-admin] Parsed ${envName} via regex extract (invalid JSON shape)`
    );
    return certFields;
  }

  return null;
}

let cachedCert: ServiceAccountCert | null | undefined;
let cachedCertSource: string | null = null;

function resolveServiceAccountCert(): ServiceAccountCert | null {
  if (cachedCert !== undefined) return cachedCert;

  for (const envName of SERVICE_ACCOUNT_ENV_NAMES) {
    const bundled = process.env[envName];
    if (!bundled?.trim()) continue;

    const fromJson = parseServiceAccountKey(bundled, envName);
    if (fromJson) {
      cachedCert = fromJson;
      cachedCertSource = envName;
      console.info(`[firebase-admin] Using credentials from env ${envName}`);
      return fromJson;
    }

    console.error(
      `[firebase-admin] ${envName} present but invalid JSON (check private_key newlines)`
    );
  }

  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;
  if (projectId && clientEmail && privateKeyRaw) {
    cachedCert = {
      projectId,
      clientEmail,
      privateKey: normalizePrivateKey(privateKeyRaw),
    };
    cachedCertSource = "FIREBASE_PROJECT_ID+CLIENT_EMAIL+PRIVATE_KEY";
    console.info(
      "[firebase-admin] Using credentials from discrete FIREBASE_PROJECT_ID / CLIENT_EMAIL / PRIVATE_KEY"
    );
    return cachedCert;
  }

  cachedCert = null;
  cachedCertSource = null;
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
