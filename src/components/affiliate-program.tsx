"use client"

import { useState, type ReactNode } from "react"
import Image from "next/image"
import {
  BadgeDollarSign,
  CalendarClock,
  Camera,
  Check,
  ChevronDown,
  Link2,
  Megaphone,
  MessageCircle,
  Send,
  Share2,
  X,
} from "lucide-react"
import AffiliateSearch from "@/components/affiliate-search"
import BreakIcon from "@/components/break-icon"
import LanguageSwitcher from "@/components/language-switcher"
import { useLocale } from "@/components/locale-provider"
import {
  AFFILIATE_COPY,
  MARKET_DATA,
  PROJECTION_SALES_PER_DAY,
  formatMoney,
  type Market,
} from "@/lib/affiliate-copy"

function useAffiliateCopy() {
  const { locale } = useLocale()
  return {
    locale,
    t: AFFILIATE_COPY[locale],
    money: (market: Market, value: number) => formatMoney(locale, market, value),
  }
}

function SectionHeader({
  emoji,
  eyebrow,
  title,
  body,
  id,
}: {
  emoji: string
  eyebrow: string
  title: string
  body?: ReactNode
  id: string
}) {
  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3">
        <span
          className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center text-2xl shadow-sm"
          aria-hidden="true"
        >
          {emoji}
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">{eyebrow}</span>
      </div>
      <h2 id={id} className="text-[30px] md:text-[42px] font-bold text-heading leading-tight mt-4 text-balance">
        {title}
      </h2>
      {body && <div className="text-[16px] text-muted-foreground mt-4 leading-relaxed text-pretty">{body}</div>}
    </div>
  )
}

function Section({ children, id, tinted = false }: { children: ReactNode; id: string; tinted?: boolean }) {
  return (
    <section
      aria-labelledby={id}
      className={`py-16 md:py-24 ${tinted ? "bg-card/60 border-y border-border" : ""}`}
    >
      <div className="max-w-6xl mx-auto px-5">{children}</div>
    </section>
  )
}

function Callout({ emoji, children, tone = "info" }: { emoji: string; children: ReactNode; tone?: "info" | "warn" }) {
  return (
    <div
      className={`flex items-start gap-3 rounded-2xl p-5 border ${
        tone === "warn" ? "bg-amber-50 border-amber-200 text-amber-950" : "bg-accent border-primary/20 text-heading"
      }`}
    >
      <span className="text-xl leading-none mt-0.5" aria-hidden="true">
        {emoji}
      </span>
      <div className="text-[15px] leading-relaxed">{children}</div>
    </div>
  )
}

export function AffiliateHeader() {
  const { t } = useAffiliateCopy()
  return (
    <header className="sticky top-0 z-50 bg-background/85 backdrop-blur-md border-b border-border">
      <div className="relative max-w-6xl mx-auto px-5 h-16 flex items-center gap-3 md:gap-6">
        <div className="flex items-center gap-2 shrink-0">
          <BreakIcon size={30} alt="Vemluz" />
          <span className="hidden sm:inline text-xl font-semibold text-heading tracking-tight">Vemluz</span>
        </div>
        <AffiliateSearch />
        <div className="flex items-center gap-3 shrink-0">
          <span className="hidden xl:inline-flex text-[12px] font-medium text-muted-foreground bg-card border border-border rounded-full px-3 py-1">
            {t.header.badge}
          </span>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  )
}

function Hero() {
  const { t } = useAffiliateCopy()
  const hero = t.hero
  return (
    <section className="pt-12 pb-16 md:pt-20 md:pb-24">
      <div className="max-w-6xl mx-auto px-5 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <span className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-primary">
            {hero.eyebrow}
          </span>
          <h1 className="text-[38px] md:text-[56px] font-bold text-heading leading-[1.05] mt-4 text-balance">
            {hero.title}
          </h1>
          <p className="text-[17px] md:text-[19px] text-muted-foreground mt-5 leading-relaxed text-pretty">
            {hero.body}
          </p>
          <ul className="mt-7 flex flex-wrap gap-2">
            {hero.chips.map((chip) => (
              <li
                key={chip}
                className="text-[13px] font-medium text-heading bg-card border border-border rounded-full px-3.5 py-1.5"
              >
                {chip}
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <Callout emoji="💬">
              <strong>{hero.calloutStrong}</strong> {hero.calloutText}
            </Callout>
          </div>
        </div>
        <div className="relative">
          <div
            className="absolute inset-8 rounded-full bg-gradient-to-br from-amber-200/50 via-transparent to-primary/30 blur-3xl"
            aria-hidden="true"
          />
          <Image
            src="/images/affiliate-hero.png"
            alt={hero.imageAlt}
            width={1024}
            height={1024}
            priority
            className="relative w-full max-w-md mx-auto rounded-[32px]"
          />
        </div>
      </div>
    </section>
  )
}

function WhatIs() {
  const { t } = useAffiliateCopy()
  const copy = t.whatIs
  return (
    <Section id="what-is">
      <SectionHeader id="what-is" emoji="💡" eyebrow={copy.eyebrow} title={copy.title} body={copy.body} />
      <ol className="mt-10 grid sm:grid-cols-3 gap-5">
        {copy.facts.map((fact, i) => (
          <li key={fact.title} className="bg-card border border-border rounded-2xl p-6 flex flex-col">
            <div className="flex items-center justify-between">
              <span className="text-3xl" aria-hidden="true">
                {fact.emoji}
              </span>
              <span className="text-[13px] font-semibold text-muted-foreground">0{i + 1}</span>
            </div>
            <h3 className="text-[17px] font-bold text-heading mt-4">{fact.title}</h3>
            <p className="text-[14px] text-muted-foreground mt-2 leading-relaxed">{fact.text}</p>
          </li>
        ))}
      </ol>
      <div className="mt-6">
        <Callout emoji="🙏" tone="warn">
          <strong>{copy.honestStrong}</strong> {copy.honestText}
        </Callout>
      </div>
    </Section>
  )
}

function MarketToggle({ market, onChange }: { market: Market; onChange: (m: Market) => void }) {
  const { t } = useAffiliateCopy()
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-card border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[14px] text-muted-foreground leading-relaxed">
        {t.market.intro}
        {t.market.notes[market]}
      </p>
      <div role="radiogroup" aria-label={t.market.aria} className="inline-flex shrink-0 rounded-full bg-muted p-1">
        {(Object.keys(MARKET_DATA) as Market[]).map((key) => {
          const active = key === market
          return (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(key)}
              className={`rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors ${
                active ? "bg-primary text-primary-foreground shadow" : "text-heading hover:bg-card"
              }`}
            >
              <span aria-hidden="true">{MARKET_DATA[key].flag} </span>
              {t.market.labels[key]}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function WhatIsSold({ market, onMarketChange }: { market: Market; onMarketChange: (m: Market) => void }) {
  const { t, money } = useAffiliateCopy()
  const copy = t.sold
  const bars = [
    { label: copy.competitor, value: copy.bars[0], w: "100%", muted: true },
    { label: copy.competitor, value: copy.bars[1], w: "60%", muted: true },
    { label: "Vemluz", value: copy.bars[2], w: "50%", muted: false },
  ]
  return (
    <Section id="sold" tinted>
      <SectionHeader id="sold" emoji="🛒" eyebrow={copy.eyebrow} title={copy.title} body={copy.body} />
      <div className="mt-10">
        <MarketToggle market={market} onChange={onMarketChange} />
      </div>
      <div className="mt-5 grid md:grid-cols-3 gap-5">
        <div className="md:col-span-1 relative bg-card border-2 border-primary rounded-3xl p-7 shadow-[0_30px_60px_-30px_rgba(37,99,235,0.45)]">
          <span className="text-[12px] font-semibold uppercase tracking-wider text-primary">
            {`${MARKET_DATA[market].flag} ${copy.planLabel} · ${t.market.labels[market]}`}
          </span>
          <p className="mt-3 flex items-baseline gap-2">
            <span className="text-[44px] font-bold text-heading leading-none tracking-tight">
              {money(market, MARKET_DATA[market].price)}
            </span>
            <span className="text-[14px] text-muted-foreground">{copy.perYear}</span>
          </p>
          <ul className="mt-5 space-y-2.5 text-[14px]">
            {copy.features.map((item) => (
              <li key={item} className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-success shrink-0" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-card border border-border rounded-3xl p-7">
          <span className="text-3xl" aria-hidden="true">
            🏷️
          </span>
          <h3 className="text-[17px] font-bold text-heading mt-4">{copy.priceTitle}</h3>
          <p className="text-[14px] text-muted-foreground mt-2 leading-relaxed">{copy.priceText}</p>
          <div className="mt-5 space-y-2" aria-hidden="true">
            {bars.map((bar) => (
              <div key={bar.value} className="flex items-center gap-3 text-[12px]">
                <span className="w-20 shrink-0 text-muted-foreground">{bar.label}</span>
                <div className="flex-1 h-6 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full flex items-center justify-end pr-2 font-semibold ${
                      bar.muted ? "bg-muted-foreground/30 text-heading" : "bg-primary text-primary-foreground"
                    }`}
                    style={{ width: bar.w }}
                  >
                    {bar.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card border border-border rounded-3xl p-7">
          <span className="text-3xl" aria-hidden="true">
            🍎
          </span>
          <h3 className="text-[17px] font-bold text-heading mt-4">{copy.iphoneTitle}</h3>
          <p className="text-[14px] text-muted-foreground mt-2 leading-relaxed">{copy.iphoneText}</p>
          <div className="mt-5 flex flex-wrap gap-2 text-[12px] font-medium">
            <span className="bg-success/10 text-success rounded-full px-3 py-1">{copy.iphoneChip}</span>
            <span className="bg-muted text-heading rounded-full px-3 py-1">{copy.androidChip}</span>
          </div>
        </div>
      </div>
    </Section>
  )
}

function HowSaleWorks() {
  const { t } = useAffiliateCopy()
  const copy = t.sale
  return (
    <Section id="how-sale">
      <SectionHeader id="how-sale" emoji="🔄" eyebrow={copy.eyebrow} title={copy.title} />
      <ol className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {copy.steps.map((step, i) => (
          <li key={step.title} className="relative bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <span
                className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center text-2xl"
                aria-hidden="true"
              >
                {step.emoji}
              </span>
              <span className="text-[13px] font-semibold text-muted-foreground">0{i + 1}</span>
            </div>
            <h3 className="text-[17px] font-bold text-heading mt-5">{step.title}</h3>
            <p className="text-[14px] text-muted-foreground mt-2 leading-relaxed">{step.text}</p>
            {i < copy.steps.length - 1 && (
              <span
                className="hidden lg:flex absolute top-1/2 -right-4 z-10 w-7 h-7 -translate-y-1/2 rounded-full bg-primary text-primary-foreground items-center justify-center text-[13px]"
                aria-hidden="true"
              >
                {"→"}
              </span>
            )}
          </li>
        ))}
      </ol>
      <div className="mt-6">
        <Callout emoji="🛟">
          {copy.calloutText}
          <strong>{copy.calloutStrong}</strong>
          {copy.calloutEnd}
        </Callout>
      </div>
    </Section>
  )
}

function Plans({ market }: { market: Market }) {
  const { t, money } = useAffiliateCopy()
  const copy = t.plans
  const data = MARKET_DATA[market]
  const plans = [
    {
      icon: Link2,
      mode: copy.noVideo,
      name: copy.planA,
      summary: copy.summaryA,
      percent: "30%",
      average: money(market, data.planA),
      video: false,
      steps: [MessageCircle, Share2, BadgeDollarSign].map((icon, i) => ({ icon, text: copy.stepsA[i] })),
    },
    {
      icon: Camera,
      mode: copy.withVideo,
      name: copy.planB,
      summary: copy.summaryB,
      percent: "50%",
      average: money(market, data.planB),
      video: true,
      steps: [Camera, Send, Megaphone, BadgeDollarSign].map((icon, i) => ({ icon, text: copy.stepsB[i] })),
    },
  ]
  return (
    <Section id="plans" tinted>
      <SectionHeader id="plans" emoji="💎" eyebrow={copy.eyebrow} title={copy.title} body={copy.body} />
      <div className="mt-10 grid md:grid-cols-2 gap-5">
        {plans.map((plan) => (
          <article
            key={plan.name}
            className={`relative flex flex-col bg-card rounded-3xl overflow-hidden ${
              plan.video
                ? "border-2 border-primary shadow-[0_30px_60px_-30px_rgba(37,99,235,0.45)]"
                : "border border-border"
            }`}
          >
            <div
              className={`flex items-center justify-between gap-3 px-7 md:px-8 py-4 ${
                plan.video ? "bg-primary text-primary-foreground" : "bg-muted text-heading"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    plan.video ? "bg-primary-foreground/15" : "bg-card border border-border"
                  }`}
                >
                  <plan.icon className="w-5 h-5" aria-hidden="true" />
                </span>
                <span className="text-[15px] font-bold uppercase tracking-wider">{plan.mode}</span>
              </div>
              {plan.video && (
                <span className="text-[11px] font-semibold uppercase tracking-wider bg-primary-foreground/15 px-3 py-1 rounded-full">
                  {copy.highest}
                </span>
              )}
            </div>
            <div className="flex flex-1 flex-col p-7 md:p-8">
              <h3 className="text-[22px] font-bold text-heading">{plan.name}</h3>
              <p className="mt-3 text-[16px] leading-relaxed text-foreground text-pretty">{plan.summary}</p>
              <p className="mt-6 flex items-baseline gap-2 border-t border-border pt-6">
                <span className="text-[60px] font-bold text-heading leading-none tracking-tight">{plan.percent}</span>
                <span className="text-[15px] text-muted-foreground">{copy.perSale}</span>
              </p>
              <p className="mt-3 inline-block text-[13px] font-medium text-success bg-success/10 px-3 py-1 rounded-full">
                {`${copy.average(plan.average)} · ${data.flag}`}
              </p>
              <div className="mt-6 border-t border-border pt-6">
                <h4 className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {copy.stepsTitle}
                </h4>
                <ol className="mt-4 flex flex-col">
                  {plan.steps.map((step, index) => {
                    const isLast = index === plan.steps.length - 1
                    return (
                      <li key={step.text} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <span
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                              isLast
                                ? "bg-success/15 text-success"
                                : plan.video
                                  ? "bg-primary/10 text-primary"
                                  : "bg-muted text-heading"
                            }`}
                          >
                            <step.icon className="w-5 h-5" aria-hidden="true" />
                          </span>
                          {!isLast && <span className="w-px flex-1 min-h-4 bg-border" aria-hidden="true" />}
                        </div>
                        <div className={isLast ? "pt-1" : "pt-1 pb-5"}>
                          <span className="block text-[12px] font-semibold text-muted-foreground">
                            {copy.step(index + 1)}
                          </span>
                          <span
                            className={`block text-[15px] leading-snug ${
                              isLast ? "font-semibold text-heading" : "text-foreground"
                            }`}
                          >
                            {step.text}
                          </span>
                        </div>
                      </li>
                    )
                  })}
                </ol>
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="mt-6">
        <Callout emoji="🤔">
          <strong>{copy.chooseStrong}</strong>
          {copy.chooseText}
        </Callout>
      </div>
    </Section>
  )
}

function HowToPromote() {
  const { t } = useAffiliateCopy()
  return (
    <Section id="promote">
      <SectionHeader id="promote" emoji="📣" eyebrow={t.promote.eyebrow} title={t.promote.title} />
      <ul className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {t.promote.items.map((item) => (
          <li key={item.title} className="bg-card border border-border rounded-2xl p-6">
            <span className="text-3xl" aria-hidden="true">
              {item.emoji}
            </span>
            <h3 className="text-[17px] font-bold text-heading mt-4">{item.title}</h3>
            <p className="text-[14px] text-muted-foreground mt-2 leading-relaxed">{item.text}</p>
          </li>
        ))}
      </ul>
    </Section>
  )
}

function Commissions() {
  const { t } = useAffiliateCopy()
  const copy = t.commissions
  return (
    <Section id="commissions" tinted>
      <SectionHeader id="commissions" emoji="💰" eyebrow={copy.eyebrow} title={copy.title} body={copy.body} />

      <div className="mt-10 grid lg:grid-cols-2 gap-5">
        <article className="bg-card border border-border rounded-3xl p-7">
          <div className="flex items-center gap-3">
            <span className="text-3xl" aria-hidden="true">
              ♾️
            </span>
            <h3 className="text-[19px] font-bold text-heading">{copy.lifetimeTitle}</h3>
          </div>
          <p className="text-[14px] text-muted-foreground mt-3 leading-relaxed">{copy.lifetimeText}</p>
          <ol className="mt-6 flex flex-col gap-3">
            {copy.years.map((year, i) => (
              <li key={year} className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground text-[13px] font-bold flex items-center justify-center shrink-0">
                  {i < 3 ? i + 1 : "…"}
                </span>
                <span className="flex-1 flex items-center justify-between rounded-xl bg-accent px-4 py-2.5 text-[14px] font-medium text-heading">
                  {year}
                  <span aria-hidden="true">{i < 3 ? "💸" : "♾️"}</span>
                </span>
              </li>
            ))}
          </ol>
        </article>

        <article className="bg-card border border-border rounded-3xl p-7">
          <div className="flex items-center gap-3">
            <span className="text-3xl" aria-hidden="true">
              🍪
            </span>
            <h3 className="text-[19px] font-bold text-heading">{copy.cookieTitle}</h3>
          </div>
          <p className="text-[14px] text-muted-foreground mt-3 leading-relaxed">{copy.cookieText}</p>
          <ol className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {copy.timeline.map((point) => (
              <li
                key={point.day}
                className={`rounded-2xl p-4 text-center border ${
                  point.valid ? "bg-success/10 border-success/30" : "bg-muted border-border"
                }`}
              >
                <span
                  className={`mx-auto w-8 h-8 rounded-full flex items-center justify-center ${
                    point.valid ? "bg-success text-white" : "bg-muted-foreground/40 text-white"
                  }`}
                >
                  {point.valid ? (
                    <Check className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <X className="w-4 h-4" aria-hidden="true" />
                  )}
                </span>
                <p className="mt-2 text-[14px] font-bold text-heading">{point.day}</p>
                <p className="text-[12px] text-muted-foreground leading-snug mt-1">{point.text}</p>
              </li>
            ))}
          </ol>
        </article>
      </div>

      <div className="mt-5 grid md:grid-cols-2 gap-5">
        <div className="flex items-start gap-4 bg-card border border-border rounded-2xl p-6">
          <span className="w-11 h-11 rounded-xl bg-accent text-accent-foreground flex items-center justify-center shrink-0">
            <CalendarClock className="w-5 h-5" aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-[16px] font-bold text-heading">{copy.payoutTitle}</h3>
            <p className="text-[14px] text-muted-foreground mt-1.5 leading-relaxed">{copy.payoutText}</p>
          </div>
        </div>
        <div className="flex items-start gap-4 bg-card border border-border rounded-2xl p-6">
          <span className="text-2xl w-11 h-11 rounded-xl bg-accent flex items-center justify-center shrink-0" aria-hidden="true">
            🎥
          </span>
          <div>
            <h3 className="text-[16px] font-bold text-heading">{copy.fixedTitle}</h3>
            <p className="text-[14px] text-muted-foreground mt-1.5 leading-relaxed">{copy.fixedText}</p>
          </div>
        </div>
      </div>
    </Section>
  )
}

function Projections({ market, onMarketChange }: { market: Market; onMarketChange: (m: Market) => void }) {
  const { t, money } = useAffiliateCopy()
  const copy = t.projections
  const data = MARKET_DATA[market]
  return (
    <Section id="projections">
      <SectionHeader id="projections" emoji="📈" eyebrow={copy.eyebrow} title={copy.title} body={copy.body} />
      <div className="mt-10">
        <MarketToggle market={market} onChange={onMarketChange} />
      </div>
      <div className="mt-5 overflow-x-auto rounded-3xl border border-border bg-card">
        <table className="w-full min-w-[480px] text-left">
          <caption className="sr-only">{copy.caption(t.market.labels[market])}</caption>
          <thead>
            <tr className="border-b border-border text-[12px] uppercase tracking-wider text-muted-foreground">
              <th scope="col" className="px-6 py-4 font-semibold">
                {copy.salesPerDay}
              </th>
              <th scope="col" className="px-6 py-4 font-semibold">
                {`🔗 ${t.plans.planA} · 30%`}
              </th>
              <th scope="col" className="px-6 py-4 font-semibold text-primary">
                {`🎥 ${t.plans.planB} · 50%`}
              </th>
            </tr>
          </thead>
          <tbody>
            {PROJECTION_SALES_PER_DAY.map((perDay) => (
              <tr key={perDay} className="border-b border-border last:border-0">
                <th scope="row" className="px-6 py-4 text-[15px] font-semibold text-heading">
                  {copy.sales(perDay)}
                </th>
                <td className="px-6 py-4 text-[16px] font-semibold text-heading tabular-nums">
                  {money(market, perDay * data.planA * 30)}
                  <span className="text-[12px] font-normal text-muted-foreground">{copy.perMonth}</span>
                </td>
                <td className="px-6 py-4 text-[16px] font-bold text-primary tabular-nums">
                  {money(market, perDay * data.planB * 30)}
                  <span className="text-[12px] font-normal text-muted-foreground">{copy.perMonth}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-5">
        <Callout emoji="⚠️" tone="warn">
          {copy.warnText}
          <strong>{copy.warnStrong}</strong>
        </Callout>
      </div>
    </Section>
  )
}

function FirstSteps() {
  const { t } = useAffiliateCopy()
  return (
    <Section id="first-steps" tinted>
      <SectionHeader id="first-steps" emoji="🚀" eyebrow={t.firstSteps.eyebrow} title={t.firstSteps.title} />
      <ol className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {t.firstSteps.steps.map((step, i) => (
          <li key={step.title} className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <span className="text-3xl" aria-hidden="true">
                {step.emoji}
              </span>
              <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground text-[13px] font-bold flex items-center justify-center">
                {i + 1}
              </span>
            </div>
            <h3 className="text-[17px] font-bold text-heading mt-4">{step.title}</h3>
            <p className="text-[14px] text-muted-foreground mt-2 leading-relaxed">{step.text}</p>
          </li>
        ))}
      </ol>
    </Section>
  )
}

function Faq() {
  const { t } = useAffiliateCopy()
  return (
    <Section id="faq">
      <SectionHeader id="faq" emoji="❓" eyebrow={t.faq.eyebrow} title={t.faq.title} />
      <div className="mt-10 grid gap-3 max-w-3xl">
        {t.faq.items.map((item) => (
          <details key={item.q} className="group bg-card border border-border rounded-2xl px-6 py-5">
            <summary className="flex items-center justify-between gap-4 cursor-pointer list-none text-[16px] font-semibold text-heading [&::-webkit-details-marker]:hidden">
              {item.q}
              <ChevronDown
                className="w-5 h-5 text-muted-foreground shrink-0 transition-transform group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <p className="text-[15px] text-muted-foreground mt-3 leading-relaxed">{item.a}</p>
          </details>
        ))}
      </div>
    </Section>
  )
}

function Closing() {
  const { t } = useAffiliateCopy()
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-3xl mx-auto px-5">
        <div className="rounded-3xl bg-gradient-to-br from-primary to-[#1b3a4b] text-primary-foreground p-8 md:p-12 text-center">
          <span className="mx-auto w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center">
            <MessageCircle className="w-7 h-7" aria-hidden="true" />
          </span>
          <h2 className="text-[28px] md:text-[36px] font-bold mt-5 text-balance">{t.closing.title}</h2>
          <p className="text-[16px] text-white/80 mt-3 leading-relaxed text-pretty">{t.closing.text}</p>
        </div>
      </div>
    </section>
  )
}

export function AffiliateContent() {
  const [market, setMarket] = useState<Market>("us")
  return (
    <>
      <Hero />
      <WhatIs />
      <WhatIsSold market={market} onMarketChange={setMarket} />
      <HowSaleWorks />
      <Plans market={market} />
      <HowToPromote />
      <Commissions />
      <Projections market={market} onMarketChange={setMarket} />
      <FirstSteps />
      <Faq />
      <Closing />
    </>
  )
}

export function AffiliateFooter() {
  const { t } = useAffiliateCopy()
  return (
    <footer className="border-t border-border py-10">
      <div className="max-w-6xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <BreakIcon size={24} />
          <span className="text-[17px] font-semibold text-heading">Vemluz</span>
        </div>
        <p className="text-[12px] text-muted-foreground">
          {`© ${new Date().getFullYear()} Vemluz. ${t.footer.rights}`}
        </p>
      </div>
    </footer>
  )
}
