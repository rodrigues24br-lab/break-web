"use client"

import type { CSSProperties } from "react"
import BreakIcon from "@/components/break-icon"
import { Clock, Gauge, Home, Lock, Moon, Plus, Puzzle, Settings, ShieldCheck, Wind } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import { cn } from "@/lib/utils"

// Light in-app palette matched to the page background (#F4F1EA) so the screens feel native to the site.
const APP_THEME = {
  "--background": "#f4f1ea",
  "--card": "#ffffff",
  "--border": "#e6e0d3",
  "--foreground": "#1f2937",
  "--heading": "#0f172a",
  "--muted-foreground": "#6b7280",
  "--primary": "#2563eb",
  "--primary-foreground": "#ffffff",
  "--secondary": "#e9e4d8",
  "--accent": "rgba(37,99,235,0.1)",
  "--accent-foreground": "#1d4ed8",
  "--success": "#15803d",
  "--pro": "#b45309",
} as CSSProperties

export function PhoneFrame({
  children,
  className,
  compact = false,
}: {
  children: React.ReactNode
  className?: string
  compact?: boolean
}) {
  if (compact) {
    return (
      <div className={cn("relative shrink-0 w-[165px] h-[355px] sm:w-[250px] sm:h-[538px]", className)}>
        <div className="absolute top-0 left-0 origin-top-left scale-[0.66] sm:scale-100">
          <PhoneFrame>{children}</PhoneFrame>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "relative w-[250px] shrink-0 rounded-[46px] bg-gradient-to-b from-[#3a3f47] to-[#1f232a] p-[3px] shadow-[0_30px_70px_-25px_rgba(27,58,75,0.55)]",
        className,
      )}
    >
      <div className="rounded-[43px] bg-[#0b0d11] p-[6px]">
        <div
          style={APP_THEME}
          className="relative rounded-[37px] overflow-hidden bg-background text-foreground h-[520px] flex flex-col"
        >
          <div className="flex items-center justify-between px-6 pt-3.5 pb-1 text-[12px] font-semibold text-heading">
            <span>9:41</span>
            <span className="absolute left-1/2 -translate-x-1/2 top-2.5 w-[80px] h-[24px] rounded-full bg-black" />
            <span className="flex items-center gap-1" aria-hidden="true">
              <span className="flex items-end gap-[2px]">
                {[4, 6, 8, 10].map((h) => (
                  <span key={h} className="w-[3px] rounded-sm bg-heading" style={{ height: h }} />
                ))}
              </span>
              <span className="w-5 h-2.5 rounded-[3px] border border-heading/50 p-[1px]">
                <span className="block h-full w-3/4 rounded-[1px] bg-heading" />
              </span>
            </span>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}

export type BrandApp = {
  name: string
  icon: string
  bg: string
  glyph: number
}

export const BRAND_APPS: BrandApp[] = [
  {
    name: "Instagram",
    icon: "/images/apps/instagram.svg",
    bg: "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285aeb 90%)",
    glyph: 0.58,
  },
  { name: "TikTok", icon: "/images/apps/tiktok.svg", bg: "#000000", glyph: 0.56 },
  { name: "YouTube", icon: "/images/apps/youtube.svg", bg: "#ffffff", glyph: 0.66 },
  { name: "X", icon: "/images/apps/x.svg", bg: "#000000", glyph: 0.5 },
  { name: "Reddit", icon: "/images/apps/reddit.svg", bg: "#ff4500", glyph: 0.62 },
]

/**
 * Real app icon. When `blocked`, mimics the iOS Family Controls shield:
 * the icon is softly blurred and casts a diffuse, color-matched glow.
 */
export function AppTile({ app, size = 36, blocked = false }: { app: BrandApp; size?: number; blocked?: boolean }) {
  const radius = Math.round(size * 0.24)
  return (
    <span className="relative shrink-0 inline-flex" style={{ width: size, height: size }} aria-hidden="true">
      {blocked && (
        <span
          className="absolute inset-0 scale-110 opacity-75 blur-[6px]"
          style={{ background: app.bg, borderRadius: radius }}
        />
      )}
      <span
        className={cn(
          "relative flex items-center justify-center w-full h-full overflow-hidden",
          app.bg === "#ffffff" && "ring-1 ring-black/10",
        )}
        style={{
          background: app.bg,
          borderRadius: radius,
          filter: blocked ? "blur(1.4px) saturate(1.2)" : undefined,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={app.icon}
          alt=""
          width={Math.round(size * app.glyph)}
          height={Math.round(size * app.glyph)}
          className="object-contain"
          style={{ width: size * app.glyph, height: size * app.glyph }}
        />
      </span>
    </span>
  )
}

export function FocusScreen() {
  const { t } = useLocale()
  return (
    <div className="flex-1 flex flex-col items-center px-5 pt-16 pb-3 text-center">
      <span className="[filter:blur(2.5px)]">
        <AppTile app={BRAND_APPS[0]} size={92} blocked />
      </span>

      <div className="mt-14 w-full bg-card border border-border rounded-[22px] px-5 py-8 flex flex-col items-center shadow-[0_12px_30px_-18px_rgba(15,23,42,0.35)]">
        <Lock className="w-9 h-9 text-heading" strokeWidth={1.75} aria-hidden="true" />
        <p className="text-[22px] font-semibold text-heading mt-4 leading-tight">{t.phone.focusTitle}</p>
        <p className="text-[13px] text-muted-foreground mt-1.5">{t.phone.focusUntil}</p>
      </div>

      <span className="mt-auto w-28 h-1 rounded-full bg-heading/80" aria-hidden="true" />
    </div>
  )
}

export function PauseScreen() {
  const { t } = useLocale()
  return (
    <div className="flex-1 flex flex-col items-center px-6 pt-7 pb-6 text-center">
      <BreakIcon size={52} alt="Break" className="shadow-[0_10px_24px_-6px_rgba(37,99,235,0.45)]" />
      <p className="font-serif font-bold text-[24px] leading-tight text-heading mt-5 text-balance">{t.phone.pauseTitle}</p>
      <p className="text-[12px] text-muted-foreground mt-2 text-balance">{t.phone.pauseBody}</p>

      <div className="relative mt-7 w-36 h-36 flex items-center justify-center" aria-hidden="true">
        <span className="absolute inset-0 rounded-full bg-primary/10 animate-pulse" />
        <span className="absolute inset-3 rounded-full bg-primary/10" />
        <div
          className="relative w-[104px] h-[104px] rounded-full flex items-center justify-center"
          style={{ background: "conic-gradient(var(--primary) 0 70%, var(--secondary) 70% 100%)" }}
        >
          <div className="w-[92px] h-[92px] rounded-full bg-background flex flex-col items-center justify-center">
            <Wind className="w-5 h-5 text-primary" />
            <span className="text-[28px] font-bold text-heading tabular-nums leading-none mt-1">0:07</span>
          </div>
        </div>
      </div>
      <span className="mt-4 text-[11px] font-medium text-accent-foreground bg-accent px-3 py-1 rounded-full">
        {t.phone.challengeName}
      </span>

      <span className="mt-auto w-full bg-heading text-background text-[13px] font-semibold rounded-full py-3">
        {t.phone.startChallenge}
      </span>
    </div>
  )
}

const WEEK_BARS = [70, 85, 60, 50, 40, 35, 22]

export function ProtectedAppsScreen() {
  const { t } = useLocale()
  return (
    <div className="flex-1 flex flex-col px-4 pt-3 relative">
      <span className="self-start flex items-center gap-1.5 bg-card border border-border rounded-full pl-1 pr-3 py-1">
        <BreakIcon size={20} />
        <span className="text-[14px] font-semibold text-heading">Break</span>
      </span>

      <div className="mt-3 bg-card rounded-2xl border border-border p-3">
        <p className="text-[9px] font-medium tracking-[0.14em] text-muted-foreground">{t.phone.screenTime}</p>
        <div className="flex items-baseline gap-1.5 mt-0.5">
          <span className="text-[26px] font-bold text-heading leading-none whitespace-nowrap">1h 12m</span>
          <span className="text-[10px] font-medium text-success">+2h {t.phone.savedToday}</span>
        </div>
        <div className="relative flex items-end gap-1.5 h-9 mt-2" aria-hidden="true">
          <span className="absolute inset-x-0 top-[40%] border-t border-dashed border-success/50" />
          {WEEK_BARS.map((h, i) => (
            <span
              key={i}
              className={cn("flex-1 rounded-sm", i === WEEK_BARS.length - 1 ? "bg-primary" : "bg-primary/30")}
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>

      <p className="text-[15px] font-bold text-heading mt-3">{t.phone.protectedApps}</p>
      <ul className="mt-1.5 space-y-1">
        {BRAND_APPS.map((app) => (
          <li key={app.name} className="flex items-center gap-2.5 bg-card rounded-xl border border-border px-2.5 py-1">
            <AppTile app={app} size={28} blocked />
            <span className="text-[12px] font-medium text-heading flex-1">{app.name}</span>
            <span className="flex items-center gap-1 text-[9px] font-medium text-accent-foreground bg-accent px-1.5 py-0.5 rounded-full">
              <Lock className="w-2.5 h-2.5" aria-hidden="true" />
              {t.phone.blocked}
            </span>
          </li>
        ))}
      </ul>

      <div className="absolute bottom-3 inset-x-4 flex items-center justify-around bg-card border border-border rounded-full py-1.5 shadow-[0_6px_16px_-8px_rgba(15,23,42,0.2)]">
        <span className="flex flex-col items-center text-primary">
          <Home className="w-4 h-4" aria-hidden="true" />
          <span className="text-[8px] font-medium">{t.phone.tabHome}</span>
        </span>
        <span className="w-9 h-9 -mt-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-[0_6px_16px_-4px_rgba(37,99,235,0.55)]">
          <Plus className="w-4 h-4" aria-hidden="true" />
        </span>
        <span className="flex flex-col items-center text-muted-foreground">
          <Settings className="w-4 h-4" aria-hidden="true" />
          <span className="text-[8px] font-medium">{t.phone.tabSettings}</span>
        </span>
      </div>
    </div>
  )
}

const MENU_ICONS = [Puzzle, Plus, Moon, ShieldCheck, Gauge, Clock]

export function MenuScreen() {
  const { t } = useLocale()
  return (
    <div className="flex-1 px-4 pt-5">
      <p className="text-[11px] font-bold tracking-[0.14em] text-heading">{t.phone.menuTitle}</p>
      <div className="grid grid-cols-2 gap-2 mt-3">
        {t.phone.menu.map((item, i) => {
          const Icon = MENU_ICONS[i]
          const isPaid = i > 0
          return (
            <div key={item.title} className="bg-card rounded-2xl border border-border p-2.5 flex flex-col min-h-[118px]">
              <span className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                <Icon className="w-4 h-4 text-primary" aria-hidden="true" />
              </span>
              <p className="text-[12px] font-bold text-heading mt-2 leading-tight">{item.title}</p>
              <p className="text-[9px] font-medium text-muted-foreground mt-0.5 leading-snug">{item.sub}</p>
              {isPaid && (
                <span className="mt-auto self-start flex items-center gap-1 text-[8px] font-semibold text-pro bg-pro/10 border border-pro/30 rounded-full px-1.5 py-0.5">
                  <Lock className="w-2.5 h-2.5" aria-hidden="true" />
                  {t.phone.paid}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
