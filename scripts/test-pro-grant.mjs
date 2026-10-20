#!/usr/bin/env node
/**
 * Write+read a test Pro grant against Firebase Admin.
 *
 * Env (one of):
 *   FIREBASE_SERVICE_ACCOUNT_KEY  (JSON or base64 JSON)
 *   FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY
 *
 * Optional:
 *   FIRESTORE_DATABASE_ID  (default "(default)")
 *   TEST_UID / TEST_EMAIL
 *
 * Usage:
 *   node scripts/test-pro-grant.mjs
 *   node scripts/test-pro-grant.mjs --uid webhook-test-manual
 */
import { createRequire } from "module";

const require = createRequire(import.meta.url);

function normalizePrivateKey(key) {
  return key.replace(/\\n/g, "\n").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function stripJunk(raw) {
  let s = raw.replace(/^\uFEFF/, "").trim();
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim();
  }
  return s.replace(/^serviceAccount\s*=\s*/i, "").trim();
}

function repairPrivateKeyLiteralNewlines(jsonText) {
  return jsonText.replace(
    /("private_key"|"privateKey")\s*:\s*"([\s\S]*?)"(\s*[,}])/g,
    (match, key, body, tail) => {
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

function parseServiceAccountKey(raw) {
  let jsonText = stripJunk(raw);
  if (!jsonText.startsWith("{")) {
    const decoded = Buffer.from(jsonText, "base64").toString("utf8");
    const stripped = stripJunk(decoded);
    if (stripped.startsWith("{")) jsonText = stripped;
  }

  const tryParse = (text) => {
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  };

  let parsed = tryParse(jsonText);
  if (!parsed) {
    const withNl = jsonText.replace(/\\n/g, "\n");
    parsed = tryParse(withNl) || tryParse(repairPrivateKeyLiteralNewlines(withNl));
  }
  if (!parsed) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON");
  }
  return {
    projectId: parsed.project_id || parsed.projectId,
    clientEmail: parsed.client_email || parsed.clientEmail,
    privateKey: normalizePrivateKey(
      String(parsed.private_key || parsed.privateKey || "")
    ),
  };
}

function resolveCert() {
  const bundled = process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.trim();
  if (bundled) return parseServiceAccountKey(bundled);
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (projectId && clientEmail && privateKey) {
    return {
      projectId,
      clientEmail,
      privateKey: normalizePrivateKey(privateKey),
    };
  }
  throw new Error(
    "Missing Admin credentials. Set FIREBASE_SERVICE_ACCOUNT_KEY (or discrete FIREBASE_* vars)."
  );
}

async function main() {
  const args = process.argv.slice(2);
  const uidFlag = args.indexOf("--uid");
  const uid =
    (uidFlag >= 0 && args[uidFlag + 1]) ||
    process.env.TEST_UID ||
    `webhook-test-${Date.now().toString(36)}`;
  const email =
    process.env.TEST_EMAIL || `${uid}@break-webhook-test.local`;

  const certFields = resolveCert();
  const admin = require("firebase-admin");
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(certFields),
      projectId: certFields.projectId,
    });
  }

  const databaseId = process.env.FIRESTORE_DATABASE_ID?.trim() || "(default)";
  const db =
    databaseId === "(default)"
      ? admin.firestore()
      : admin.firestore(admin.app(), databaseId);

  const path = `users/${uid}`;
  const payload = {
    email,
    isPro: true,
    plan: "pro",
    subscriptionStatus: "active",
    status: "active",
    subscriptionId: "sub_test_pro_grant",
    stripeSubscriptionId: "sub_test_pro_grant",
    stripeCheckoutSessionId: `cs_test_${uid}`,
    currentPeriodEnd: new Date(Date.now() + 365 * 864e5).toISOString(),
    proUpdatedAt: new Date().toISOString(),
    _testGrant: true,
  };

  await db.doc(path).set(payload, { merge: true });
  const snap = await db.doc(path).get();
  const data = snap.exists ? snap.data() : null;

  const ok =
    snap.exists && data?.isPro === true && data?.plan === "pro";

  console.log(
    JSON.stringify(
      {
        ok,
        path,
        projectId: certFields.projectId,
        databaseId,
        uid,
        email,
        exists: snap.exists,
        fields: data
          ? {
              isPro: data.isPro,
              plan: data.plan,
              subscriptionStatus: data.subscriptionStatus,
              status: data.status,
              subscriptionId: data.subscriptionId,
              currentPeriodEnd: data.currentPeriodEnd,
            }
          : null,
      },
      null,
      2
    )
  );

  if (!ok) process.exit(1);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
