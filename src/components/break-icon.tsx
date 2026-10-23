import Image from "next/image"
import { cn } from "@/lib/utils"

export default function BreakIcon({ size, alt = "", className }: { size: number; alt?: string; className?: string }) {
  return (
    <span
      className={cn("relative inline-block overflow-hidden shrink-0 bg-[#eef3fb]", className)}
      style={{ width: size, height: size, borderRadius: size * 0.23 }}
    >
      <Image
        src="/images/vemluz-icon.png"
        alt={alt}
        fill
        sizes={`${Math.round(size * 2)}px`}
        className="object-cover"
      />
    </span>
  )
}
