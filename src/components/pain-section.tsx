"use client"

import CheckoutButton from "@/components/checkout-button"
import { useLocale } from "@/components/locale-provider"

export default function PainSection() {
  const { t } = useLocale()
  const p = t.pain

  return (
    <section className="py-12 md:py-28 bg-secondary/50">
      <div className="max-w-6xl mx-auto px-5">
        <div className="max-w-2xl">
          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-primary">{p.eyebrow}</span>
          <h2 className="text-[32px] md:text-[44px] font-bold text-heading leading-tight mt-3 text-balance">{p.title}</h2>
          <p className="text-[16px] text-muted-foreground mt-4 text-pretty">{p.body}</p>
        </div>

        <ol className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {p.lines.map((line, i) => (
            <li key={line} className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-6 min-h-[150px]">
              <span className="text-[13px] font-semibold text-primary tabular-nums">{String(i + 1).padStart(2, "0")}</span>
              <p className="text-[20px] font-bold text-heading leading-snug mt-auto text-balance">{line}</p>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex justify-center">
          <CheckoutButton label={p.cta} size="lg" />
        </div>
      </div>
    </section>
  )
}
