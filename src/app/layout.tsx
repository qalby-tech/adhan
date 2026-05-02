import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { pickLocale, RTL_LOCALES } from "@/lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  title: "Adhan — Prayer Times & Qibla",
  description:
    "Accurate Islamic prayer times, sunrise, and a live qibla compass. Built with adhan-js.",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#070b1a",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const locale = pickLocale(h.get("accept-language"));
  const dir = RTL_LOCALES.includes(locale) ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir}>
      <body className="font-body antialiased min-h-screen">
        <div className="star-field absolute inset-0 -z-10" />
        {children}
      </body>
    </html>
  );
}
