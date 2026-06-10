import { clsx } from "clsx";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

const STATUS_COLORS: Record<string, string> = {
  AGENDADO: "bg-areia/10 text-areia border-areia/30",
  CONFIRMADO: "bg-emerald-400/10 text-emerald-300 border-emerald-400/25",
  REALIZADO: "bg-white/[0.06] text-cacau/55 border-white/10",
  CANCELADO: "bg-rose/10 text-rose border-rose/30",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2.5 py-0.5 text-xs font-medium border rounded-full",
        {
          "bg-areia/10 text-areia border-areia/30": variant === "default",
          "bg-emerald-400/10 text-emerald-300 border-emerald-400/25": variant === "success",
          "bg-amber-400/10 text-amber-300 border-amber-400/25": variant === "warning",
          "bg-rose/10 text-rose border-rose/30": variant === "danger",
          "bg-sky-400/10 text-sky-300 border-sky-400/25": variant === "info",
        },
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const colorClass = STATUS_COLORS[status] ?? "bg-areia/10 text-areia border-areia/30";
  const labels: Record<string, string> = {
    AGENDADO: "Agendado",
    CONFIRMADO: "Confirmado",
    REALIZADO: "Realizado",
    CANCELADO: "Cancelado",
  };
  return (
    <span className={clsx("inline-flex items-center px-2.5 py-0.5 text-xs font-medium border rounded-full", colorClass)}>
      {labels[status] ?? status}
    </span>
  );
}
