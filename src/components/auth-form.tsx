"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FirebaseError } from "firebase/app";
import { useLocale } from "@/components/locale-provider";
import { AppleLogo } from "@/components/icons/apple-logo";
import { GoogleLogo } from "@/components/icons/google-logo";
import type { Dictionary } from "@/lib/i18n";
import {
  loginWithApple,
  loginWithEmail,
  loginWithGoogle,
  registerWithEmail,
} from "@/lib/firebase/client";

type Mode = "signup" | "login";
type Pending = null | "email" | "google" | "apple";

function errorMessage(error: unknown, e: Dictionary["auth"]["errors"]) {
  if (!(error instanceof FirebaseError)) {
    if (error instanceof Error && error.message) return error.message;
    return e.generic;
  }
  switch (error.code) {
    case "auth/email-already-in-use":
      return e.emailInUse;
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return e.invalid;
    case "auth/invalid-email":
      return e.invalidEmail;
    case "auth/weak-password":
      return e.weak;
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return e.popupClosed;
    default:
      return e.generic;
  }
}

const inputClass =
  "w-full rounded-2xl border border-border bg-white px-4 py-3 text-[15px] text-heading placeholder:text-muted-foreground/70 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition";

const socialClass =
  "w-full inline-flex items-center justify-center gap-2.5 rounded-2xl border border-border bg-white px-4 py-3 text-[15px] font-medium text-heading hover:bg-white/70 transition-colors disabled:opacity-60";

export function AuthForm({ mode }: { mode: Mode }) {
  const { t, locale } = useLocale();
  const a = t.auth;
  const copy = a[mode];
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState<Pending>(null);
  const [error, setError] = useState<string | null>(null);

  const navigated = useRef(false);
  const goToPlans = () => {
    if (navigated.current) return;
    navigated.current = true;
    router.replace(`/${locale}/plans`);
    router.refresh();
  };

  async function run(
    kind: Exclude<Pending, null>,
    action: () => Promise<void>
  ) {
    setError(null);
    setPending(kind);
    try {
      await action();
      goToPlans();
    } catch (err) {
      setError(errorMessage(err, a.errors));
      setPending(null);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mode === "signup") {
      if (password.length < 6) return setError(a.errors.weak);
      if (password !== confirm) return setError(a.errors.mismatch);
    }
    void run("email", async () => {
      if (mode === "signup") {
        await registerWithEmail(email.trim(), password);
      } else {
        await loginWithEmail(email.trim(), password);
      }
    });
  }

  const busy = pending !== null;

  return (
    <div className="w-full mt-6">
      <div className="text-center">
        <h1 className="text-[28px] leading-tight font-bold tracking-tight text-heading text-balance">
          {copy.title}
        </h1>
        <p className="mt-1.5 text-[15px] text-muted-foreground text-pretty">
          {copy.subtitle}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-6 flex flex-col gap-2.5"
        noValidate
      >
        <label className="sr-only" htmlFor="auth-email">
          {a.email}
        </label>
        <input
          id="auth-email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          placeholder={a.email}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
        <label className="sr-only" htmlFor="auth-password">
          {a.password}
        </label>
        <input
          id="auth-password"
          type="password"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          required
          minLength={6}
          placeholder={a.password}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
        {mode === "signup" && (
          <>
            <label className="sr-only" htmlFor="auth-confirm">
              {a.confirmPassword}
            </label>
            <input
              id="auth-confirm"
              type="password"
              autoComplete="new-password"
              required
              placeholder={a.confirmPassword}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={inputClass}
            />
          </>
        )}

        {error && (
          <p role="alert" className="text-[13px] text-destructive text-center">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          aria-busy={pending === "email"}
          className="mt-1.5 w-full rounded-2xl bg-[#2563EB] px-4 py-3 text-[15px] font-semibold text-white shadow-[0_8px_24px_-10px_rgba(37,99,235,0.7)] hover:bg-[#2563EB]/90 transition-colors disabled:opacity-70"
        >
          {pending === "email" ? a.loading : copy.submit}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3 text-[12px] uppercase tracking-wider text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        {a.or}
        <span className="h-px flex-1 bg-border" />
      </div>

      <div className="flex flex-col gap-2.5">
        <button
          type="button"
          onClick={() => void run("google", () => loginWithGoogle().then(() => undefined))}
          disabled={busy}
          className={socialClass}
        >
          <GoogleLogo className="size-[18px]" />
          {pending === "google" ? a.loading : a.google}
        </button>
        <button
          type="button"
          onClick={() => void run("apple", () => loginWithApple().then(() => undefined))}
          disabled={busy}
          className={socialClass}
        >
          <AppleLogo className="size-[18px]" />
          {pending === "apple" ? a.loading : a.apple}
        </button>
      </div>

      <p className="mt-6 text-center">
        <Link
          href={`/${locale}/${mode === "signup" ? "login" : "signup"}`}
          className="text-sm text-muted-foreground underline-offset-4 hover:underline hover:text-heading transition-colors"
        >
          {copy.switchPrompt}
        </Link>
      </p>
    </div>
  );
}

export default AuthForm;
