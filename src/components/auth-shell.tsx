"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AmbientBg } from "@/components/ambient-bg";
import BreakIcon from "@/components/break-icon";
import LanguageSwitcher from "@/components/language-switcher";
import { useLocale } from "@/components/locale-provider";
import { cn } from "@/lib/utils";

export default function AuthShell({
  children,
  showBack = true,
  ambient = false,
}: {
  children: React.ReactNode;
  showBack?: boolean;
  ambient?: boolean;
}) {
  const { t, locale } = useLocale();

  return (
    <div
      className={cn(
        "min-h-dvh text-foreground flex flex-col",
        ambient ? "relative bg-transparent" : "bg-background"
      )}
    >
      {ambient ? <AmbientBg /> : null}
      <header className="relative z-10 flex items-center justify-end px-4 pt-4">
        <LanguageSwitcher />
      </header>

      <main className="relative z-10 flex-1 w-full max-w-sm mx-auto px-5 pt-4 pb-10 md:pt-12 flex flex-col items-center">
        <BreakIcon
          size={64}
          alt="Break"
          className="shadow-[0_14px_32px_-12px_rgba(28,36,48,0.55)]"
        />
        {children}
      </main>

      {showBack && (
        <footer className="pb-8 flex justify-center">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-heading transition-colors"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            {t.auth.back}
          </Link>
        </footer>
      )}
    </div>
  );
}
