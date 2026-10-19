"use client"

import {
  BookOpen,
  Circle,
  Clock,
  Gauge,
  LayoutGrid,
  Layers,
  Moon,
  Puzzle,
  Search,
  ShieldCheck,
  Waves,
  Wind,
  Zap,
} from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import {
  AppTile,
  BRAND_APPS,
  MenuScreen,
  PauseScreen,
  PhoneFrame,
  ProtectedAppsScreen,
} from "@/components/phone-mockup"
import { cn } from "@/lib/utils"

const FEATURE_ICONS = [Layers, Moon, Gauge, Clock, ShieldCheck]
const CHALLENGE_ICONS = [Circle, Wind, Search, Puzzle, LayoutGrid, Waves, BookOpen]
const SCREENS = [ProtectedAppsScreen, PauseScreen, MenuScreen]
const SPANS = ["md:col-span-3", "md:col-span-3", "md:col-span-2", "md:col-span-2", "md:col-span-2"]

export default function FeaturesSection() {
  const { t } = useLocale()
  const f = t.features

  return (
    <section id="features" className="py-12 md:py-28 scroll-mt-16">
      <div className="max-w-6xl mx-auto px-5">
        <div className="max-w-2xl mx-auto text-center">
          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-primary">{f.eyebrow}</span>
          <h2 className="text-[32px] md:text-[40px] font-bold text-heading leading-tight mt-3 text-balance">{f.title}</h2>
          <p className="text-[16px] text-muted-foreground mt-4">{f.subtitle}</p>
        </div>

        <div
          data-hide-mobile-cta
          className="mt-8 md:mt-14 -mx-5 px-5 scroll-px-5 flex gap-3 md:gap-6 overflow-x-auto snap-x snap-mandatory md:justify-center md:overflow-visible pb-4"
        >
          {SCREENS.map((Screen, i) => (
            <figure key={f.mockups[i]} className="snap-start md:snap-center flex flex-col items-center gap-2 md:gap-4">
              <PhoneFrame compact className={cn(i === 1 && "md:-translate-y-6")}>
                <Screen />
              </PhoneFrame>
              <figcaption className="text-[13px] font-medium text-muted-foreground">{f.mockups[i]}</figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-14 grid md:grid-cols-6 gap-4">
          {f.items.map((item, i) => {
            const Icon = FEATURE_ICONS[i]
            return (
              <article key={item.title} className={cn("bg-card border border-border rounded-2xl p-6 flex flex-col", SPANS[i])}>
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" aria-hidden="true" />
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">{item.tag}</span>
                </div>
                <h3 className="text-[18px] font-bold text-heading mt-5">{item.title}</h3>
                <p className="text-[15px] text-muted-foreground mt-2 leading-relaxed">{item.body}</p>

                {i === 0 && (
                  <div className="mt-5 flex -space-x-1.5" aria-hidden="true">
                    {BRAND_APPS.map((app) => (
                      <span key={app.name} className="ring-2 ring-card rounded-[10px]">
                        <AppTile app={app} size={34} />
                      </span>
                    ))}
                  </div>
                )}
                {i === 2 && (
                  <div className="mt-5 grid gap-1.5" aria-label={item.title}>
                    {f.levels.map((level, li) => (
                      <span
                        key={level}
                        className={cn(
                          "text-[13px] font-medium rounded-lg px-3 py-1.5 border",
                          li === 1 ? "bg-accent border-primary/30 text-accent-foreground" : "bg-background border-border text-foreground",
                        )}
                      >
                        {level}
                      </span>
                    ))}
                  </div>
                )}
                {i === 3 && (
                  <div className="mt-5 flex items-center gap-1.5 flex-wrap">
                    {f.hours.map((hour, hi) => (
                      <span
                        key={hour}
                        className={cn(
                          "text-[13px] font-semibold rounded-full px-3 py-1",
                          hi === 0 ? "bg-primary text-primary-foreground" : "bg-secondary text-heading",
                        )}
                      >
                        {hour}
                      </span>
                    ))}
                    <span className="text-[13px] text-muted-foreground ml-1">· {f.perWeek}</span>
                  </div>
                )}
              </article>
            )
          })}
        </div>

        <div className="mt-4 bg-card border border-border rounded-2xl p-6 md:p-8 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-primary">
              <Zap className="w-3.5 h-3.5" aria-hidden="true" />
              {f.challengesEyebrow}
            </span>
            <h3 className="text-[22px] md:text-[26px] font-bold text-heading leading-snug mt-3 text-balance">
              {f.challengesTitle}
            </h3>
            <p className="text-[15px] text-muted-foreground mt-3">{f.challengesBody}</p>
          </div>
          <ul className="flex flex-wrap gap-2">
            {f.challenges.map((challenge, i) => {
              const Icon = CHALLENGE_ICONS[i]
              return (
                <li
                  key={challenge}
                  className="flex items-center gap-2 bg-background border border-border rounded-full pl-1.5 pr-4 py-1.5 text-[14px] font-medium"
                >
                  <span className="w-7 h-7 rounded-full bg-accent flex items-center justify-center">
                    <Icon className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                  </span>
                  {challenge}
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
