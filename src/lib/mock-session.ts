export const MOCK_SESSION_COOKIE = "break_mock_session";

export type MockSession = {
  uid: string;
  email: string;
};

export function buildMockSession(email: string): MockSession {
  const normalized = email.toLowerCase().trim();
  const uid = `mock_${Buffer.from(normalized)
    .toString("base64")
    .replace(/=+/g, "")
    .slice(0, 16)}`;
  return { uid, email: normalized };
}

export function encodeMockSession(session: MockSession) {
  return Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
}

export function decodeMockSession(value: string | undefined | null): MockSession | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(
      Buffer.from(value, "base64url").toString("utf8")
    ) as MockSession;
    if (!parsed?.uid || !parsed?.email) return null;
    return parsed;
  } catch {
    return null;
  }
}
