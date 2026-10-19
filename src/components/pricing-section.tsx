"use client"

import BreakIcon from "@/components/break-icon"
import { Check, Lock } from "lucide-react"
import CheckoutButton from "@/components/checkout-button"
import { useLocale } from "@/components/locale-provider"
import { ANNUAL_PLAN } from "@/lib/products"
import { cn } from "@/lib/utils"

export default function PricingSection() {
  const { t, locale } = useLocale()
  const p = t.pricing
  const amount = (ANNUAL_PLAN.priceInCents / 100).toLocaleString(locale === "en" ? "en-US" : locale, {
    minimumFractionDigits: 2,
  })
  const price = locale === "en" ? `$${amount}` : `US$${amount}`
  const links = [
    { href: "#manifesto", label: p.links.skip },
    { href: "#faq", label: p.links.restore },
    { href: `/${locale}/terms`, label: p.links.terms },
    { href: `/${locale}/privacy`, label: p.links.privacy },
    { href: `/${locale}/support`, label: p.links.support },
  ]

  return (
    <section id="pricing" className="py-12 md:py-28 scroll-mt-16">
      <div className="max-w-6xl mx-auto px-5 grid md:grid-cols-2 gap-14 items-center">
        <div>
          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-primary">{p.eyebrow}</span>
          <h2 className="text-[32px] md:text-[44px] font-bold text-heading leading-tight mt-3">{p.title}</h2>
          <p className="text-[16px] text-muted-foreground mt-4 max-w-md">{p.subtitle}</p>

          <ol className="mt-10 relative">
            {p.timeline.map((step, i) => (
              <li key={step.when} className="relative pl-10 pb-8 last:pb-0">
                {i < p.timeline.length - 1 && (
                  <span className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-secondary" aria-hidden="true" />
                )}
                <span
                  className={cn(
                    "absolute left-0 top-0.5 w-6 h-6 rounded-full flex items-center justify-center",
                    i === 0 ? "bg-primary text-primary-foreground" : "bg-card border-2 border-secondary text-muted-foreground",
                  )}
                  aria-hidden="true"
                >
                  {i === 0 ? <Check className="w-3.5 h-3.5" /> : <span className="w-1.5 h-1.5 rounded-full bg-current" />}
                </span>
                <p className="text-[15px] font-bold text-heading">{step.when}</p>
                <p className="text-[14px] text-muted-foreground mt-0.5">{step.what}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="relative bg-card border-2 border-primary rounded-3xl p-7 md:p-8 shadow-[0_30px_60px_-30px_rgba(37,99,235,0.45)]">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full whitespace-nowrap">
            {p.badge}
          </span>

          <div className="flex items-center gap-3">
            <BreakIcon size={44} />
            <div>
              <p className="text-[13px] font-medium text-muted-foreground">{p.planLabel}</p>
              <p className="flex items-center gap-2 text-[20px] font-bold text-heading leading-tight">
                {p.plan}
                <span className="text-[10px] font-bold tracking-wider text-pro bg-pro/10 px-1.5 py-0.5 rounded">PRO</span>
              </p>
            </div>
          </div>

          <div className="flex items-baseline gap-1 mt-6">
            <span className="text-[48px] font-bold text-heading leading-none tracking-tight">{price}</span>
            <span className="text-[15px] text-muted-foreground">{p.period}</span>
          </div>
          <p className="text-[14px] font-medium text-foreground mt-3">{p.trial}</p>
          <span className="inline-block mt-2 text-[12px] font-medium text-success bg-success/10 px-2.5 py-1 rounded-full">
            {p.monthly}
          </span>

          <ul className="mt-6 space-y-3 border-t border-border pt-6">
            {p.includes.map((feature) => (
              <li key={feature} className="flex items-start gap-3">
                <span className="mt-0.5 w-5 h-5 rounded-full bg-success/15 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-success" aria-hidden="true" />
                </span>
                <span className="text-[14px] leading-snug">{feature}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <CheckoutButton label={p.cta} />
          </div>
          <p className="flex items-center justify-center gap-1.5 text-[12px] text-muted-foreground mt-3">
            <Lock className="w-3 h-3" aria-hidden="true" />
            {p.secure}
          </p>

          <nav aria-label={p.plan} className="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-1">
            {links.map((link) => (
              <a key={link.label} href={link.href} className="text-[12px] text-muted-foreground hover:text-primary transition-colors">
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </section>
  )
}
