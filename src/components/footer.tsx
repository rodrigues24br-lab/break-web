"use client"

import BreakIcon from "@/components/break-icon"
import Link from "next/link"
import LanguageSwitcher from "@/components/language-switcher"
import { useLocale } from "@/components/locale-provider"

export default function Footer() {
  const { t, locale } = useLocale()
  const links = [
    { href: "#features", label: t.nav.features },
    { href: "#pricing", label: t.nav.pricing },
    { href: "#manifesto", label: t.nav.manifesto },
    { href: `/${locale}/affiliate-program`, label: t.nav.affiliate },
    { href: "#faq", label: "FAQ" },
    { href: `/${locale}/terms`, label: t.pricing.links.terms },
    { href: `/${locale}/privacy`, label: t.pricing.links.privacy },
  ]

  return (
    <footer className="border-t border-border pt-10 pb-28 sm:pb-10">
      <div className="max-w-6xl mx-auto px-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <BreakIcon size={24} />
            <span className="text-[17px] font-semibold text-heading">Break</span>
          </div>
          <p className="text-[13px] text-muted-foreground mt-2">{t.footer.tagline}</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2">
          {links.map((link) => (
            <Link key={link.label} href={link.href} className="text-[13px] text-muted-foreground hover:text-primary transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="max-w-6xl mx-auto px-5 mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-[12px] text-muted-foreground">{t.footer.rights}</p>
        <LanguageSwitcher />
      </div>
    </footer>
  )
}
