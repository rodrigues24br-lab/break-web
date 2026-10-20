import assert from "node:assert/strict";
import test from "node:test";
import {
  chooseProGrantTarget,
  looksLikeGrantStub,
  type CandidateView,
} from "./resolve-pro-target";

const EMAIL = "jaclancaster17@gmail.com";
const REAL_UID = "1PrC18HWGRVQLSGp24AGSvPHiP2";
const ORPHAN_UID = "webCheckoutUidNotTheIosDoc01";

function candidate(
  partial: Partial<CandidateView> & Pick<CandidateView, "origin" | "uid">
): CandidateView {
  return {
    authExists: false,
    authEmail: null,
    docExists: false,
    docEmail: null,
    grantStub: false,
    ...partial,
  };
}

test("looksLikeGrantStub only matches webhook-shaped docs", () => {
  assert.equal(
    looksLikeGrantStub({
      email: EMAIL,
      isPro: true,
      plan: "pro",
      stripeCheckoutSessionId: "cs_test",
      proUpdatedAt: "2026-10-20T00:00:00.000Z",
    }),
    true
  );
  assert.equal(
    looksLikeGrantStub({
      email: EMAIL,
      isPro: false,
      displayName: "Jac",
      createdAt: "2026-01-01",
    }),
    false
  );
  assert.equal(looksLikeGrantStub({ email: EMAIL }), false);
});

test("prefers the Auth user's existing profile over a metadata orphan stub", () => {
  const choice = chooseProGrantTarget({
    email: EMAIL,
    candidates: [
      candidate({
        origin: "metadata.uid",
        uid: ORPHAN_UID,
        authExists: true,
        authEmail: EMAIL,
        docExists: true,
        docEmail: EMAIL,
        grantStub: true,
      }),
      candidate({
        origin: "auth-email",
        uid: REAL_UID,
        authExists: true,
        authEmail: EMAIL,
        docExists: true,
        docEmail: null,
        grantStub: false,
      }),
    ],
    emailHits: [
      { uid: ORPHAN_UID, email: EMAIL, grantStub: true },
    ],
  });
  assert.equal(choice.ok, true);
  if (!choice.ok) return;
  assert.equal(choice.uid, REAL_UID);
  assert.equal(choice.source, "auth-email");
  assert.equal(choice.reason, "auth_uid_preferred");
  assert.equal(choice.docExisted, true);
  assert.ok(choice.ignoredUids.includes(ORPHAN_UID));
});

test("uses an existing email profile when metadata uid has no doc", () => {
  const choice = chooseProGrantTarget({
    email: EMAIL,
    candidates: [
      candidate({
        origin: "metadata.uid",
        uid: ORPHAN_UID,
        authExists: false,
      }),
    ],
    emailHits: [{ uid: REAL_UID, email: EMAIL, grantStub: false }],
  });
  assert.equal(choice.ok, true);
  if (!choice.ok) return;
  assert.equal(choice.uid, REAL_UID);
  assert.equal(choice.source, "email-fallback");
  assert.equal(choice.reason, "email_profile");
});

test("refuses to create a doc for an unconfirmed metadata uid", () => {
  const choice = chooseProGrantTarget({
    email: EMAIL,
    candidates: [
      candidate({
        origin: "metadata.uid",
        uid: ORPHAN_UID,
        authExists: false,
        docExists: false,
      }),
    ],
    emailHits: [],
  });
  assert.equal(choice.ok, false);
});

test("creates users/{authUid} when Auth confirms the email and no profile exists", () => {
  const choice = chooseProGrantTarget({
    email: EMAIL,
    candidates: [
      candidate({
        origin: "metadata.uid",
        uid: ORPHAN_UID,
        authExists: false,
      }),
      candidate({
        origin: "auth-email",
        uid: REAL_UID,
        authExists: true,
        authEmail: EMAIL,
        docExists: false,
      }),
    ],
    emailHits: [],
  });
  assert.equal(choice.ok, true);
  if (!choice.ok) return;
  assert.equal(choice.uid, REAL_UID);
  assert.equal(choice.source, "auth-email");
  assert.equal(choice.reason, "doc_missing");
  assert.equal(choice.docExisted, false);
});

test("keeps a confirmed metadata uid whose profile already exists", () => {
  const choice = chooseProGrantTarget({
    email: EMAIL,
    candidates: [
      candidate({
        origin: "metadata.uid",
        uid: REAL_UID,
        authExists: true,
        authEmail: EMAIL,
        docExists: true,
        docEmail: EMAIL,
        grantStub: false,
      }),
      candidate({
        origin: "auth-email",
        uid: REAL_UID,
        authExists: true,
        authEmail: EMAIL,
        docExists: true,
        docEmail: EMAIL,
        grantStub: false,
      }),
    ],
    emailHits: [{ uid: REAL_UID, email: EMAIL, grantStub: false }],
  });
  assert.equal(choice.ok, true);
  if (!choice.ok) return;
  assert.equal(choice.uid, REAL_UID);
  assert.equal(choice.source, "metadata.uid");
  assert.equal(choice.reason, null);
});

test("uses client_reference_id when it is the confirmed profile", () => {
  const choice = chooseProGrantTarget({
    email: EMAIL,
    candidates: [
      candidate({
        origin: "client_reference_id",
        uid: REAL_UID,
        authExists: true,
        authEmail: EMAIL,
        docExists: true,
        docEmail: EMAIL,
      }),
    ],
    emailHits: [{ uid: REAL_UID, email: EMAIL, grantStub: false }],
  });
  assert.equal(choice.ok, true);
  if (!choice.ok) return;
  assert.equal(choice.uid, REAL_UID);
  assert.equal(choice.source, "client_reference_id");
});

test("does not treat a FirstPromoter-sized id as a profile when Auth rejects it", () => {
  const choice = chooseProGrantTarget({
    email: EMAIL,
    candidates: [
      candidate({
        origin: "client_reference_id",
        uid: "not-a-real-auth-user-id-xx",
        authExists: false,
        docExists: false,
      }),
    ],
    emailHits: [],
  });
  assert.equal(choice.ok, false);
});

test("refuses ambiguous real email matches", () => {
  const choice = chooseProGrantTarget({
    email: EMAIL,
    candidates: [],
    emailHits: [
      { uid: REAL_UID, email: EMAIL, grantStub: false },
      { uid: "AnotherRealProfileUid0001", email: EMAIL, grantStub: false },
    ],
  });
  assert.equal(choice.ok, false);
  if (choice.ok) return;
  assert.match(choice.error, /ambiguous/);
});

test("updates a prior grant stub on the Auth uid when that is the only doc", () => {
  const choice = chooseProGrantTarget({
    email: EMAIL,
    candidates: [
      candidate({
        origin: "auth-email",
        uid: REAL_UID,
        authExists: true,
        authEmail: EMAIL,
        docExists: true,
        docEmail: EMAIL,
        grantStub: true,
      }),
      candidate({
        origin: "metadata.uid",
        uid: REAL_UID,
        authExists: true,
        authEmail: EMAIL,
        docExists: true,
        docEmail: EMAIL,
        grantStub: true,
      }),
    ],
    emailHits: [{ uid: REAL_UID, email: EMAIL, grantStub: true }],
  });
  assert.equal(choice.ok, true);
  if (!choice.ok) return;
  assert.equal(choice.uid, REAL_UID);
  assert.equal(choice.reason, "prior_grant_stub");
  assert.equal(choice.grantStub, true);
});

test("does not overwrite an Auth profile whose email conflicts", () => {
  const choice = chooseProGrantTarget({
    email: EMAIL,
    candidates: [
      candidate({
        origin: "auth-email",
        uid: REAL_UID,
        authExists: true,
        authEmail: "other@example.com",
        docExists: true,
        docEmail: "other@example.com",
      }),
    ],
    emailHits: [],
  });
  assert.equal(choice.ok, false);
});
