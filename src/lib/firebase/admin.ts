import { firestoreProFields } from "@/lib/config";
import {
  chooseProGrantTarget,
  looksLikeGrantStub,
  type CandidateOrigin,
  type CandidateView,
  type EmailHit,
  type UidSource,
} from "@/lib/firebase/resolve-pro-target";

type AdminDocSnapshot = {
  exists: boolean;
  id: string;
  data: () => Record<string, unknown> | undefined;
};

type AdminWriteResult = {
  writeTime?: { toDate?: () => Date };
};

type AdminDocRef = {
  id: string;
  path: string;
  set: (
    data: Record<string, unknown>,
    options?: { merge?: boolean }
  ) => Promise<AdminWriteResult | void>;
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
  /** Live database id from the Admin Firestore client (`(default)` or a named DB). */
  databaseId?: string;
};

type AdminAuthUser = {
  uid: string;
  email?: string;
};

type AdminAuth = {
  verifyIdToken: (idToken: string) => Promise<AdminAuthUser>;
  getUser: (uid: string) => Promise<AdminAuthUser>;
  getUserByEmail: (email: string) => Promise<AdminAuthUser>;
};

type ServiceAccountCert = {
  projectId: string;
  clientEmail: string;
  privateKey: string;
};

let firestore: AdminFirestore | null = null;
let initAttempted = false;
let activeProjectId: string | null = null;
let activeAppName: string | null = null;
let activeDatabaseId: string | null = null;
let activeClientEmail: string | null = null;
const mockStore: Map<string, Record<string, unknown>> = new Map();

function expectedClientProjectId(): string {
  return (
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() ||
    process.env.FIREBASE_PROJECT_ID?.trim() ||
    "break-99b8e"
  );
}

function isProductionRuntime(): boolean {
  return (
    process.env.VERCEL_ENV === "production" ||
    process.env.NODE_ENV === "production"
  );
}

export function getAdminProjectId(): string | null {
  return activeProjectId ?? resolveServiceAccountCert()?.projectId ?? null;
}

/** Real Admin binding used for writes (not an env guess). */
export function getAdminWriteTarget(): {
  projectId: string | null;
  appName: string | null;
  databaseId: string | null;
  clientEmail: string | null;
  expectedClientProjectId: string;
  projectMismatch: boolean;
} {
  const projectId = getAdminProjectId();
  const expected = expectedClientProjectId();
  return {
    projectId,
    appName: activeAppName,
    databaseId: activeDatabaseId,
    clientEmail: activeClientEmail,
    expectedClientProjectId: expected,
    projectMismatch: Boolean(projectId && projectId !== expected),
  };
}

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

  // 1) Valid JSON as-is (private_key already uses \n escapes)
  let certFields = tryParse(jsonText);
  if (certFields) return certFields;

  // 2) User-requested: replace literal \n sequences with real newlines, then parse.
  //    Often needed when the whole JSON blob was stored single-line with \n markers.
  //    If this breaks private_key strings, step 3 repairs them.
  const withRealNewlines = jsonText.replace(/\\n/g, "\n");
  certFields = tryParse(withRealNewlines);
  if (certFields) {
    console.info(
      `[firebase-admin] Parsed ${envName} after \\n → newline pre-parse`
    );
    return certFields;
  }

  // 3) Repair literal newlines inside private_key PEM (invalid JSON strings)
  const repaired = repairPrivateKeyLiteralNewlines(withRealNewlines);
  if (repaired !== withRealNewlines) {
    certFields = tryParse(repaired);
    if (certFields) {
      console.info(
        `[firebase-admin] Parsed ${envName} after repairing private_key newlines`
      );
      return certFields;
    }
  }

  // 4) Regex extract project_id / client_email / PEM block
  certFields =
    extractCertViaRegex(withRealNewlines) || extractCertViaRegex(jsonText);
  if (certFields) {
    console.info(
      `[firebase-admin] Parsed ${envName} via regex extract (invalid JSON shape)`
    );
    return certFields;
  }

  return null;
}

let cachedCert: ServiceAccountCert | null | undefined;

function resolveServiceAccountCert(): ServiceAccountCert | null {
  if (cachedCert !== undefined) return cachedCert;

  for (const envName of SERVICE_ACCOUNT_ENV_NAMES) {
    const bundled = process.env[envName];
    if (!bundled?.trim()) continue;

    const fromJson = parseServiceAccountKey(bundled, envName);
    if (fromJson) {
      cachedCert = fromJson;
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
    console.info(
      "[firebase-admin] Using credentials from discrete FIREBASE_PROJECT_ID / CLIENT_EMAIL / PRIVATE_KEY"
    );
    return cachedCert;
  }

  cachedCert = null;
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

  const certFields = resolveServiceAccountCert();
  if (!certFields) {
    console.warn(
      `[firebase-admin] Missing credentials — set ${ADMIN_ENV_HINT}. Admin unavailable.`
    );
    initAttempted = true;
    return null;
  }

  const expected = expectedClientProjectId();
  if (certFields.projectId !== expected) {
    console.warn(
      `[firebase-admin] Service account projectId=${certFields.projectId} differs from client expected=${expected} — writes may land in a different Firebase project than the Console you are viewing`
    );
  }

  try {
    const { getApps, getApp, initializeApp, deleteApp, cert, getFirestore } =
      await import("firebase-admin/app").then(async (appMod) => {
        const fsMod = await import("firebase-admin/firestore");
        return {
          getApps: appMod.getApps,
          getApp: appMod.getApp,
          initializeApp: appMod.initializeApp,
          deleteApp: appMod.deleteApp,
          cert: appMod.cert,
          getFirestore: fsMod.getFirestore,
        };
      });

    // Never reuse a warm app unless it is already bound to this cert's projectId.
    // Missing projectId on a warm app is treated as unsafe → delete + re-init.
    for (const existing of getApps()) {
      const existingProject =
        (existing.options.projectId as string | undefined) || null;
      if (existingProject !== certFields.projectId) {
        console.warn(
          `[firebase-admin] Deleting warm app name=${existing.name} projectId=${existingProject ?? "(missing)"} to re-init as ${certFields.projectId}`
        );
        await deleteApp(existing);
      }
    }

    if (!getApps().length) {
      initializeApp({
        credential: cert({
          projectId: certFields.projectId,
          clientEmail: certFields.clientEmail,
          privateKey: certFields.privateKey,
        }),
        projectId: certFields.projectId,
      });
    }

    const app = getApp();
    // Prefer the initialized app's own options — this is the project writes hit.
    const appProjectId = app.options.projectId as string | undefined;
    if (!appProjectId) {
      throw new Error(
        "Admin app.options.projectId is missing after initializeApp — refusing to write"
      );
    }
    if (appProjectId !== certFields.projectId) {
      throw new Error(
        `Admin app projectId=${appProjectId} != cert projectId=${certFields.projectId}`
      );
    }

    activeProjectId = appProjectId;
    activeAppName = app.name;
    activeClientEmail = certFields.clientEmail;

    // Optional named DB (default "(default)"). Set FIRESTORE_DATABASE_ID if iOS uses one.
    const databaseId =
      process.env.FIRESTORE_DATABASE_ID?.trim() || "(default)";
    firestore = (
      databaseId === "(default)"
        ? getFirestore(app)
        : getFirestore(app, databaseId)
    ) as unknown as AdminFirestore;

    const instanceDatabaseId = firestore.databaseId ?? null;
    if (instanceDatabaseId && instanceDatabaseId !== databaseId) {
      console.warn(
        "[firebase-admin] Firestore instance databaseId differs from requested database",
        { instanceDatabaseId, requested: databaseId }
      );
    }
    activeDatabaseId = instanceDatabaseId || databaseId;

    initAttempted = true;
    console.info("[firebase-admin] Firestore ready", {
      projectId: activeProjectId,
      appName: activeAppName,
      databaseId: activeDatabaseId,
      certProjectId: certFields.projectId,
      expectedClientProjectId: expected,
      clientEmail: certFields.clientEmail,
      projectMismatch: activeProjectId !== expected,
    });
    return firestore;
  } catch (err) {
    // Allow retry on next request instead of permanently sticking on null.
    initAttempted = false;
    firestore = null;
    activeProjectId = null;
    activeAppName = null;
    activeDatabaseId = null;
    activeClientEmail = null;
    console.error("[firebase-admin] Failed to initialize Admin SDK", err);
    throw err;
  }
}

function authErrorCode(err: unknown): string | null {
  if (typeof err === "object" && err !== null && "code" in err) {
    const code = (err as { code?: unknown }).code;
    return typeof code === "string" ? code : null;
  }
  return null;
}

function liveFirestoreDatabaseId(db: AdminFirestore): string | null {
  const fromInstance = db.databaseId;
  if (typeof fromInstance === "string" && fromInstance.length > 0) {
    return fromInstance;
  }
  return activeDatabaseId;
}

export async function getAdminAuth(): Promise<AdminAuth | null> {
  const db = await getAdminFirestore();
  if (!db) return null;
  const [{ getAuth }, { getApp }] = await Promise.all([
    import("firebase-admin/auth"),
    import("firebase-admin/app"),
  ]);
  return getAuth(getApp()) as unknown as AdminAuth;
}

export class CheckoutIdentityError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "CheckoutIdentityError";
    this.status = status;
  }
}

/**
 * Checkout must not trust uid/email from the request body.
 * The Stripe session uid is the Firebase Auth uid inside a verified idToken.
 */
export async function resolveCheckoutBuyer(input: {
  idToken?: string | null;
  claimedUid?: string | null;
  claimedEmail?: string | null;
}): Promise<{ uid: string; email: string }> {
  const claimedUid = input.claimedUid?.trim() || null;
  const claimedEmail = input.claimedEmail?.trim().toLowerCase() || null;
  const idToken = input.idToken?.trim() || null;
  const allowUnverifiedMock =
    process.env.NEXT_PUBLIC_MOCK_MODE === "true" && !isProductionRuntime();

  if (allowUnverifiedMock) {
    if (!claimedUid || !claimedEmail) {
      throw new CheckoutIdentityError("email and uid are required", 400);
    }
    if (idToken?.startsWith("mock-token:")) {
      const tokenUid = idToken.slice("mock-token:".length);
      if (tokenUid !== claimedUid) {
        throw new CheckoutIdentityError("mock idToken does not match uid", 401);
      }
    }
    return { uid: claimedUid, email: claimedEmail };
  }

  if (!idToken) {
    throw new CheckoutIdentityError("Firebase idToken is required", 401);
  }

  const auth = await getAdminAuth();
  if (!auth) {
    throw new CheckoutIdentityError("Firebase Admin unavailable", 503);
  }

  let decoded: AdminAuthUser;
  try {
    decoded = await auth.verifyIdToken(idToken);
  } catch (err) {
    console.error("[checkout] idToken verification failed", {
      code: authErrorCode(err),
    });
    throw new CheckoutIdentityError("Invalid Firebase idToken", 401);
  }

  const uid = decoded.uid;
  const tokenEmail = decoded.email?.trim().toLowerCase() || null;
  if (!uid) {
    throw new CheckoutIdentityError("Firebase idToken missing uid", 401);
  }

  if (claimedUid && claimedUid !== uid) {
    console.warn("[checkout] ignoring request uid; using verified idToken uid", {
      claimedUid,
      verifiedUid: uid,
    });
  }

  if (tokenEmail && claimedEmail && tokenEmail !== claimedEmail) {
    console.error("[checkout] email does not match idToken", {
      claimedEmail,
      tokenEmail,
      uid,
    });
    throw new CheckoutIdentityError("email does not match Firebase idToken", 403);
  }

  const email = tokenEmail || claimedEmail;
  if (!email) {
    throw new CheckoutIdentityError("email is required", 400);
  }

  return { uid, email };
}

export type ProGrantInput = {
  uid: string;
  /** How uid was chosen (metadata.uid, auth-email, email-fallback, …). */
  uidSource?: string;
  email: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripeCheckoutSessionId?: string;
  currentPeriodEnd?: string | null;
  /** When true, allow in-memory mock if Admin credentials are missing. */
  allowMock?: boolean;
};

export type ResolveFallbackReason =
  | "doc_missing"
  | "email_mismatch"
  | "invalid_uid_shape"
  | "auth_uid_preferred"
  | "email_profile"
  | "prior_grant_stub";

export type ResolvedUser = {
  uid: string;
  email: string;
  source: UidSource;
  reason?: ResolveFallbackReason;
  metadataUid?: string | null;
  clientReferenceId?: string | null;
  authUid?: string | null;
  docExisted?: boolean;
  grantStub?: boolean;
};

/** Firebase Auth uids are long opaque ids — reject commit SHAs / FPR tids / junk. */
export function isLikelyFirebaseUid(uid: string): boolean {
  return uid.length >= 20 && uid.length <= 128 && /^[A-Za-z0-9]+$/.test(uid);
}

function normalizeEmail(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return trimmed.toLowerCase();
}

function emailQueryValues(raw: string | null | undefined): string[] {
  const trimmed = raw?.trim();
  if (!trimmed) return [];
  return [...new Set([trimmed, trimmed.toLowerCase()])];
}

function docEmailOf(
  data: Record<string, unknown> | undefined
): string | null {
  return typeof data?.email === "string"
    ? data.email.trim().toLowerCase()
    : null;
}

/**
 * Resolve the Firestore user for a Stripe Checkout session.
 *
 * metadata.uid and client_reference_id are candidates only. A missing doc is
 * not created unless Firebase Auth confirms that uid (getUser / getUserByEmail)
 * or an existing users profile already matches the payer email. Otherwise the
 * grant is refused so set(merge) cannot invent an orphan users/{uid}.
 */
export async function resolveUserForCheckout(params: {
  metadataUid?: string | null;
  clientReferenceId?: string | null;
  email?: string | null;
}): Promise<ResolvedUser | null> {
  const email = normalizeEmail(params.email);
  const metadataUid = params.metadataUid?.trim() || null;
  const clientReferenceId = params.clientReferenceId?.trim() || null;

  const db = await getAdminFirestore();
  if (!db) {
    if (isProductionRuntime()) return null;
    const fallback =
      (metadataUid && isLikelyFirebaseUid(metadataUid) && metadataUid) ||
      (clientReferenceId &&
        isLikelyFirebaseUid(clientReferenceId) &&
        clientReferenceId) ||
      null;
    if (!fallback) return null;
    const source: UidSource =
      metadataUid && isLikelyFirebaseUid(metadataUid)
        ? "metadata.uid"
        : "client_reference_id";
    return {
      uid: fallback,
      email: email || "",
      source,
      metadataUid,
      clientReferenceId,
      docExisted: false,
    };
  }

  const users = db.collection(firestoreProFields.collection);
  const auth = await getAdminAuth();

  let authByEmail: { uid: string; email: string | null } | null = null;
  if (email && auth) {
    try {
      const user = await auth.getUserByEmail(email);
      authByEmail = {
        uid: user.uid,
        email: normalizeEmail(user.email) || email,
      };
    } catch (err) {
      if (authErrorCode(err) !== "auth/user-not-found") {
        console.error("[firebase-admin] getUserByEmail failed", {
          email,
          code: authErrorCode(err),
        });
        throw err;
      }
      console.info("[firebase-admin] no Auth user for checkout email", {
        email,
      });
    }
  }

  const inspect = async (
    origin: CandidateOrigin,
    uid: string,
    known?: { email: string | null }
  ): Promise<CandidateView> => {
    let authExists = Boolean(known);
    let authEmail = known?.email ?? null;
    if (!known && auth) {
      try {
        const user = await auth.getUser(uid);
        authExists = true;
        authEmail = normalizeEmail(user.email);
      } catch (err) {
        if (authErrorCode(err) !== "auth/user-not-found") {
          console.error("[firebase-admin] getUser failed", {
            uid,
            origin,
            code: authErrorCode(err),
          });
          throw err;
        }
      }
    }

    const snap = await users.doc(uid).get();
    const data = snap.exists ? snap.data() : undefined;
    return {
      origin,
      uid,
      authExists,
      authEmail,
      docExists: snap.exists,
      docEmail: docEmailOf(data),
      grantStub: looksLikeGrantStub(data),
    };
  };

  const candidates: CandidateView[] = [];

  if (metadataUid) {
    if (!isLikelyFirebaseUid(metadataUid)) {
      console.warn("[firebase-admin] metadata.uid rejected — invalid uid shape", {
        metadataUid,
        email,
      });
    } else {
      const known =
        authByEmail && authByEmail.uid === metadataUid
          ? { email: authByEmail.email }
          : undefined;
      candidates.push(await inspect("metadata.uid", metadataUid, known));
    }
  }

  if (clientReferenceId && clientReferenceId !== metadataUid) {
    if (!isLikelyFirebaseUid(clientReferenceId)) {
      console.info(
        "[firebase-admin] client_reference_id is not a Firebase uid (likely FirstPromoter tid)",
        { clientReferenceId, email }
      );
    } else {
      const known =
        authByEmail && authByEmail.uid === clientReferenceId
          ? { email: authByEmail.email }
          : undefined;
      candidates.push(
        await inspect("client_reference_id", clientReferenceId, known)
      );
    }
  }

  if (authByEmail) {
    const existing = candidates.find((item) => item.uid === authByEmail.uid);
    candidates.push(
      existing
        ? { ...existing, origin: "auth-email" }
        : await inspect("auth-email", authByEmail.uid, {
            email: authByEmail.email,
          })
    );
  }

  const emailHits: EmailHit[] = [];
  const seenHits = new Set<string>();
  if (email) {
    for (const value of emailQueryValues(params.email)) {
      const query = await users.where("email", "==", value).limit(10).get();
      for (const doc of query.docs) {
        if (seenHits.has(doc.id)) continue;
        seenHits.add(doc.id);
        const data = doc.data();
        emailHits.push({
          uid: doc.id,
          email: docEmailOf(data),
          grantStub: looksLikeGrantStub(data),
        });
      }
    }
  }

  const choice = chooseProGrantTarget({ email, candidates, emailHits });
  const summary = {
    email,
    metadataUid,
    clientReferenceId,
    authUid: authByEmail?.uid ?? null,
    projectId: getAdminProjectId(),
    databaseId: activeDatabaseId,
    candidates: candidates.map((item) => ({
      origin: item.origin,
      uid: item.uid,
      authExists: item.authExists,
      docExists: item.docExists,
      grantStub: item.grantStub,
      docEmail: item.docEmail,
    })),
    emailHitIds: emailHits.map((hit) => hit.uid),
  };

  if (!choice.ok) {
    console.error(
      "[firebase-admin] resolveUserForCheckout refused — would create an orphan doc",
      { ...summary, error: choice.error }
    );
    return null;
  }

  const resolvedLog = {
    ...summary,
    resolvedUid: choice.uid,
    source: choice.source,
    reason: choice.reason,
    docExisted: choice.docExisted,
    grantStub: choice.grantStub,
    ignoredUids: choice.ignoredUids,
    path: `${firestoreProFields.collection}/${choice.uid}`,
  };

  if (choice.reason === "doc_missing") {
    console.warn(
      "[firebase-admin] Pro grant will CREATE users/{uid} — Auth confirmed, no Firestore doc yet",
      resolvedLog
    );
  } else if (choice.ignoredUids.length > 0 || choice.grantStub) {
    console.warn(
      "[firebase-admin] resolveUserForCheckout ignored a different uid",
      resolvedLog
    );
  } else {
    console.info("[firebase-admin] resolveUserForCheckout", resolvedLog);
  }

  return {
    uid: choice.uid,
    email: choice.email || email || "",
    source: choice.source,
    reason: (choice.reason as ResolveFallbackReason | null) ?? undefined,
    metadataUid,
    clientReferenceId,
    authUid: authByEmail?.uid ?? null,
    docExisted: choice.docExisted,
    grantStub: choice.grantStub,
  };
}

/**
 * Marks a user as Pro in Firestore.
 * Document: users/{uid}  (canonical — iOS reads isPro here on login)
 * Core fields: isPro=true, plan="pro", subscriptionStatus="active"
 */
export async function grantProStatus(input: ProGrantInput) {
  const subscriptionId = input.stripeSubscriptionId ?? null;
  const currentPeriodEnd = input.currentPeriodEnd ?? null;
  const collection = firestoreProFields.collection;
  const docPath = `${collection}/${input.uid}`;

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
    // Production must never pretend a grant succeeded via in-memory mock.
    const allowInMemoryMock =
      !isProductionRuntime() &&
      input.allowMock === true &&
      process.env.NEXT_PUBLIC_MOCK_MODE === "true";

    if (allowInMemoryMock) {
      mockStore.set(input.uid, payload);
      console.warn("[mock-firestore] Pro granted (IN-MEMORY ONLY — not Firestore)", {
        mock: true,
        path: docPath,
        projectId: null,
        uid: input.uid,
        email: payload.email,
        subscriptionId,
      });
      return {
        mock: true as const,
        path: docPath,
        projectId: null,
        existedBefore: false,
        writeTime: null,
        ...payload,
      };
    }

    console.error(
      "[firebase-admin] Cannot grant Pro — Firebase Admin unavailable (no Firestore write)",
      { mock: false, path: docPath, uid: input.uid, email: input.email }
    );
    throw new Error(
      `Firebase Admin unavailable — set ${ADMIN_ENV_HINT}`
    );
  }

  const writeTarget = getAdminWriteTarget();
  if (!writeTarget.projectId) {
    throw new Error("Admin write target projectId is null — refusing to write");
  }
  if (writeTarget.projectMismatch) {
    console.error(
      "[firebase-admin] WRITE TARGET PROJECT MISMATCH — Console break-99b8e will NOT show this doc",
      writeTarget
    );
  }

  const docRef = db.collection(collection).doc(input.uid);
  const beforeSnap = await docRef.get();
  const existedBefore = beforeSnap.exists;
  const beforeData = existedBefore ? beforeSnap.data() : undefined;

  let liveAppName = activeAppName;
  let liveAppProjectId = activeProjectId;
  try {
    const { getApp } = await import("firebase-admin/app");
    const app = getApp();
    liveAppName = app.name;
    liveAppProjectId = (app.options.projectId as string | undefined) ?? null;
  } catch (err) {
    console.error("[firebase-admin] could not read live Admin app options", err);
  }

  const databaseId = liveFirestoreDatabaseId(db);
  const docRefPath = docRef.path || docPath;

  if (!liveAppProjectId) {
    throw new Error(
      "Admin app.options.projectId is missing — refusing to write"
    );
  }
  if (liveAppProjectId !== writeTarget.projectId) {
    throw new Error(
      `Live app.options.projectId=${liveAppProjectId} != write target ${writeTarget.projectId}`
    );
  }

  const writeTargetLog = {
    appName: liveAppName,
    appProjectId: liveAppProjectId,
    databaseId,
    docRefPath,
    uid: input.uid,
    uidSource: input.uidSource ?? "unknown",
    existedBefore,
    before: existedBefore
      ? {
          email: beforeData?.email ?? null,
          isPro: beforeData?.isPro ?? null,
          plan: beforeData?.plan ?? null,
        }
      : null,
    gcloudProjectEnv:
      process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || null,
    vercelDeploymentId: process.env.VERCEL_DEPLOYMENT_ID ?? null,
    clientEmail: writeTarget.clientEmail,
    expectedClientProjectId: writeTarget.expectedClientProjectId,
    projectMismatch: writeTarget.projectMismatch,
  };
  console.info("[firebase-admin] Pro grant WRITE target", writeTargetLog);

  const writeResult = (await docRef.set(payload, { merge: true })) as
    | AdminWriteResult
    | undefined;
  const writeTime = writeResult?.writeTime?.toDate?.()?.toISOString() ?? null;

  // Same docRef as the write. This confirms the write landed; it does not
  // prove this uid is the profile the iOS app reads.
  const verify = await docRef.get();
  const verified = verify.exists ? verify.data() : undefined;
  const readBack = verified
    ? {
        email: verified.email,
        isPro: verified.isPro,
        plan: verified.plan,
        subscriptionStatus: verified.subscriptionStatus,
        stripeCustomerId: verified.stripeCustomerId,
        stripeCheckoutSessionId: verified.stripeCheckoutSessionId,
        proUpdatedAt: verified.proUpdatedAt,
      }
    : null;

  console.info("[firebase-admin] Pro grant READ-BACK", {
    ...writeTargetLog,
    writeTime,
    exists: verify.exists,
    readBackSamePath: true,
    readBack,
  });

  if (!verify.exists || verified?.isPro !== true || verified?.plan !== "pro") {
    console.error("[firebase-admin] Pro grant write verification FAILED", {
      mock: false,
      ...writeTargetLog,
      writeTime,
      exists: verify.exists,
      readBack,
    });
    throw new Error(
      `Firestore write verification failed for ${docRefPath} in project ${liveAppProjectId}`
    );
  }

  console.info("[firebase-admin] Pro granted", {
    mock: false,
    ...writeTargetLog,
    writeTime,
    email: payload.email,
    subscriptionId,
    currentPeriodEnd,
    verifiedIsPro: verified?.isPro === true,
    verifiedPlan: verified?.plan,
    verifiedSubscriptionStatus: verified?.subscriptionStatus,
  });

  return {
    mock: false as const,
    path: docRefPath,
    projectId: liveAppProjectId,
    writeTarget: {
      ...writeTarget,
      projectId: liveAppProjectId,
      appName: liveAppName,
      databaseId,
    },
    existedBefore,
    writeTime,
    verified: {
      isPro: verified?.isPro === true,
      plan: verified?.plan,
      subscriptionStatus: verified?.subscriptionStatus,
      subscriptionId: verified?.subscriptionId,
    },
    ...payload,
  };
}

export function getMockProStore() {
  return Object.fromEntries(mockStore.entries());
}
