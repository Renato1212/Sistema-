import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PRODUCT, TENANT } from "@/lib/brand";

export const metadata: Metadata = {
  title: `${PRODUCT.name} — ${TENANT.shortName}`,
  description: PRODUCT.description,
};

export const viewport: Viewport = {
  themeColor: "#140F0B",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-PT">
      <body className="min-h-screen bg-marfim text-cacau font-hanken antialiased">
        <div className="grain" aria-hidden="true" />
        <div className="blob blob-gold" aria-hidden="true" />
        <div className="blob blob-rose" aria-hidden="true" />
        <div className="relative z-[1]">{children}</div>
      </body>
    </html>
  );
}
