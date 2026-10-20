/**
 * Pure choice of which users/{uid} document a Pro grant may write.
 * Admin SDK set(merge) creates missing docs, so a uid that was never
 * confirmed against Auth or an existing profile must be refused.
 */

export type UidSource =
  | "metadata.uid"
  | "client_reference_id"
  | "auth-email"
  | "email-fallback"
  | "email";

export type CandidateOrigin = "metadata.uid" | "client_reference_id" | "auth-email";

export type CandidateView = {
  origin: CandidateOrigin;
  uid: string;
  authExists: boolean;
  authEmail: string | null;
  docExists: boolean;
  docEmail: string | null;
  grantStub: boolean;
};

export type EmailHit = {
  uid: string;
  email: string | null;
  grantStub: boolean;
};

export type ProTargetChoice = {
  ok: true;
  uid: string;
  email: string;
  source: UidSource;
  reason: string | null;
  docExisted: boolean;
  grantStub: boolean;
  ignoredUids: string[];
};

export type ProTargetRefusal = {
  ok: false;
  error: string;
};

const GRANT_KEYS = new Set([
  "email",
  "isPro",
  "plan",
  "subscriptionStatus",
  "status",
  "stripeCustomerId",
  "stripeSubscriptionId",
  "subscriptionId",
  "stripeCheckoutSessionId",
  "currentPeriodEnd",
  "proUpdatedAt",
]);

/** True when the doc contains only fields this server writes on a Pro grant. */
export function looksLikeGrantStub(
  data: Record<string, unknown> | undefined | null
): boolean {
  if (!data) return false;
  const keys = Object.keys(data).filter(
    (key) => data[key] !== undefined && data[key] !== null
  );
  if (keys.length === 0) return false;
  const hasMarker = keys.some(
    (key) =>
      key === "isPro" ||
      key === "plan" ||
      key === "stripeCheckoutSessionId" ||
      key === "proUpdatedAt"
  );
  if (!hasMarker) return false;
  return keys.every((key) => GRANT_KEYS.has(key));
}

function emailsCompatible(
  sessionEmail: string | null,
  docEmail: string | null,
  authEmail: string | null
): boolean {
  if (sessionEmail && docEmail && docEmail !== sessionEmail) return false;
  if (sessionEmail && authEmail && authEmail !== sessionEmail) return false;
  return true;
}

function sourceFor(
  uid: string,
  candidates: CandidateView[],
  hadMetadata: boolean
): UidSource {
  const meta = candidates.find((c) => c.origin === "metadata.uid");
  const cref = candidates.find((c) => c.origin === "client_reference_id");
  const auth = candidates.find((c) => c.origin === "auth-email");
  if (auth?.uid === uid && meta?.uid !== uid && cref?.uid !== uid) {
    return "auth-email";
  }
  if (meta?.uid === uid) return "metadata.uid";
  if (cref?.uid === uid) return "client_reference_id";
  if (auth?.uid === uid) return "auth-email";
  return hadMetadata ? "email-fallback" : "email";
}

function ignoredUids(
  chosen: string,
  candidates: CandidateView[],
  hits: EmailHit[]
): string[] {
  const ids = new Set<string>();
  for (const candidate of candidates) {
    if (candidate.uid !== chosen && (candidate.docExists || candidate.authExists)) {
      ids.add(candidate.uid);
    }
  }
  for (const hit of hits) {
    if (hit.uid !== chosen) ids.add(hit.uid);
  }
  return [...ids];
}

function choose(
  uid: string,
  email: string,
  source: UidSource,
  reason: string | null,
  docExisted: boolean,
  grantStub: boolean,
  candidates: CandidateView[],
  hits: EmailHit[]
): ProTargetChoice {
  return {
    ok: true,
    uid,
    email,
    source,
    reason,
    docExisted,
    grantStub,
    ignoredUids: ignoredUids(uid, candidates, hits),
  };
}

/**
 * Pick the Firestore user a checkout grant may update.
 * Order: Auth user's real profile, other confirmed profiles, email match,
 * then a prior grant on the Auth uid. Creating a doc is allowed only for a
 * uid Firebase Auth confirms. Unconfirmed metadata uids are refused.
 */
export function chooseProGrantTarget(input: {
  email: string | null;
  candidates: CandidateView[];
  emailHits: EmailHit[];
}): ProTargetChoice | ProTargetRefusal {
  const email = input.email;
  const candidates = input.candidates;
  const hits = input.emailHits;
  const hadMetadata = candidates.some((c) => c.origin === "metadata.uid");
  const auth = candidates.find((c) => c.origin === "auth-email");
  const meta = candidates.find((c) => c.origin === "metadata.uid");

  const usableProfile = (candidate: CandidateView) =>
    candidate.docExists &&
    !candidate.grantStub &&
    candidate.authExists &&
    emailsCompatible(email, candidate.docEmail, candidate.authEmail);

  if (auth && usableProfile(auth)) {
    const preferred = meta?.uid && meta.uid !== auth.uid;
    return choose(
      auth.uid,
      auth.docEmail || auth.authEmail || email || "",
      sourceFor(auth.uid, candidates, hadMetadata),
      preferred ? "auth_uid_preferred" : null,
      true,
      false,
      candidates,
      hits
    );
  }

  for (const origin of ["metadata.uid", "client_reference_id"] as const) {
    const candidate = candidates.find((item) => item.origin === origin);
    if (!candidate || !usableProfile(candidate)) continue;
    return choose(
      candidate.uid,
      candidate.docEmail || candidate.authEmail || email || "",
      origin,
      null,
      true,
      false,
      candidates,
      hits
    );
  }

  const realHits: EmailHit[] = [];
  const seen = new Set<string>();
  for (const hit of hits) {
    if (hit.grantStub) continue;
    if (email && hit.email && hit.email !== email) continue;
    if (seen.has(hit.uid)) continue;
    seen.add(hit.uid);
    realHits.push(hit);
  }

  if (realHits.length > 1) {
    const authHit = auth ? realHits.find((hit) => hit.uid === auth.uid) : undefined;
    if (!authHit) {
      return {
        ok: false,
        error: `ambiguous Firestore email matches: ${realHits.map((hit) => hit.uid).join(", ")}`,
      };
    }
    return choose(
      authHit.uid,
      authHit.email || email || "",
      "auth-email",
      "auth_uid_preferred",
      true,
      false,
      candidates,
      hits
    );
  }

  if (realHits.length === 1) {
    const hit = realHits[0];
    return choose(
      hit.uid,
      hit.email || email || "",
      sourceFor(hit.uid, candidates, hadMetadata),
      hadMetadata && meta?.uid !== hit.uid ? "email_profile" : null,
      true,
      false,
      candidates,
      hits
    );
  }

  if (
    auth?.authExists &&
    auth.docExists &&
    emailsCompatible(email, auth.docEmail, auth.authEmail)
  ) {
    return choose(
      auth.uid,
      auth.docEmail || auth.authEmail || email || "",
      sourceFor(auth.uid, candidates, hadMetadata),
      auth.grantStub ? "prior_grant_stub" : null,
      true,
      auth.grantStub,
      candidates,
      hits
    );
  }

  if (
    auth?.authExists &&
    !auth.docExists &&
    emailsCompatible(email, null, auth.authEmail)
  ) {
    return choose(
      auth.uid,
      auth.authEmail || email || "",
      "auth-email",
      "doc_missing",
      false,
      false,
      candidates,
      hits
    );
  }

  for (const origin of ["metadata.uid", "client_reference_id"] as const) {
    const candidate = candidates.find((item) => item.origin === origin);
    if (!candidate?.authExists || candidate.docExists) continue;
    if (!emailsCompatible(email, candidate.docEmail, candidate.authEmail)) continue;
    if (auth && auth.uid !== candidate.uid) continue;
    return choose(
      candidate.uid,
      candidate.authEmail || email || "",
      origin,
      "doc_missing",
      false,
      false,
      candidates,
      hits
    );
  }

  return {
    ok: false,
    error:
      "no confirmed Auth user or existing Firestore profile; refusing to create an orphan users doc",
  };
}
