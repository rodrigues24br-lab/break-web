import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { FirstPromoterScript } from "@/components/firstpromoter-script";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Break — Seu tempo, de volta pra você",
  description:
    "Break bloqueia os apps que roubam sua atenção, protege seu sono e te devolve o controle do dia. US$49,99 por ano.",
  icons: {
    icon: "/images/break-logo-keystone.jpg",
    apple: "/images/break-logo-keystone.jpg",
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
      </body>
    </html>
  );
}
