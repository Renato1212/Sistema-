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
    <nav className="fixed left-0 top-0 h-full w-[220px] bg-cacau text-white flex flex-col z-40">
      {/* Brand header */}
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

      {/* Nav links */}
      <div className="flex-1 px-3 py-5 flex flex-col gap-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-200",
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

      {/* Sign out */}
      <div className="px-3 pb-5 pt-3 border-t border-white/[0.07]">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3.5 py-2.5 w-full text-sm text-white/35 hover:text-white/60 transition-all duration-200 rounded-xl hover:bg-white/[0.06]"
        >
          <LogOut size={16} strokeWidth={1.5} />
          Sair
        </button>
      </div>
    </nav>
  );
}
