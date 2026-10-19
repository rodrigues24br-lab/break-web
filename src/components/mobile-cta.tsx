"use client"

import { useEffect, useState } from "react"
import CheckoutButton from "@/components/checkout-button"
import { useLocale } from "@/components/locale-provider"
import { cn } from "@/lib/utils"

export default function MobileCta() {
  const { t } = useLocale()
  const [hidden, setHidden] = useState(true)

  useEffect(() => {
    const targets = document.querySelectorAll("[data-hide-mobile-cta], #pricing")
    const visible = new Set<Element>()
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target)
        else visible.delete(entry.target)
      }
      setHidden(visible.size > 0)
    })
    targets.forEach((target) => observer.observe(target))
    return () => observer.disconnect()
  }, [])

  return (
    <div
      aria-hidden={hidden}
      inert={hidden}
      className={cn(
        "sm:hidden fixed inset-x-3 bottom-3 z-40 bg-card/95 backdrop-blur border border-border rounded-2xl shadow-lg px-4 py-2.5 flex items-center justify-between gap-3 transition-all duration-300",
        hidden && "translate-y-[calc(100%+1rem)] opacity-0",
      )}
    >
      <div>
        <p className="text-[14px] font-bold text-heading leading-tight">{t.mobileCta.label}</p>
        <p className="text-[12px] text-muted-foreground">{t.mobileCta.sub}</p>
      </div>
      <CheckoutButton label={t.nav.cta} size="sm" />
    </div>
  )
}
