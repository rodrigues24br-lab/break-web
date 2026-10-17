"use client";

import { FormEvent, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export function SalesAuth() {
  const t = useTranslations("sales.account");
  const locale = useLocale();
  const router = useRouter();
  const [user, setUser] = useState<User | MockUser | null>(null);
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

  useEffect(() => {
    if (user) {
      router.replace(`/${locale}/plans`);
    }
  }, [user, locale, router]);

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

  if (user) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        {t("redirecting")}
      </p>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-8">
      <form onSubmit={handleAuth} className="flex flex-col gap-5">
        <div className="space-y-2">
          <Label htmlFor="sales-email">{t("email")}</Label>
          <Input
            id="sales-email"
            name="email"
            type="email"
            required
            value={email}
            onFocus={revealPassword}
            onChange={(e) => {
              setEmail(e.target.value);
              if (e.target.value.length > 0) revealPassword();
            }}
            autoComplete="email"
          />
        </div>
        {showPassword ? (
          <div className="space-y-2">
            <Label htmlFor="sales-password">{t("password")}</Label>
            <Input
              id="sales-password"
              name="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={
                mode === "signup" ? "new-password" : "current-password"
              }
            />
          </div>
        ) : null}

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 pt-1">
          <Button type="submit" size="xl" className="w-full" disabled={loading}>
            {loading
              ? t("loading")
              : mode === "signup"
                ? t("create")
                : t("login")}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            {mode === "signup" ? (
              <>
                {t("haveAccount")}{" "}
                <button
                  type="button"
                  className="font-medium text-title underline-offset-4 hover:underline"
                  onClick={() => {
                    setMode("login");
                    setError(null);
                  }}
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
                  onClick={() => {
                    setMode("signup");
                    setError(null);
                  }}
                >
                  {t("create")}
                </button>
              </>
            )}
          </p>
        </div>
      </form>

      <div className="relative flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {t("or")}
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="flex flex-col gap-3">
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
      </div>
    </div>
  );
}
