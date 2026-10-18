"use client";

import { FormEvent, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppleLogo } from "@/components/icons/apple-logo";
import { GoogleLogo } from "@/components/icons/google-logo";
import {
  loginWithApple,
  loginWithEmail,
  loginWithGoogle,
  registerWithEmail,
  subscribeToAuth,
  type MockUser,
} from "@/lib/firebase/client";
import type { User } from "firebase/auth";
import { cn } from "@/lib/utils";

/** Matches outline social button chrome (pill/bubble). */
const authBubbleClass =
  "flex h-14 w-full items-center gap-3 rounded-2xl border border-[rgb(94_115_133/35%)] bg-white px-8 text-[#1B3A4B]";

export function SalesAuth() {
  const t = useTranslations("sales.account");
  const locale = useLocale();
  const router = useRouter();
  const [user, setUser] = useState<User | MockUser | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function revealPassword() {
    setShowPassword(true);
  }

  useEffect(() => {
    const unsub = subscribeToAuth((u) => setUser(u));
    return unsub;
  }, []);

  // Do NOT auto-redirect locale home → /plans on existing sessions.
  // Plans is only reached after explicit Create/Sign-in (below) or a
  // Continue click — anonymous (and returning) visitors stay on sales.

  async function handleAuth(e: FormEvent) {
    e.preventDefault();
    if (!showPassword) {
      revealPassword();
      return;
    }
    setError(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        await registerWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
      router.push(`/${locale}/plans`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      router.push(`/${locale}/plans`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
    } finally {
      setLoading(false);
    }
  }

  async function handleApple() {
    setError(null);
    setLoading(true);
    try {
      await loginWithApple();
      router.push(`/${locale}/plans`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
    } finally {
      setLoading(false);
    }
  }

  function switchMode(next: "signup" | "login") {
    setMode(next);
    setError(null);
    setExpanded(true);
  }

  if (user) {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-4 text-center">
        {user.email ? (
          <p className="text-sm text-muted-foreground">{user.email}</p>
        ) : null}
        <Button
          type="button"
          size="xl"
          className="w-full"
          onClick={() => router.push(`/${locale}/plans`)}
        >
          {t("continuePlans")}
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-3">
      {!expanded ? (
        <>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
            disabled={loading}
            onClick={() => {
              setMode("signup");
              setExpanded(true);
              setError(null);
            }}
          >
            {t("create")}
          </Button>
          <p className="pt-1 text-center text-sm text-muted-foreground">
            {t("haveAccount")}{" "}
            <button
              type="button"
              className="font-medium text-title underline-offset-4 hover:underline"
              onClick={() => switchMode("login")}
            >
              {t("login")}
            </button>
          </p>
        </>
      ) : (
        <>
          <form onSubmit={handleAuth} className="flex flex-col gap-3">
            <label className={cn(authBubbleClass, "cursor-text")}>
              <span className="sr-only">{t("email")}</span>
              <Input
                id="sales-email"
                name="email"
                type="email"
                required
                placeholder={t("email")}
                value={email}
                onFocus={revealPassword}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (e.target.value.length > 0) revealPassword();
                }}
                autoComplete="email"
                autoFocus
                className="h-auto flex-1 border-0 bg-transparent p-0 text-base font-semibold shadow-none focus-visible:border-0 focus-visible:ring-0"
              />
            </label>

            {showPassword ? (
              <label className={cn(authBubbleClass, "cursor-text")}>
                <span className="sr-only">{t("password")}</span>
                <Input
                  id="sales-password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  placeholder={t("password")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={
                    mode === "signup" ? "new-password" : "current-password"
                  }
                  className="h-auto flex-1 border-0 bg-transparent p-0 text-base font-semibold shadow-none focus-visible:border-0 focus-visible:ring-0"
                />
              </label>
            ) : null}

            {showPassword ? (
              <Button
                type="submit"
                variant="outline"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading
                  ? t("loading")
                  : mode === "signup"
                    ? t("create")
                    : t("login")}
              </Button>
            ) : null}

            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
          </form>

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full gap-3"
            disabled={loading}
            onClick={handleApple}
          >
            <AppleLogo className="size-5 text-[#1C2430]" />
            {t("apple")}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full gap-3"
            disabled={loading}
            onClick={handleGoogle}
          >
            <GoogleLogo className="size-5" />
            {t("google")}
          </Button>

          <p className="pt-1 text-center text-sm text-muted-foreground">
            {mode === "signup" ? (
              <>
                {t("haveAccount")}{" "}
                <button
                  type="button"
                  className="font-medium text-title underline-offset-4 hover:underline"
                  onClick={() => switchMode("login")}
                >
                  {t("login")}
                </button>
              </>
            ) : (
              <>
                {t("needAccount")}{" "}
                <button
                  type="button"
                  className="font-medium text-title underline-offset-4 hover:underline"
                  onClick={() => switchMode("signup")}
                >
                  {t("create")}
                </button>
              </>
            )}
          </p>
        </>
      )}
    </div>
  );
}
