import { cn } from "@/lib/utils";

type Props = {
  href: string;
  className?: string;
  label?: string;
};

/**
 * Official-style black Apple App Store badge (SVG).
 * Links to the App Store product page.
 */
export function AppStoreBadge({
  href,
  className,
  label = "Download on the App Store",
}: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={cn(
        "inline-block shrink-0 transition opacity-95 hover:opacity-100",
        className
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 120 40"
        width={148}
        height={49}
        role="img"
        aria-hidden="true"
      >
        <title>{label}</title>
        <rect width="120" height="40" rx="8" fill="#000" />
        <path
          fill="#fff"
          d="M24.77 20.3c0-2.27 1.86-3.37 1.94-3.42-1.06-1.55-2.71-1.76-3.29-1.78-1.39-.14-2.72.83-3.43.83-.71 0-1.81-.81-2.98-.79-1.53.02-2.95.9-3.73 2.28-1.61 2.79-.41 6.91 1.14 9.18.76 1.11 1.66 2.35 2.84 2.31 1.15-.05 1.58-.73 2.97-.73 1.38 0 1.77.73 2.98.71 1.24-.02 2.01-1.12 2.76-2.24.87-1.26 1.22-2.49 1.24-2.55-.03-.01-2.37-.91-2.4-3.6zm-2.25-6.64c.62-.76 1.05-1.81.93-2.86-.9.04-1.99.61-2.63 1.36-.57.67-1.08 1.75-.94 2.78 1 .08 2.02-.5 2.64-1.28z"
        />
        <g fill="#fff" fontFamily="Helvetica, Arial, sans-serif">
          <text x="36.5" y="15.2" fontSize="5.6" letterSpacing="0.02em">
            Download on the
          </text>
          <text x="36.2" y="28.5" fontSize="11.2" fontWeight="600" letterSpacing="-0.02em">
            App Store
          </text>
        </g>
      </svg>
    </a>
  );
}
