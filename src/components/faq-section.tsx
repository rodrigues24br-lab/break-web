"use client"

import BreakIcon from "@/components/break-icon"
import { Plus } from "lucide-react"
import CheckoutButton from "@/components/checkout-button"
import { useLocale } from "@/components/locale-provider"

export default function FaqSection() {
  const { t } = useLocale()
  const f = t.faq

  return (
    <section id="faq" className="py-12 md:py-28 scroll-mt-16">
      <div className="max-w-3xl mx-auto px-5">
        <div className="text-center">
          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-primary">{f.eyebrow}</span>
          <h2 className="text-[32px] font-bold text-heading mt-3">{f.title}</h2>
        </div>

        <div className="mt-10 bg-card border border-border rounded-2xl divide-y divide-border">
          {f.items.map((item) => (
            <details key={item.q} className="group px-6">
              <summary className="flex items-center justify-between gap-4 py-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <span className="text-[16px] font-semibold text-heading">{item.q}</span>
                <Plus
                  className="w-5 h-5 text-primary shrink-0 transition-transform group-open:rotate-45"
                  aria-hidden="true"
                />
              </summary>
              <p className="text-[15px] text-muted-foreground leading-relaxed pb-5 -mt-1">{item.a}</p>
            </details>
          ))}
        </div>

        <div className="mt-12 bg-card border border-border rounded-3xl p-8 flex flex-col items-center text-center">
          <BreakIcon size={56} />
          <p className="font-serif font-bold text-heading text-[28px] leading-tight mt-5 text-balance">{f.closingTitle}</p>
          <p className="text-[15px] text-muted-foreground mt-2">{f.closingBody}</p>
          <div className="mt-6">
            <CheckoutButton label={t.pricing.cta} size="lg" />
          </div>
        </div>
      </div>
    </section>
  )
}
