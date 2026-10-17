import type { Metadata } from "next";
import { Manrope, Syne } from "next/font/google";
import { FirstPromoterScript } from "@/components/firstpromoter-script";
import "./globals.css";

const display = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Break — Pro",
  description: "Create your account and activate Break Pro.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${display.variable} ${body.variable} dark h-full`}>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-body)]">
        {children}
        <FirstPromoterScript />
      </body>
    </html>
  );
}
