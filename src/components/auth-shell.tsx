"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import BreakIcon from "@/components/break-icon";
import LanguageSwitcher from "@/components/language-switcher";
import { useLocale } from "@/components/locale-provider";

export default function AuthShell({
  children,
  showBack = true,
}: {
  children: React.ReactNode;
  showBack?: boolean;
}) {
  const { t, locale } = useLocale();

  return (
    <div className="min-h-dvh bg-background text-foreground flex flex-col">
      <header className="flex items-center justify-end px-4 pt-4">
        <LanguageSwitcher />
      </header>

      <main className="flex-1 w-full max-w-sm mx-auto px-5 pt-4 pb-10 md:pt-12 flex flex-col items-center">
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
