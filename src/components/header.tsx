"use client"

import BreakIcon from "@/components/break-icon"
import Link from "next/link"
import CheckoutButton from "@/components/checkout-button"
import LanguageSwitcher from "@/components/language-switcher"
import { useLocale } from "@/components/locale-provider"

export default function Header() {
  const { t, locale } = useLocale()
  const links = [
    { href: "#features", label: t.nav.features },
    { href: "#pricing", label: t.nav.pricing },
    { href: "#manifesto", label: t.nav.manifesto },
    { href: `/${locale}/affiliate-program`, label: t.nav.affiliate },
  ]

  return (
    <header className="sticky top-0 z-50 bg-background/85 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <BreakIcon size={30} />
          <span className="text-xl font-semibold text-heading tracking-tight">Break</span>
        </Link>

        <nav aria-label="Principal" className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-heading transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <div className="hidden sm:block">
            <CheckoutButton label={t.nav.cta} size="sm" />
          </div>
        </div>
      </div>
    </header>
  )
}
