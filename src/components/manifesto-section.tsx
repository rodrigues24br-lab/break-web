"use client"

import { Check, Star } from "lucide-react"
import { useLocale } from "@/components/locale-provider"

export default function ManifestoSection() {
  const { t } = useLocale()
  const m = t.manifesto

  return (
    <section id="manifesto" className="py-12 md:py-28 bg-secondary/50 scroll-mt-16">
      <div className="max-w-6xl mx-auto px-5">
        <div className="grid md:grid-cols-5 gap-10">
          <div className="md:col-span-3">
            <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-primary">{m.eyebrow}</span>
            <h2 className="font-serif font-bold text-heading text-[34px] md:text-[48px] leading-[1.1] mt-3 text-balance">
              {m.title}
            </h2>
            <div className="mt-6 space-y-4 max-w-xl">
              {m.paragraphs.map((paragraph) => (
                <p key={paragraph} className="text-[16px] text-foreground/80 leading-relaxed text-pretty">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <ul className="md:col-span-2 bg-card border border-border rounded-2xl p-6 self-end divide-y divide-border">
            {m.phrases.map((phrase) => (
              <li key={phrase} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <Check className="w-4 h-4 text-success shrink-0" aria-hidden="true" />
                <span className="text-[16px] font-semibold text-heading">{phrase}</span>
              </li>
            ))}
          </ul>
        </div>

        <h3 className="text-[20px] font-bold text-heading mt-16">{m.testimonialsTitle}</h3>
        <div className="marquee mt-5 -mx-5 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
          <div className="animate-marquee flex w-max gap-4 px-2">
          {[...m.testimonials, ...m.testimonials].map((item, index) => (
            <figure
              key={`${item.author}-${index}`}
              aria-hidden={index >= m.testimonials.length || undefined}
              className="w-[290px] shrink-0 bg-card border border-border rounded-2xl p-6 flex flex-col"
            >
              <div className="flex items-center justify-between">
                <div className="flex gap-0.5" role="img" aria-label="5/5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-warning text-warning" aria-hidden="true" />
                  ))}
                </div>
                <span className="text-[11px] font-semibold text-success bg-success/10 px-2 py-0.5 rounded-full">
                  {item.result}
                </span>
              </div>
              <blockquote className="text-[15px] leading-relaxed mt-4 flex-1">
                {"\u201C"}
                {item.quote}
                {"\u201D"}
              </blockquote>
              <figcaption className="flex items-center gap-3 mt-6">
                <span
                  className="w-9 h-9 rounded-full bg-accent text-accent-foreground text-[13px] font-semibold flex items-center justify-center"
                  aria-hidden="true"
                >
                  {item.author
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </span>
                <span>
                  <span className="block text-[14px] font-semibold text-heading">{item.author}</span>
                  <span className="block text-[13px] text-muted-foreground">{item.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
          </div>
        </div>
      </div>
    </section>
  )
}
