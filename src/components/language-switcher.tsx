"use client"

import { LOCALES, type Locale } from "@/lib/i18n"
import { useLocale } from "@/components/locale-provider"
import { cn } from "@/lib/utils"

export default function LanguageSwitcher({ locales = LOCALES }: { locales?: readonly Locale[] }) {
  const { locale, setLocale, t } = useLocale()

  return (
    <div
      role="group"
      aria-label={t.nav.language}
      className="flex items-center rounded-full border border-border bg-card/60 p-0.5 text-[11px] font-medium"
    >
      {locales.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          aria-pressed={locale === code}
          className={cn(
            "px-2 py-1 rounded-full uppercase tracking-wide transition-colors",
            locale === code ? "bg-secondary text-heading" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {code}
        </button>
      ))}
    </div>
  )
}
