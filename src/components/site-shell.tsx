import { MockBanner } from "@/components/mock-banner";

/** Minimal shell — new layout brings its own header/footer. */
export async function SiteShell({
  children,
}: {
  children: React.ReactNode;
  locale: string;
}) {
  return (
    <div className="relative flex min-h-full flex-col">
      <MockBanner />
      {children}
    </div>
  );
}
