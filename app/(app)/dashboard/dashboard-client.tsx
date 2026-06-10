"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { formatCurrency, formatDate } from "@/lib/format";
import { startOfMonth, startOfYear, subDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";

type Preset = "today" | "week" | "month" | "year" | "custom";

interface DashboardData {
  total: number;
  currency: string;
  byDate: { date: string; amount: number }[];
  byPatient: { id: string; name: string; total: number }[];
  byProcedure: { id: string; name: string; total: number }[];
}

const CHART_COLORS = ["#C9A368", "#E0A89E", "#DDBE89", "#A86B4A", "#B6A48C", "#8C6A4F"];

const TOOLTIP_STYLE = {
  background: "#211913",
  border: "1px solid rgba(221,190,137,0.25)",
  borderRadius: 12,
  fontSize: 12,
  color: "#F4ECDF",
  boxShadow: "0 16px 40px rgba(0,0,0,0.6)",
};

const fmt = (d: Date) => format(d, "yyyy-MM-dd");

function getPresetDates(preset: Preset): { from: string; to: string } {
  const now = new Date();
  switch (preset) {
    case "today": return { from: fmt(now), to: fmt(now) };
    case "week": return { from: fmt(subDays(now, 7)), to: fmt(now) };
    case "month": return { from: fmt(startOfMonth(now)), to: fmt(now) };
    case "year": return { from: fmt(startOfYear(now)), to: fmt(now) };
    default: return { from: fmt(subDays(now, 30)), to: fmt(now) };
  }
}

export function DashboardClient() {
  const currency = "EUR";
  const [preset, setPreset] = useState<Preset>("month");
  const [dates, setDates] = useState(getPresetDates("month"));
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ from: dates.from, to: dates.to, currency });
      const res = await fetch(`/api/dashboard?${params}`);
      if (res.ok) setData(await res.json());
    } catch { /* network error — leave data null */ }
    setLoading(false);
  }, [dates]);

  useEffect(() => { fetchData(); }, [fetchData]);

  function selectPreset(p: Preset) {
    setPreset(p);
    if (p !== "custom") setDates(getPresetDates(p));
  }

  const presets: { key: Preset; label: string }[] = [
    { key: "today", label: "Hoje" },
    { key: "week", label: "7 dias" },
    { key: "month", label: "Mês" },
    { key: "year", label: "Ano" },
    { key: "custom", label: "…" },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-6xl">
      <div className="mb-6 sm:mb-8">
        <p className="kicker mb-1.5">Visão geral</p>
        <h1 className="font-bodoni font-bold text-display-md text-cacau">Dashboard</h1>
      </div>

      {/* Controls */}
      <div className="cp-card p-3 sm:p-4 mb-6 sm:mb-8 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-1 bg-marfim/70 border border-white/[0.06] rounded-xl p-1 flex-wrap">
          {presets.map((p) => (
            <button
              key={p.key}
              onClick={() => selectPreset(p.key)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-all duration-200 touch-manipulation ${
                preset === p.key
                  ? "bg-champanhe text-[#241A10] font-semibold shadow-gold"
                  : "text-cacau/50 hover:text-cacau"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {preset === "custom" && (
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <input type="date" value={dates.from}
              onChange={(e) => setDates((d) => ({ ...d, from: e.target.value }))}
              className="cp-field px-3 py-1.5 text-sm flex-1 sm:flex-none sm:w-auto" />
            <span className="text-cacau/30 text-xs">–</span>
            <input type="date" value={dates.to}
              onChange={(e) => setDates((d) => ({ ...d, to: e.target.value }))}
              className="cp-field px-3 py-1.5 text-sm flex-1 sm:flex-none sm:w-auto" />
          </div>
        )}

        <span className="ml-auto text-xs text-cacau/40 border border-white/10 rounded-full px-3 py-1">
          € Euro
        </span>
      </div>

      {loading ? (
        <p className="text-sm text-cacau/40">Carregando…</p>
      ) : !data || data.byDate.length === 0 ? (
        <div className="text-center py-20 text-cacau/40">
          <p className="font-newsreader italic text-lg">Sem dados para o período selecionado.</p>
          <p className="text-sm mt-1">Tente expandir o período.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6 sm:gap-8">
          {/* Total KPI */}
          <div className="hero-dark text-cacau rounded-2xl p-6 sm:p-8 shadow-apple">
            <p className="kicker mb-3">Faturamento no período</p>
            <p className="font-bodoni font-bold text-4xl sm:text-5xl tracking-tight"><span className="grad-text">{formatCurrency(data.total, currency)}</span></p>
            <p className="text-sm text-cacau/40 mt-2.5">
              {dates.from === dates.to
                ? formatDate(dates.from)
                : `${formatDate(dates.from)} – ${formatDate(dates.to)}`} · {data.byDate.length} dia{data.byDate.length !== 1 ? "s" : ""} com receita
            </p>
          </div>

          {/* Revenue by date */}
          <section>
            <h2 className="font-bodoni font-semibold text-xl text-cacau mb-4">Faturamento por período</h2>
            <div className="cp-card p-4 sm:p-6">
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={data.byDate}>
                  <defs>
                    <linearGradient id="champGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C9A368" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#E0A89E" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(221,190,137,0.14)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#B6A48C" }}
                    tickFormatter={(v) => format(new Date(v + "T12:00:00"), "dd/MM", { locale: ptBR })} />
                  <YAxis tick={{ fontSize: 10, fill: "#B6A48C" }} width={60}
                    tickFormatter={(v) => `€${(v / 100).toLocaleString("pt-PT", { maximumFractionDigits: 0 })}`} />
                  <Tooltip
                    formatter={(v: number) => [formatCurrency(v, currency), "Faturamento"]}
                    labelFormatter={(l) => formatDate(l)}
                    contentStyle={TOOLTIP_STYLE}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#C9A368" strokeWidth={2} fill="url(#champGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* By patient */}
          <section>
            <h2 className="font-bodoni font-semibold text-xl text-cacau mb-4">Faturamento por paciente</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="cp-card p-4 sm:p-6">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={data.byPatient.slice(0, 8)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(221,190,137,0.14)" />
                    <XAxis type="number" tick={{ fontSize: 10, fill: "#B6A48C" }}
                      tickFormatter={(v) => `€${(v / 100).toLocaleString("pt-PT", { maximumFractionDigits: 0 })}`} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#F4ECDF" }} width={90} />
                    <Tooltip
                      formatter={(v: number) => [formatCurrency(v, currency), "Total"]}
                      contentStyle={TOOLTIP_STYLE}
                    />
                    <Bar dataKey="total" fill="#C9A368" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="cp-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[280px]">
                    <thead className="bg-areia/[0.06] border-b border-white/[0.06]">
                      <tr>
                        <th className="text-left px-4 py-3 text-[11px] uppercase tracking-wider text-cacau/40 font-medium">Paciente</th>
                        <th className="text-right px-4 py-3 text-[11px] uppercase tracking-wider text-cacau/40 font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.05]">
                      {data.byPatient.map((p) => (
                        <tr key={p.id} className="hover:bg-areia/[0.06] transition-colors">
                          <td className="px-4 py-3">
                            <Link href={`/pacientes/${p.id}`} className="hover:text-champanhe transition-colors">{p.name}</Link>
                          </td>
                          <td className="px-4 py-3 text-right font-medium">{formatCurrency(p.total, currency)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          {/* By procedure */}
          <section>
            <h2 className="font-bodoni font-semibold text-xl text-cacau mb-4">Faturamento por procedimento</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="cp-card p-4 sm:p-6">
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={data.byProcedure} dataKey="total" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={45}>
                      {data.byProcedure.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v: number) => [formatCurrency(v, currency), "Total"]}
                      contentStyle={TOOLTIP_STYLE}
                    />
                    <Legend wrapperStyle={{ fontSize: 11, color: "#B6A48C" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="cp-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[280px]">
                    <thead className="bg-areia/[0.06] border-b border-white/[0.06]">
                      <tr>
                        <th className="text-left px-4 py-3 text-[11px] uppercase tracking-wider text-cacau/40 font-medium">Procedimento</th>
                        <th className="text-right px-4 py-3 text-[11px] uppercase tracking-wider text-cacau/40 font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.05]">
                      {data.byProcedure.map((p, i) => (
                        <tr key={p.id} className="hover:bg-areia/[0.06] transition-colors">
                          <td className="px-4 py-3 flex items-center gap-2.5">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                            {p.name}
                          </td>
                          <td className="px-4 py-3 text-right font-medium">{formatCurrency(p.total, currency)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
