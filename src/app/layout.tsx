import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { FirstPromoterScript } from "@/components/firstpromoter-script";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Vemluz — Seu tempo, de volta pra você",
  description:
    "Vemluz bloqueia os apps que roubam sua atenção, protege seu sono e te devolve o controle do dia. US$49,99 por ano.",
  icons: {
    icon: "/images/vemluz-icon.png",
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#f4f1ea",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <head>
        <FirstPromoterScript />
      </head>
      <body className="min-h-full flex flex-col font-sans antialiased bg-background text-foreground">
        {children}
        <Script id="rewardful-queue" strategy="beforeInteractive">
          {`(function(w,r){w._rwq=r;w[r]=w[r]||function(){(w[r].q=w[r].q||[]).push(arguments)}})(window,'rewardful');`}
        </Script>
        <Script src="https://r.wdfl.co/rw.js" data-rewardful="cd2599" strategy="afterInteractive" />
      </body>
    </html>
  );
}
