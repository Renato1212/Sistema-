"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Edit2, Trash2, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { StatusBadge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/format";
import { addDays } from "date-fns";

interface ProcedureType { id: string; name: string }
interface Location { id: string; name: string }
interface Patient { id: string; fullName: string; email: string | null; phone: string | null }
interface Appointment {
  id: string;
  nameSnapshot: string;
  date: string;
  time: string;
  status: string;
  notes: string | null;
  procedureText: string | null;
  locationText: string | null;
  patient: { id: string; fullName: string } | null;
  procedureType: { name: string } | null;
  location: { name: string } | null;
}

const STATUS_OPTIONS = ["AGENDADO", "CONFIRMADO", "REALIZADO", "CANCELADO"];
const STATUS_LABELS: Record<string, string> = {
  AGENDADO: "Agendado", CONFIRMADO: "Confirmado", REALIZADO: "Realizado", CANCELADO: "Cancelado",
};

interface Props {
  procedureTypes: ProcedureType[];
  locations: Location[];
}

const today = new Date().toISOString().slice(0, 10);
const nextWeek = addDays(new Date(), 14).toISOString().slice(0, 10);

export function AgendaClient({ procedureTypes, locations }: Props) {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ from: today, to: nextWeek, locationId: "", status: "" });
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Appointment | null>(null);
  const [patientSearch, setPatientSearch] = useState("");
  const [patientResults, setPatientResults] = useState<Patient[]>([]);
  const [form, setForm] = useState({
    patientId: "", nameSnapshot: "", procedureTypeId: "", procedureText: "",
    date: today, time: "10:00", locationText: "", notes: "", status: "AGENDADO",
  });

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.from) params.set("from", filters.from);
    if (filters.to) params.set("to", filters.to);
    if (filters.locationId) params.set("locationId", filters.locationId);
    if (filters.status) params.set("status", filters.status);
    const res = await fetch(`/api/appointments?${params}`);
    const data = await res.json();
    setAppointments(data);
    setLoading(false);
  }, [filters]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  useEffect(() => {
    if (patientSearch.length < 2) { setPatientResults([]); return; }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/patients?q=${encodeURIComponent(patientSearch)}`);
      setPatientResults(await res.json());
    }, 300);
    return () => clearTimeout(t);
  }, [patientSearch]);

  function openNew() {
    setEditTarget(null);
    setForm({ patientId: "", nameSnapshot: "", procedureTypeId: "", procedureText: "", date: today, time: "10:00", locationText: "", notes: "", status: "AGENDADO" });
    setPatientSearch("");
    setPatientResults([]);
    setShowModal(true);
  }

  function openEdit(a: Appointment) {
    setEditTarget(a);
    setForm({
      patientId: a.patient?.id ?? "",
      nameSnapshot: a.nameSnapshot,
      procedureTypeId: a.procedureType ? procedureTypes.find(p => p.name === a.procedureType?.name)?.id ?? "" : "",
      procedureText: a.procedureText ?? "",
      date: a.date.slice(0, 10),
      time: a.time,
      locationText: a.locationText ?? a.location?.name ?? "",
      notes: a.notes ?? "",
      status: a.status,
    });
    setShowModal(true);
  }

  async function handleSave() {
    const body = {
      patientId: form.patientId || undefined,
      nameSnapshot: form.nameSnapshot,
      procedureTypeId: form.procedureTypeId || undefined,
      procedureText: form.procedureText || undefined,
      date: form.date,
      time: form.time,
      locationText: form.locationText || undefined,
      notes: form.notes || undefined,
      status: form.status,
    };
    const url = editTarget ? `/api/appointments/${editTarget.id}` : "/api/appointments";
    const method = editTarget ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!res.ok) { toast("Erro ao salvar agendamento.", "error"); return; }
    toast(editTarget ? "Agendamento atualizado!" : "Agendamento criado!", "success");
    setShowModal(false);
    fetchAppointments();
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este agendamento?")) return;
    await fetch(`/api/appointments/${id}`, { method: "DELETE" });
    toast("Agendamento removido.", "info");
    fetchAppointments();
  }

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-bodoni text-display-md text-cacau">Agenda</h1>
          <p className="text-sm text-cacau/40 mt-1">{appointments.length} agendamento{appointments.length !== 1 ? "s" : ""} no período</p>
        </div>
        <Button onClick={openNew}>
          <Plus size={16} />
          Novo Agendamento
        </Button>
      </div>

      {/* Filters */}
      <div className="cp-card p-4 mb-6 flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1.5">
          <label className="cp-label">De</label>
          <input type="date" value={filters.from}
            onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))}
            className="cp-field px-3 py-2 w-auto" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="cp-label">Até</label>
          <input type="date" value={filters.to}
            onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))}
            className="cp-field px-3 py-2 w-auto" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="cp-label">Status</label>
          <select value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            className="cp-field px-3 py-2 w-auto">
            <option value="">Todos</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <p className="text-sm text-cacau/40">Carregando…</p>
      ) : appointments.length === 0 ? (
        <div className="text-center py-20 text-cacau/40">
          <CalendarDays size={40} className="mx-auto mb-3 opacity-25" />
          <p className="font-newsreader italic text-lg">Nenhum agendamento no período.</p>
        </div>
      ) : (
        <div className="cp-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-areia/10 border-b border-black/5">
              <tr>
                <th className="text-left px-5 py-3.5 text-[11px] uppercase tracking-wider text-cacau/40 font-medium">Nome</th>
                <th className="text-left px-5 py-3.5 text-[11px] uppercase tracking-wider text-cacau/40 font-medium">Procedimento</th>
                <th className="text-left px-5 py-3.5 text-[11px] uppercase tracking-wider text-cacau/40 font-medium">Data / Hora</th>
                <th className="text-left px-5 py-3.5 text-[11px] uppercase tracking-wider text-cacau/40 font-medium">Local</th>
                <th className="text-left px-5 py-3.5 text-[11px] uppercase tracking-wider text-cacau/40 font-medium">Status</th>
                <th className="px-5 py-3.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {appointments.map((a) => (
                <tr key={a.id} className="hover:bg-areia/8 transition-colors">
                  <td className="px-5 py-4">
                    {a.patient ? (
                      <Link href={`/pacientes/${a.patient.id}`} className="font-medium text-cacau hover:text-champanhe transition-colors">
                        {a.nameSnapshot}
                      </Link>
                    ) : (
                      <span className="text-cacau/70">{a.nameSnapshot}</span>
                    )}
                    {a.notes && <p className="text-xs text-cacau/35 mt-0.5">{a.notes}</p>}
                  </td>
                  <td className="px-5 py-4 text-cacau/60">
                    {a.procedureType?.name ?? a.procedureText ?? "—"}
                  </td>
                  <td className="px-5 py-4 text-cacau/60">
                    <span>{formatDate(a.date)}</span>
                    <span className="text-cacau/35 ml-1.5">{a.time}</span>
                  </td>
                  <td className="px-5 py-4 text-cacau/60">
                    {a.location?.name ?? a.locationText ?? "—"}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={a.status} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 justify-end">
                      <button onClick={() => openEdit(a)} className="p-1.5 text-cacau/30 hover:text-champanhe hover:bg-champanhe/8 rounded-lg transition-all" title="Editar">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(a.id)} className="p-1.5 text-cacau/30 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Excluir">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Appointment modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editTarget ? "Editar Agendamento" : "Novo Agendamento"} size="lg">
        <div className="flex flex-col gap-4">
          {/* Patient autocomplete */}
          <div>
            <label className="cp-label">Paciente (opcional)</label>
            <div className="relative">
              <input
                value={patientSearch || (form.nameSnapshot && form.patientId ? form.nameSnapshot : patientSearch)}
                onChange={(e) => { setPatientSearch(e.target.value); setForm((f) => ({ ...f, patientId: "", nameSnapshot: e.target.value })); }}
                placeholder="Buscar paciente ou digitar nome…"
                className="cp-field"
              />
              {patientResults.length > 0 && (
                <div className="absolute top-full inset-x-0 z-20 bg-white border border-black/8 rounded-xl shadow-apple mt-1 max-h-40 overflow-y-auto">
                  {patientResults.map((p) => (
                    <button key={p.id} type="button" className="w-full text-left px-4 py-2.5 text-sm hover:bg-areia/20 first:rounded-t-xl last:rounded-b-xl transition-colors"
                      onClick={() => {
                        setForm((f) => ({ ...f, patientId: p.id, nameSnapshot: p.fullName }));
                        setPatientSearch(p.fullName);
                        setPatientResults([]);
                      }}>
                      <span className="font-medium">{p.fullName}</span>
                      {p.email && <span className="text-cacau/40 text-xs ml-2">{p.email}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="cp-label">Data</label>
              <input type="date" value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="cp-field" />
            </div>
            <div>
              <label className="cp-label">Horário</label>
              <input type="time" value={form.time}
                onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                className="cp-field" />
            </div>
          </div>

          <div>
            <label className="cp-label">Procedimento</label>
            <select value={form.procedureTypeId}
              onChange={(e) => setForm((f) => ({ ...f, procedureTypeId: e.target.value }))}
              className="cp-field">
              <option value="">— Selecionar do catálogo —</option>
              {procedureTypes.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            {!form.procedureTypeId && (
              <input value={form.procedureText}
                onChange={(e) => setForm((f) => ({ ...f, procedureText: e.target.value }))}
                placeholder="Ou descreva o procedimento…"
                className="cp-field mt-2" />
            )}
          </div>

          <div>
            <label className="cp-label">Local</label>
            <input
              value={form.locationText}
              onChange={(e) => setForm((f) => ({ ...f, locationText: e.target.value }))}
              placeholder="Ex: Clínica Lisboa, Sala 3…"
              className="cp-field"
            />
          </div>

          <div>
            <label className="cp-label">Status</label>
            <select value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              className="cp-field">
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
          </div>

          <div>
            <label className="cp-label">Comentários</label>
            <textarea value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className="cp-field" rows={2} />
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
