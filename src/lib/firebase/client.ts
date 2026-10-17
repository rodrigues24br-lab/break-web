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

function readMockUser(): MockUser | null {
  if (typeof window === "undefined") return null;
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
  const user: MockUser = {
    uid: `mock_${btoa(email).replace(/=+/g, "").slice(0, 16)}`,
    email,
    getIdToken: async () => `mock-token:mock`,
  };
  localStorage.setItem(
    MOCK_STORAGE_KEY,
    JSON.stringify({ uid: user.uid, email })
  );
  user.getIdToken = async () => `mock-token:${user.uid}`;
  return user;
}

export async function registerWithEmail(email: string, password: string) {
  if (appConfig.mockMode) {
    if (password.length < 6) {
      throw new Error("Password should be at least 6 characters");
    }
    return writeMockUser(email.toLowerCase().trim());
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
    return writeMockUser(email.toLowerCase().trim());
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
