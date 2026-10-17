"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const locales = [
  { code: "en", label: "EN", flag: "🇺🇸" },
  { code: "es", label: "ES", flag: "🇪🇸" },
  { code: "pt", label: "PT", flag: "🇧🇷" },
] as const;

function swapLocale(pathname: string, next: string) {
  const segments = pathname.split("/");
  if (
    segments.length > 1 &&
    (segments[1] === "en" || segments[1] === "es" || segments[1] === "pt")
  ) {
    segments[1] = next;
    return segments.join("/") || `/${next}`;
  }
  return `/${next}`;
}

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname() || `/${locale}`;

  return (
    <div className="flex items-center gap-0.5 rounded-full border border-[rgb(94_115_133/35%)] bg-white p-1 shadow-sm">
      {locales.map((l) => (
        <Link
          key={l.code}
          href={swapLocale(pathname, l.code)}
          prefetch={false}
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-semibold tracking-wider transition-colors",
            locale === l.code
              ? "bg-primary text-primary-foreground"
              : "text-[#1B3A4B] hover:bg-[#E4EEF8]"
          )}
          aria-current={locale === l.code ? "true" : undefined}
          title={l.label}
        >
          <span aria-hidden className="text-sm leading-none">
            {l.flag}
          </span>
          <span>{l.label}</span>
        </Link>
      ))}
    </div>
  );
}
