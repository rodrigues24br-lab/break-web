"use client";

import { firebaseClientConfig, appConfig } from "@/lib/config";
import { trackFirstPromoterReferral } from "@/lib/firstpromoter-client";
import { MOCK_SESSION_COOKIE } from "@/lib/mock-session";
import type { Auth, User } from "firebase/auth";
import type { FirebaseApp } from "firebase/app";

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let analyticsStarted = false;
let authReady: Promise<Auth> | null = null;

async function loadFirebase() {
  const [{ initializeApp, getApps, getApp }, authMod] = await Promise.all([
    import("firebase/app"),
    import("firebase/auth"),
  ]);
  if (!app) {
    app = getApps().length ? getApp() : initializeApp(firebaseClientConfig);
  }
  return { app, authMod };
}

/**
 * Lazy Auth init — co-imports app + auth so the Auth component registers
 * on the same @firebase/app instance.
 */
async function ensureAuth(): Promise<Auth> {
  if (typeof window === "undefined") {
    throw new Error("Firebase Auth is browser-only");
  }
  if (auth) return auth;
  if (authReady) return authReady;

  authReady = (async () => {
    const { app: firebaseApp, authMod } = await loadFirebase();
    try {
      auth = authMod.initializeAuth(firebaseApp, {
        persistence: [
          authMod.indexedDBLocalPersistence,
          authMod.browserLocalPersistence,
        ],
        popupRedirectResolver: authMod.browserPopupRedirectResolver,
      });
    } catch {
      auth = authMod.getAuth(firebaseApp);
    }
    initFirebaseAnalytics();
    return auth!;
  })();

  return authReady;
}

/** Browser-only Analytics — no-op on SSR / when measurementId missing. */
export function initFirebaseAnalytics() {
  if (analyticsStarted) return;
  if (typeof window === "undefined") return;
  const measurementId = firebaseClientConfig.measurementId;
  if (!measurementId || appConfig.mockMode) return;
  analyticsStarted = true;
  void Promise.all([import("firebase/app"), import("firebase/analytics")])
    .then(([{ getApps, getApp, initializeApp }, { getAnalytics, isSupported }]) =>
      isSupported().then((ok) => {
        if (!ok) return;
        const firebaseApp =
          app ||
          (getApps().length
            ? getApp()
            : initializeApp(firebaseClientConfig));
        app = firebaseApp;
        getAnalytics(firebaseApp);
      })
    )
    .catch(() => {
      analyticsStarted = false;
    });
}

export type MockUser = {
  uid: string;
  email: string | null;
  getIdToken: () => Promise<string>;
};

const MOCK_STORAGE_KEY = "break_mock_user";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function decodeSessionCookie(): MockUser | null {
  const raw = readCookie(MOCK_SESSION_COOKIE);
  if (!raw) return null;
  try {
    const json = atob(raw.replace(/-/g, "+").replace(/_/g, "/"));
    const parsed = JSON.parse(json) as { uid: string; email: string };
    if (!parsed?.uid || !parsed?.email) return null;
    return {
      uid: parsed.uid,
      email: parsed.email,
      getIdToken: async () => `mock-token:${parsed.uid}`,
    };
  } catch {
    return null;
  }
}

function readMockUser(): MockUser | null {
  if (typeof window === "undefined") return null;
  const fromCookie = decodeSessionCookie();
  if (fromCookie) {
    localStorage.setItem(
      MOCK_STORAGE_KEY,
      JSON.stringify({ uid: fromCookie.uid, email: fromCookie.email })
    );
    return fromCookie;
  }
  const raw = localStorage.getItem(MOCK_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { uid: string; email: string };
    return {
      uid: parsed.uid,
      email: parsed.email,
      getIdToken: async () => `mock-token:${parsed.uid}`,
    };
  } catch {
    return null;
  }
}

function writeMockUser(email: string): MockUser {
  const normalized = email.toLowerCase().trim();
  const uid = `mock_${btoa(normalized).replace(/=+/g, "").slice(0, 16)}`;
  const user: MockUser = {
    uid,
    email: normalized,
    getIdToken: async () => `mock-token:${uid}`,
  };
  localStorage.setItem(
    MOCK_STORAGE_KEY,
    JSON.stringify({ uid: user.uid, email: user.email })
  );
  document.cookie = `${MOCK_SESSION_COOKIE}=${btoa(JSON.stringify({ uid, email: normalized })).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "")}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`;
  return user;
}

export async function registerWithEmail(email: string, password: string) {
  if (appConfig.mockMode) {
    if (password.length < 6) {
      throw new Error("Password should be at least 6 characters");
    }
    const user = writeMockUser(email);
    trackFirstPromoterReferral(user);
    return user;
  }
  const a = await ensureAuth();
  const { createUserWithEmailAndPassword } = await import("firebase/auth");
  const cred = await createUserWithEmailAndPassword(a, email.trim(), password);
  trackFirstPromoterReferral(cred.user);
  return cred.user;
}

export async function loginWithEmail(email: string, password: string) {
  if (appConfig.mockMode) {
    if (password.length < 6) {
      throw new Error("Password should be at least 6 characters");
    }
    return writeMockUser(email);
  }
  const a = await ensureAuth();
  const { signInWithEmailAndPassword } = await import("firebase/auth");
  const cred = await signInWithEmailAndPassword(a, email.trim(), password);
  return cred.user;
}

export async function loginWithGoogle() {
  if (appConfig.mockMode) {
    const user = writeMockUser(`google_${Date.now()}@break.app`);
    trackFirstPromoterReferral(user);
    return user;
  }
  const a = await ensureAuth();
  const { GoogleAuthProvider, signInWithPopup, getAdditionalUserInfo } =
    await import("firebase/auth");
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const cred = await signInWithPopup(a, provider);
  if (getAdditionalUserInfo(cred)?.isNewUser) {
    trackFirstPromoterReferral(cred.user);
  }
  return cred.user;
}

export async function loginWithApple() {
  if (appConfig.mockMode) {
    const user = writeMockUser(`apple_${Date.now()}@break.app`);
    trackFirstPromoterReferral(user);
    return user;
  }
  const a = await ensureAuth();
  const { OAuthProvider, signInWithPopup, getAdditionalUserInfo } =
    await import("firebase/auth");
  const provider = new OAuthProvider("apple.com");
  provider.addScope("email");
  provider.addScope("name");
  const cred = await signInWithPopup(a, provider);
  if (getAdditionalUserInfo(cred)?.isNewUser) {
    trackFirstPromoterReferral(cred.user);
  }
  return cred.user;
}

export async function logout() {
  if (appConfig.mockMode) {
    localStorage.removeItem(MOCK_STORAGE_KEY);
    document.cookie = `${MOCK_SESSION_COOKIE}=; path=/; max-age=0`;
    return;
  }
  const a = await ensureAuth();
  const { signOut } = await import("firebase/auth");
  await signOut(a);
}

export function subscribeToAuth(
  callback: (user: User | MockUser | null) => void
) {
  if (appConfig.mockMode) {
    callback(readMockUser());
    const onStorage = () => callback(readMockUser());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }

  let unsub: (() => void) | undefined;
  let cancelled = false;

  void ensureAuth()
    .then(async (a) => {
      if (cancelled) return;
      const { onAuthStateChanged } = await import("firebase/auth");
      unsub = onAuthStateChanged(a, callback);
    })
    .catch((err) => {
      console.error("[firebase] auth subscribe failed", err);
      callback(null);
    });

  return () => {
    cancelled = true;
    unsub?.();
  };
}

export function getCurrentMockOrNull(): MockUser | null {
  return appConfig.mockMode ? readMockUser() : null;
}
