"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { clsx } from "clsx";
import { CalendarDays, Users, BarChart2, LogOut } from "lucide-react";

const navItems = [
  { href: "/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/pacientes", label: "Pacientes", icon: Users },
  { href: "/dashboard", label: "Dashboard", icon: BarChart2 },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────────────── */}
      <nav className="hidden md:flex hero-dark fixed left-0 top-0 h-full w-[220px] text-white flex-col z-40 border-r border-black/20">
        <div className="px-5 py-7 border-b border-white/[0.07]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-champanhe flex items-center justify-center text-white font-bodoni font-bold text-base flex-shrink-0 shadow-lg">
              CP
            </div>
            <div>
              <p className="font-bodoni text-sm text-white leading-tight tracking-wide">Cláudia Pacheco</p>
              <p className="text-[10px] text-white/40 font-hanken tracking-[0.15em] uppercase mt-0.5">Clínica</p>
            </div>
          </div>
        </div>

        <div className="flex-1 px-3 py-5 flex flex-col gap-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  "flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm transition-all duration-200",
                  active
                    ? "bg-champanhe/20 text-champanhe font-medium"
                    : "text-white/50 hover:text-white/80 hover:bg-white/[0.06]"
                )}
              >
                <Icon size={17} strokeWidth={active ? 2 : 1.5} />
                {label}
              </Link>
            );
          })}
        </div>

        <div className="px-3 pb-8 pt-3 border-t border-white/[0.07]">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 px-3.5 py-2.5 w-full text-sm text-white/35 hover:text-white/60 transition-all duration-200 rounded-xl hover:bg-white/[0.06]"
          >
            <LogOut size={16} strokeWidth={1.5} />
            Sair
          </button>
        </div>
      </nav>

      {/* ── Mobile top bar ──────────────────────────────────────────── */}
      <header className="md:hidden hero-dark fixed top-0 inset-x-0 h-14 text-white flex items-center justify-between px-4 z-40 border-b border-white/[0.07]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-champanhe flex items-center justify-center font-bodoni font-bold text-xs shadow-sm">
            CP
          </div>
          <p className="font-bodoni text-sm tracking-wide">Cláudia Pacheco</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          aria-label="Sair"
          className="p-2 -mr-1 text-white/45 hover:text-white transition-colors rounded-xl touch-manipulation"
        >
          <LogOut size={18} strokeWidth={1.5} />
        </button>
      </header>

      {/* ── Mobile bottom tab bar ───────────────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-marfim/90 backdrop-blur-lg border-t border-black/[0.06] pb-safe"
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
                  "flex-1 flex flex-col items-center justify-center gap-1 touch-manipulation transition-colors active:bg-black/[0.03]",
                  active ? "text-champanhe" : "text-cacau/45"
                )}
              >
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
