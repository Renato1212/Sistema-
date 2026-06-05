import { clsx } from "clsx";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

const STATUS_COLORS: Record<string, string> = {
  AGENDADO: "bg-blue-50 text-blue-700 border-blue-200",
  CONFIRMADO: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REALIZADO: "bg-stone-100 text-stone-600 border-stone-200",
  CANCELADO: "bg-red-50 text-red-600 border-red-200",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2 py-0.5 text-xs font-medium border rounded-full",
        {
          "bg-areia/40 text-cacau border-areia": variant === "default",
          "bg-emerald-50 text-emerald-700 border-emerald-200": variant === "success",
          "bg-amber-50 text-amber-700 border-amber-200": variant === "warning",
          "bg-red-50 text-red-600 border-red-200": variant === "danger",
          "bg-blue-50 text-blue-700 border-blue-200": variant === "info",
        },
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const colorClass = STATUS_COLORS[status] ?? "bg-areia/40 text-cacau border-areia";
  const labels: Record<string, string> = {
    AGENDADO: "Agendado",
    CONFIRMADO: "Confirmado",
    REALIZADO: "Realizado",
    CANCELADO: "Cancelado",
  };
  return (
    <span className={clsx("inline-flex items-center px-2 py-0.5 text-xs font-medium border rounded-full", colorClass)}>
      {labels[status] ?? status}
    </span>
  );
}
