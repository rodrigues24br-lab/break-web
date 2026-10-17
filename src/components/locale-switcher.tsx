"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const locales = [
  { code: "es", label: "ES" },
  { code: "pt", label: "PT" },
] as const;

function swapLocale(pathname: string, next: string) {
  const segments = pathname.split("/");
  if (segments.length > 1 && (segments[1] === "es" || segments[1] === "pt")) {
    segments[1] = next;
    return segments.join("/") || `/${next}`;
  }
  return `/${next}`;
}

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname() || `/${locale}`;

  return (
    <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1">
      {locales.map((l) => (
        <Link
          key={l.code}
          href={swapLocale(pathname, l.code)}
          prefetch={false}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-semibold tracking-wider transition-colors",
            locale === l.code
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
          aria-current={locale === l.code ? "true" : undefined}
        >
          {l.label}
        </Link>
      ))}
    </div>
  );
}
