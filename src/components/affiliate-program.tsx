"use client"

import Link from "next/link"
import {
  ArrowRight,
  BarChart3,
  Check,
  Crown,
  Gamepad2,
  Gauge,
  Link2,
  Lock,
  Moon,
  MousePointerClick,
  Repeat,
  ShieldCheck,
  Timer,
  Wallet,
} from "lucide-react"
import BreakIcon from "@/components/break-icon"
import LanguageSwitcher from "@/components/language-switcher"
import { useLocale } from "@/components/locale-provider"
import { AFFILIATE_COPY, AFFILIATE_LOCALES, AFFILIATE_SIGNUP_URL, toAffiliateLocale } from "@/lib/affiliate-copy"

const stepIcons = [Link2, MousePointerClick, Wallet, Repeat]
const productIcons = [Lock, Gamepad2, Moon, ShieldCheck, Gauge, Timer, BarChart3, Crown]

function useAffiliateCopy() {
  const { locale } = useLocale()
  return AFFILIATE_COPY[toAffiliateLocale(locale)]
}

function AffiliateCta({ className = "" }: { className?: string }) {
  const copy = useAffiliateCopy()
  return (
    <a
      href={AFFILIATE_SIGNUP_URL}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold bg-primary text-primary-foreground px-8 py-4 text-[17px] shadow-[0_8px_24px_-10px_rgba(37,99,235,0.7)] hover:bg-primary/90 transition-colors ${className}`}
    >
      {copy.cta}
      <ArrowRight className="w-5 h-5" aria-hidden="true" />
    </a>
  )
}

export function AffiliateHeader() {
  const { locale } = useLocale()
  const copy = useAffiliateCopy()
  return (
    <header className="sticky top-0 z-50 bg-background/85 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <BreakIcon size={30} alt="Vemluz" />
          <span className="text-xl font-semibold text-heading tracking-tight">Vemluz</span>
        </Link>
        <div className="flex items-center gap-3">
          <LanguageSwitcher locales={AFFILIATE_LOCALES} />
          <a
            href={AFFILIATE_SIGNUP_URL}
            className="hidden sm:inline-flex items-center gap-2 rounded-full font-semibold bg-primary text-primary-foreground px-4 py-2 text-sm hover:bg-primary/90 transition-colors"
          >
            {copy.cta}
          </a>
        </div>
      </div>
    </header>
  )
}

export function AffiliateHero() {
  const { hero } = useAffiliateCopy()
  return (
    <section className="py-16 md:py-28">
      <div className="max-w-3xl mx-auto px-5 flex flex-col items-center text-center">
        <BreakIcon size={72} alt={hero.logoAlt} className="shadow-[0_20px_40px_-20px_rgba(28,34,48,0.6)]" />
        <span className="mt-8 text-[10px] font-medium uppercase tracking-[0.14em] text-primary">{hero.eyebrow}</span>
        <h1 className="text-[36px] md:text-[56px] font-bold text-heading leading-tight mt-3 text-balance">
          {hero.title}
        </h1>
        <p className="text-[17px] md:text-[19px] text-muted-foreground mt-5 max-w-2xl text-pretty">
          {hero.subtitleStart}
          <strong className="text-heading">{hero.subtitleHighlight}</strong>
          {hero.subtitleEnd}
        </p>
        <AffiliateCta className="mt-10" />
        <p className="text-[13px] text-muted-foreground mt-4">{hero.note}</p>
      </div>
    </section>
  )
}

export function AffiliateCommission() {
  const { commission } = useAffiliateCopy()
  return (
    <section className="pb-16 md:pb-24">
      <div className="max-w-6xl mx-auto px-5 grid md:grid-cols-2 gap-10 md:gap-14 items-center">
        <div>
          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-primary">{commission.eyebrow}</span>
          <h2 className="text-[32px] md:text-[44px] font-bold text-heading leading-tight mt-3 text-balance">
            {commission.title}
          </h2>
          <p className="text-[16px] text-muted-foreground mt-4 max-w-md leading-relaxed">{commission.body}</p>
        </div>

        <div className="relative bg-card border-2 border-primary rounded-3xl p-7 md:p-8 shadow-[0_30px_60px_-30px_rgba(37,99,235,0.45)]">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full whitespace-nowrap">
            {commission.badge}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-[64px] font-bold text-heading leading-none tracking-tight">30%</span>
            <span className="text-[15px] text-muted-foreground">{commission.per}</span>
          </div>
          <span className="inline-block mt-4 text-[12px] font-medium text-success bg-success/10 px-2.5 py-1 rounded-full">
            {commission.paid}
          </span>
          <ul className="mt-6 space-y-3 border-t border-border pt-6">
            {commission.perks.map((perk) => (
              <li key={perk} className="flex items-start gap-3">
                <span className="mt-0.5 w-5 h-5 rounded-full bg-success/15 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-success" aria-hidden="true" />
                </span>
                <span className="text-[14px] leading-snug">{perk}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export function AffiliateProduct() {
  const { product } = useAffiliateCopy()
  return (
    <section aria-labelledby="product-title" className="py-16 md:py-24 border-t border-border">
      <div className="max-w-6xl mx-auto px-5">
        <div className="max-w-2xl">
          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-primary">{product.eyebrow}</span>
          <h2
            id="product-title"
            className="text-[32px] md:text-[44px] font-bold text-heading leading-tight mt-3 text-balance"
          >
            {product.title}
          </h2>
          <p className="text-[20px] md:text-[24px] font-semibold text-heading mt-4 text-balance">{product.lead}</p>
          <p className="text-[16px] text-muted-foreground mt-3 leading-relaxed">{product.body}</p>
        </div>

        <ul className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {product.features.map((feature, i) => {
            const Icon = productIcons[i]
            const isPro = "highlight" in feature && Boolean(feature.highlight)
            return (
              <li
                key={feature.title}
                className={`flex flex-col rounded-2xl p-6 bg-card ${
                  isPro ? "border-2 border-primary shadow-[0_20px_40px_-24px_rgba(37,99,235,0.55)]" : "border border-border"
                }`}
              >
                <span
                  className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                    isPro ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </span>
                <h3 className="text-[17px] font-bold text-heading mt-5">{feature.title}</h3>
                {isPro && "highlight" in feature && (
                  <span className="mt-2 text-[22px] font-bold text-primary leading-none">{feature.highlight}</span>
                )}
                <p className="text-[14px] text-muted-foreground mt-2 leading-relaxed">{feature.text}</p>
              </li>
            )
          })}
        </ul>

        <ul className="mt-12 flex flex-col md:flex-row md:items-center md:justify-center gap-3 md:gap-8">
          {product.taglines.map((line) => (
            <li key={line} className="flex items-center gap-2 text-[15px] font-semibold text-heading">
              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" aria-hidden="true" />
              {line}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function AffiliateHowItWorks() {
  const { how } = useAffiliateCopy()
  return (
    <section className="py-16 md:py-24 bg-card border-y border-border">
      <div className="max-w-6xl mx-auto px-5">
        <div className="max-w-2xl">
          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-primary">{how.eyebrow}</span>
          <h2 className="text-[32px] md:text-[44px] font-bold text-heading leading-tight mt-3 text-balance">
            {how.title}
          </h2>
          <p className="text-[16px] text-muted-foreground mt-4 leading-relaxed">{how.body}</p>
        </div>
        <ol className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {how.steps.map((step, i) => {
            const Icon = stepIcons[i]
            return (
              <li key={step.title} className="flex flex-col bg-background border border-border rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <span className="w-11 h-11 rounded-xl bg-accent text-accent-foreground flex items-center justify-center">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </span>
                  <span className="text-[13px] font-semibold text-muted-foreground">0{i + 1}</span>
                </div>
                <h3 className="text-[17px] font-bold text-heading mt-5">{step.title}</h3>
                <p className="text-[14px] text-muted-foreground mt-2 leading-relaxed">{step.text}</p>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}

export function AffiliateFinalCta() {
  const { final } = useAffiliateCopy()
  return (
    <section className="py-16 md:py-28">
      <div className="max-w-3xl mx-auto px-5 flex flex-col items-center text-center">
        <h2 className="text-[32px] md:text-[44px] font-bold text-heading leading-tight text-balance">{final.title}</h2>
        <p className="text-[16px] text-muted-foreground mt-4 max-w-xl">{final.body}</p>
        <AffiliateCta className="mt-10" />
      </div>
    </section>
  )
}

export function AffiliateFooter() {
  const { locale } = useLocale()
  const copy = useAffiliateCopy()
  return (
    <footer className="border-t border-border py-10">
      <div className="max-w-6xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <BreakIcon size={24} />
          <span className="text-[17px] font-semibold text-heading">Vemluz</span>
        </Link>
        <p className="text-[12px] text-muted-foreground">
          {"© "}
          {new Date().getFullYear()} Vemluz. {copy.rights}
        </p>
      </div>
    </footer>
  )
}
