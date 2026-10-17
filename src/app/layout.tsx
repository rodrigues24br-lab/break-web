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
  title: "Break — Trade endless scroll for real life",
  description:
    "Break puts a barrier between you and endless scrolling with Screen Time blocking, challenges, and daily limits.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full`}>
      <head>
        <FirstPromoterScript />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground font-[family-name:var(--font-body)]">
        {children}
      </body>
    </html>
  );
}
