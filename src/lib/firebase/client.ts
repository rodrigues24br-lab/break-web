"use client";

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type Auth,
  type User,
} from "firebase/auth";
import { firebaseClientConfig, appConfig } from "@/lib/config";
import { MOCK_SESSION_COOKIE } from "@/lib/mock-session";

let app: FirebaseApp | undefined;
let auth: Auth | undefined;

function getFirebaseApp(): FirebaseApp {
  if (!app) {
    app = getApps().length ? getApps()[0]! : initializeApp(firebaseClientConfig);
  }
  return app;
}

export function getClientAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }
  return auth;
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
    return writeMockUser(email);
  }
  const cred = await createUserWithEmailAndPassword(
    getClientAuth(),
    email.trim(),
    password
  );
  return cred.user;
}

export async function loginWithEmail(email: string, password: string) {
  if (appConfig.mockMode) {
    if (password.length < 6) {
      throw new Error("Password should be at least 6 characters");
    }
    return writeMockUser(email);
  }
  const cred = await signInWithEmailAndPassword(
    getClientAuth(),
    email.trim(),
    password
  );
  return cred.user;
}

export async function logout() {
  if (appConfig.mockMode) {
    localStorage.removeItem(MOCK_STORAGE_KEY);
    document.cookie = `${MOCK_SESSION_COOKIE}=; path=/; max-age=0`;
    return;
  }
  await signOut(getClientAuth());
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
  return onAuthStateChanged(getClientAuth(), callback);
}

export function getCurrentMockOrNull(): MockUser | null {
  return appConfig.mockMode ? readMockUser() : null;
}
