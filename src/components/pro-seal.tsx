import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  label?: string;
};

/** Gold PRO seal for post-purchase confirmation. */
export function ProSeal({ className, label = "PRO" }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full border px-3 py-1 text-[11px] font-semibold tracking-[0.18em]",
        className
      )}
      style={{
        color: "#8B6914",
        borderColor: "rgba(184, 148, 58, 0.55)",
        background:
          "linear-gradient(180deg, #F7E7A8 0%, #E4C56A 48%, #C9A227 100%)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.55), 0 1px 2px rgba(120, 90, 20, 0.18)",
      }}
      aria-label={label}
    >
      {label}
    </span>
  );
}
