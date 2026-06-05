"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { clsx } from "clsx";
import { CalendarDays, Users, BarChart2, LogOut, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

const navItems = [
  { href: "/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/pacientes", label: "Pacientes", icon: Users },
  { href: "/dashboard", label: "Dashboard", icon: BarChart2 },
];

function NavLinks({ pathname, onNav }: { pathname: string; onNav?: () => void }) {
  return (
    <>
      <div className="flex-1 px-3 py-5 flex flex-col gap-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNav}
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
    </>
  );
}

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────────────── */}
      <nav className="hidden md:flex fixed left-0 top-0 h-full w-[220px] bg-cacau text-white flex-col z-40">
        <div className="isolinhas px-5 py-7 border-b border-white/[0.07]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-champanhe flex items-center justify-center text-white font-bodoni font-bold text-base flex-shrink-0 shadow-lg ring-2 ring-champanhe/30">
              CP
            </div>
            <div>
              <p className="font-bodoni text-sm text-white leading-tight tracking-wide">Cláudia Pacheco</p>
              <p className="text-[10px] text-white/40 font-hanken tracking-[0.15em] uppercase mt-0.5">Clínica</p>
            </div>
          </div>
        </div>
        <NavLinks pathname={pathname} />
      </nav>

      {/* ── Mobile top bar ──────────────────────────────────────────── */}
      <header className="md:hidden fixed top-0 inset-x-0 h-14 bg-cacau text-white flex items-center px-3 z-40 border-b border-white/[0.07]">
        <button
          onClick={() => setOpen(true)}
          aria-label="Abrir menu"
          aria-expanded={open}
          className="p-2 -ml-1 text-white/60 hover:text-white transition-colors rounded-xl touch-manipulation"
        >
          <Menu size={22} />
        </button>

        <div className="absolute inset-x-0 flex items-center justify-center gap-2.5 pointer-events-none">
          <div className="w-7 h-7 rounded-full bg-champanhe flex items-center justify-center font-bodoni font-bold text-xs shadow-sm ring-1 ring-champanhe/30">
            CP
          </div>
          <p className="font-bodoni text-sm tracking-wide">Cláudia Pacheco</p>
        </div>
      </header>

      {/* ── Mobile overlay ──────────────────────────────────────────── */}
      <div
        className={clsx(
          "md:hidden fixed inset-0 z-50 bg-cacau/60 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* ── Mobile drawer ───────────────────────────────────────────── */}
      <nav
        className={clsx(
          "md:hidden fixed left-0 top-0 h-full w-[280px] bg-cacau text-white flex flex-col z-50 transition-transform duration-300 ease-out shadow-2xl",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Menu de navegação"
      >
        <div className="isolinhas flex items-center justify-between px-5 py-5 border-b border-white/[0.07]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-champanhe flex items-center justify-center font-bodoni font-bold text-sm shadow-lg ring-2 ring-champanhe/30">
              CP
            </div>
            <div>
              <p className="font-bodoni text-sm text-white leading-tight">Cláudia Pacheco</p>
              <p className="text-[10px] text-white/40 tracking-[0.15em] uppercase mt-0.5">Clínica</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Fechar menu"
            className="p-1.5 text-white/40 hover:text-white transition-colors rounded-xl touch-manipulation"
          >
            <X size={18} />
          </button>
        </div>

        <NavLinks pathname={pathname} onNav={() => setOpen(false)} />
      </nav>
    </>
  );
}
