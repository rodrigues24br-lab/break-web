"use client"

import Image from "next/image"
import { Check, ShieldCheck } from "lucide-react"
import CheckoutButton from "@/components/checkout-button"
import { useLocale } from "@/components/locale-provider"

// The first image includes a baked-in headline on top; objectPosition crops to the phone.
const BLOCKED_IMAGES = [
  { src: "/images/safe-browsing-1.jpg", domain: "pornhub.com", width: 924, height: 2000, position: "50% 70%" },
  { src: "/images/safe-browsing-2.jpg", domain: "xvideos.com", width: 1008, height: 1792, position: "50% 50%" },
]

export default function SafeBrowsingSection() {
  const { t } = useLocale()
  const s = t.safe

  return (
    <section id="safe-browsing" aria-labelledby="safe-browsing-title" className="py-12 md:py-24 scroll-mt-16">
      <div className="max-w-3xl mx-auto px-5 flex flex-col items-center text-center">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-primary">
          <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
          {s.eyebrow}
        </span>
        <h2
          id="safe-browsing-title"
          className="text-[28px] md:text-[40px] font-bold text-heading leading-tight mt-3 text-balance"
        >
          {s.title}
        </h2>
      </div>

      <div
        data-hide-mobile-cta
        className="mt-8 max-w-3xl mx-auto px-5 scroll-px-5 flex gap-3 sm:gap-8 overflow-x-auto snap-x snap-mandatory sm:justify-center sm:overflow-visible pb-2"
      >
        {BLOCKED_IMAGES.map((img) => (
          <figure
            key={img.src}
            className="snap-start sm:snap-center shrink-0 w-[46%] sm:w-[280px] aspect-[924/1400] overflow-hidden rounded-2xl"
          >
            <Image
              src={img.src}
              alt={`${s.siteBlocked}: ${img.domain}`}
              width={img.width}
              height={img.height}
              sizes="(min-width: 640px) 280px, 46vw"
              className="w-full h-full object-cover"
              style={{ objectPosition: img.position }}
            />
          </figure>
        ))}
      </div>

      <div className="max-w-xl mx-auto px-5 mt-8 flex flex-col items-center">
        <p className="text-[17px] md:text-[18px] font-medium text-heading/80 text-center text-pretty">{s.subtitle}</p>
        <ul className="mt-5 flex flex-col gap-3 self-stretch">
          {s.body.map((item) => (
            <li key={item} className="flex items-start gap-3 text-[15px] text-muted-foreground leading-snug">
              <span className="mt-0.5 w-5 h-5 shrink-0 rounded-full bg-accent flex items-center justify-center">
                <Check className="w-3 h-3 text-primary" aria-hidden="true" />
              </span>
              <span className="text-pretty">{item}</span>
            </li>
          ))}
        </ul>
        <div className="mt-7">
          <CheckoutButton label={s.cta} size="sm" />
        </div>
      </div>
    </section>
  )
}
