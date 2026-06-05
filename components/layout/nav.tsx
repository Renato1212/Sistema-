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
      <div className="isolinhas px-6 py-8 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-champanhe flex items-center justify-center text-white font-bodoni font-bold text-lg flex-shrink-0">
            CP
          </div>
          <div>
            <p className="font-bodoni text-sm text-white leading-tight">Cláudia Pacheco</p>
            <p className="text-xs text-white/40 font-hanken tracking-wide">Clínica</p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <div className="flex-1 px-3 py-6 flex flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-all",
                active
                  ? "bg-champanhe text-white font-medium"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </div>

      {/* Sign out */}
      <div className="px-3 pb-6">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2.5 w-full text-sm text-white/50 hover:text-white transition-colors rounded-sm hover:bg-white/5"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </nav>
  );
}
