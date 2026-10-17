"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppleLogo } from "@/components/icons/apple-logo";
import { GoogleLogo } from "@/components/icons/google-logo";
import { appConfig } from "@/lib/config";
import {
  loginWithApple,
  loginWithEmail,
  loginWithGoogle,
  registerWithEmail,
} from "@/lib/firebase/client";

type Mode = "signup" | "login";

export function AuthForm({ mode }: { mode: Mode }) {
  const t = useTranslations(mode);
  const tAuth = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (appConfig.mockMode) {
      return;
    }

    e.preventDefault();
    setError(null);
    setLoading(true);

    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") || "").trim();
    const password = String(data.get("password") || "");

    try {
      if (mode === "signup") {
        await registerWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
      router.push(`/${locale}/plans`);
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : t("error");
      setError(message || t("error"));
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      router.push(`/${locale}/plans`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
      setLoading(false);
    }
  }

  async function handleApple() {
    setError(null);
    setLoading(true);
    try {
      await loginWithApple();
      router.push(`/${locale}/plans`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-5">
      <form
        method="post"
        action="/api/auth/session"
        onSubmit={onSubmit}
        className="flex flex-col gap-5"
      >
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="mode" value={mode} />
        <div className="space-y-2">
          <Label htmlFor="email">{t("email")}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">{t("password")}</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            required
            minLength={6}
          />
        </div>
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" size="xl" className="w-full" disabled={loading}>
          {loading ? t("loading") : t("submit")}
        </Button>
      </form>

      <div className="relative flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {tAuth("or")}
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full gap-3"
        disabled={loading}
        onClick={handleApple}
      >
        <AppleLogo className="size-5 text-[#1C2430]" />
        {tAuth("apple")}
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
        {tAuth("google")}
      </Button>
    </div>
  );
}
