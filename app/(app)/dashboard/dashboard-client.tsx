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

const CHART_COLORS = ["#B5915E", "#9F6A53", "#BE8C76", "#DACAB4", "#241C18", "#F4EDE2"];

const fmt = (d: Date) => d.toISOString().slice(0, 10);

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
      <h1 className="font-bodoni text-display-md text-cacau mb-6 sm:mb-8">Dashboard</h1>

      {/* Controls */}
      <div className="cp-card p-3 sm:p-4 mb-6 sm:mb-8 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-1 bg-marfim rounded-xl p-1 flex-wrap">
          {presets.map((p) => (
            <button
              key={p.key}
              onClick={() => selectPreset(p.key)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-all duration-200 touch-manipulation ${
                preset === p.key
                  ? "bg-champanhe text-white shadow-sm"
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

        <span className="ml-auto text-xs text-cacau/40 border border-black/[0.08] rounded-full px-3 py-1">
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
          <div className="hero-dark text-white rounded-2xl p-6 sm:p-8 shadow-apple">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/40 mb-3">Faturamento no período</p>
            <p className="font-bodoni text-4xl sm:text-5xl">{formatCurrency(data.total, currency)}</p>
            <p className="text-sm text-white/40 mt-2.5">
              {dates.from === dates.to
                ? formatDate(dates.from)
                : `${formatDate(dates.from)} – ${formatDate(dates.to)}`} · {data.byDate.length} dia{data.byDate.length !== 1 ? "s" : ""} com receita
            </p>
          </div>

          {/* Revenue by date */}
          <section>
            <h2 className="font-bodoni text-xl text-cacau mb-4">Faturamento por período</h2>
            <div className="cp-card p-4 sm:p-6">
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={data.byDate}>
                  <defs>
                    <linearGradient id="champGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#B5915E" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#B5915E" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#DACAB4" strokeOpacity={0.4} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9F6A53" }}
                    tickFormatter={(v) => format(new Date(v + "T12:00:00"), "dd/MM", { locale: ptBR })} />
                  <YAxis tick={{ fontSize: 10, fill: "#9F6A53" }} width={60}
                    tickFormatter={(v) => `€${(v / 100).toLocaleString("pt-PT", { maximumFractionDigits: 0 })}`} />
                  <Tooltip
                    formatter={(v: number) => [formatCurrency(v, currency), "Faturamento"]}
                    labelFormatter={(l) => formatDate(l)}
                    contentStyle={{ border: "1px solid rgba(0,0,0,0.06)", borderRadius: 12, fontSize: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#B5915E" strokeWidth={2} fill="url(#champGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* By patient */}
          <section>
            <h2 className="font-bodoni text-xl text-cacau mb-4">Faturamento por paciente</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="cp-card p-4 sm:p-6">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={data.byPatient.slice(0, 8)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#DACAB4" strokeOpacity={0.4} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: "#9F6A53" }}
                      tickFormatter={(v) => `€${(v / 100).toLocaleString("pt-PT", { maximumFractionDigits: 0 })}`} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#241C18" }} width={90} />
                    <Tooltip
                      formatter={(v: number) => [formatCurrency(v, currency), "Total"]}
                      contentStyle={{ border: "1px solid rgba(0,0,0,0.06)", borderRadius: 12, fontSize: 12 }}
                    />
                    <Bar dataKey="total" fill="#B5915E" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="cp-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[280px]">
                    <thead className="bg-areia/10 border-b border-black/5">
                      <tr>
                        <th className="text-left px-4 py-3 text-[11px] uppercase tracking-wider text-cacau/40 font-medium">Paciente</th>
                        <th className="text-right px-4 py-3 text-[11px] uppercase tracking-wider text-cacau/40 font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/[0.04]">
                      {data.byPatient.map((p) => (
                        <tr key={p.id} className="hover:bg-areia/10 transition-colors">
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
            <h2 className="font-bodoni text-xl text-cacau mb-4">Faturamento por procedimento</h2>
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
                      contentStyle={{ border: "1px solid rgba(0,0,0,0.06)", borderRadius: 12, fontSize: 12 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="cp-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[280px]">
                    <thead className="bg-areia/10 border-b border-black/5">
                      <tr>
                        <th className="text-left px-4 py-3 text-[11px] uppercase tracking-wider text-cacau/40 font-medium">Procedimento</th>
                        <th className="text-right px-4 py-3 text-[11px] uppercase tracking-wider text-cacau/40 font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/[0.04]">
                      {data.byProcedure.map((p, i) => (
                        <tr key={p.id} className="hover:bg-areia/10 transition-colors">
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
