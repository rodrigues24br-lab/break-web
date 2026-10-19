import Image from "next/image"
import { cn } from "@/lib/utils"

export default function BreakIcon({ size, alt = "", className }: { size: number; alt?: string; className?: string }) {
  return (
    <span
      className={cn("relative inline-block overflow-hidden shrink-0 bg-[#1c2230]", className)}
      style={{ width: size, height: size, borderRadius: size * 0.23 }}
    >
      <Image
        src="/images/break-logo-keystone.jpg"
        alt={alt}
        fill
        sizes={`${Math.round(size * 2)}px`}
        className="object-cover"
      />
    </span>
  )
}
