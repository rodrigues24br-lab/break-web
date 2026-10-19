"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { cn } from "@/lib/utils";

type CheckoutButtonProps = {
  label: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZES = {
  sm: "px-4 py-2 text-sm",
  md: "w-full py-3.5 text-[15px]",
  lg: "px-7 py-4 text-base",
};

export default function CheckoutButton({
  label,
  size = "md",
  className,
}: CheckoutButtonProps) {
  const { locale } = useLocale();

  return (
    <div className={cn("relative", size === "md" && "w-full")}>
      <Link
        href={`/${locale}/signup`}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-full font-semibold bg-primary text-primary-foreground shadow-[0_8px_24px_-10px_rgba(37,99,235,0.7)] hover:bg-primary/90 transition-colors",
          SIZES[size],
          className
        )}
      >
        {label}
        <ArrowRight className="w-4 h-4" aria-hidden="true" />
      </Link>
    </div>
  );
}
