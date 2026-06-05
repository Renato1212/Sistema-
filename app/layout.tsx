import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CRM Cláudia Pacheco",
  description: "Sistema interno de gestão clínica",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-marfim text-cacau font-hanken antialiased">
        {children}
      </body>
    </html>
  );
}
