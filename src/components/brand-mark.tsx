import { cn } from "@/lib/utils";

type BrandMarkProps = {
  className?: string;
  size?: "hero" | "nav";
};

export function BrandMark({ className, size = "hero" }: BrandMarkProps) {
  return (
    <div className={cn("animate-rise", className)}>
      <p
        className={cn(
          "font-[family-name:var(--font-display)] font-bold tracking-tight text-foreground",
          size === "hero" && "text-6xl sm:text-7xl md:text-8xl",
          size === "nav" && "text-2xl"
        )}
      >
        Break
      </p>
    </div>
  );
}
