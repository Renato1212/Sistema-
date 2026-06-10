"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { clsx } from "clsx";
import { CalendarDays, Users, BarChart2, LogOut } from "lucide-react";
import { TENANT } from "@/lib/brand";

const navItems = [
  { href: "/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/pacientes", label: "Pacientes", icon: Users },
  { href: "/dashboard", label: "Dashboard", icon: BarChart2 },
];

function BrandMark({ size = "md" }: { size?: "sm" | "md" }) {
  return (
    <div
      className={clsx(
        "rounded-full bg-grad flex items-center justify-center text-[#241A10] font-bodoni font-bold flex-shrink-0 shadow-gold",
        size === "md" ? "w-10 h-10 text-base" : "w-7 h-7 text-xs"
      )}
    >
      {TENANT.initials}
    </div>
  );
}

export function Nav() {
  const pathname = usePathname();

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────────────── */}
      <nav className="hidden md:flex fixed left-0 top-0 h-full w-[230px] bg-espresso/90 backdrop-blur-md text-cacau flex-col z-40 border-r border-white/[0.06]">
        <div className="px-5 py-7 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <BrandMark />
            <div>
              <p className="font-bodoni font-semibold text-sm text-cacau leading-tight tracking-wide">
                {TENANT.shortName}
              </p>
              <p className="text-[10px] text-cacau/35 font-hanken tracking-[0.15em] uppercase mt-0.5">
                {TENANT.subtitle}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 px-3 py-5 flex flex-col gap-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  "relative flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm transition-all duration-200",
                  active
                    ? "text-areia bg-champanhe/[0.12] font-medium shadow-[inset_0_0_0_1px_rgba(221,190,137,0.25)]"
                    : "text-cacau/45 hover:text-cacau/85 hover:bg-white/[0.05]"
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-full bg-grad" />
                )}
                <Icon size={17} strokeWidth={active ? 2 : 1.5} />
                {label}
              </Link>
            );
          })}
        </div>

        <div className="px-3 pb-8 pt-3 border-t border-white/[0.06]">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 px-3.5 py-2.5 w-full text-sm text-cacau/35 hover:text-cacau/70 transition-all duration-200 rounded-xl hover:bg-white/[0.05]"
          >
            <LogOut size={16} strokeWidth={1.5} />
            Sair
          </button>
        </div>
      </nav>

      {/* ── Mobile top bar ──────────────────────────────────────────── */}
      <header className="md:hidden fixed top-0 inset-x-0 h-14 bg-espresso/85 backdrop-blur-lg text-cacau flex items-center justify-between px-4 z-40 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <BrandMark size="sm" />
          <p className="font-bodoni font-semibold text-sm tracking-wide">{TENANT.shortName}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          aria-label="Sair"
          className="p-2 -mr-1 text-cacau/40 hover:text-cacau transition-colors rounded-xl touch-manipulation"
        >
          <LogOut size={18} strokeWidth={1.5} />
        </button>
      </header>

      {/* ── Mobile bottom tab bar ───────────────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-espresso/90 backdrop-blur-lg border-t border-white/[0.07] pb-safe"
        aria-label="Navegação principal"
      >
        <div className="flex items-stretch h-16">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "relative flex-1 flex flex-col items-center justify-center gap-1 touch-manipulation transition-colors active:bg-white/[0.04]",
                  active ? "text-areia" : "text-cacau/40"
                )}
              >
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-9 h-[2.5px] rounded-full bg-grad" />
                )}
                <Icon size={22} strokeWidth={active ? 2.2 : 1.7} />
                <span className={clsx("text-[10px] tracking-wide", active ? "font-semibold" : "font-medium")}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
