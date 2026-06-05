"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Edit2, Trash2, CalendarDays, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { StatusBadge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/format";
import { subDays, addDays } from "date-fns";

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
    date: today, time: "10:00", locationId: "", locationText: "", notes: "", status: "AGENDADO",
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
    setForm({ patientId: "", nameSnapshot: "", procedureTypeId: "", procedureText: "", date: today, time: "10:00", locationId: "", locationText: "", notes: "", status: "AGENDADO" });
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
      locationId: a.location ? locations.find(l => l.name === a.location?.name)?.id ?? "" : "",
      locationText: a.locationText ?? "",
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
      locationId: form.locationId || undefined,
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
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-bodoni text-display-md text-cacau">Agenda</h1>
          <p className="text-sm text-cacau/50 mt-1">{appointments.length} agendamento{appointments.length !== 1 ? "s" : ""} no período</p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus size={16} />
          Novo Agendamento
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-areia rounded-sm p-4 mb-6 flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-wide text-cacau/50">De</label>
          <input type="date" value={filters.from} onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))}
            className="px-3 py-2 text-sm border border-areia rounded-sm focus:outline-none focus:border-champanhe" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-wide text-cacau/50">Até</label>
          <input type="date" value={filters.to} onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))}
            className="px-3 py-2 text-sm border border-areia rounded-sm focus:outline-none focus:border-champanhe" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-wide text-cacau/50">Local</label>
          <select value={filters.locationId} onChange={(e) => setFilters((f) => ({ ...f, locationId: e.target.value }))}
            className="px-3 py-2 text-sm border border-areia rounded-sm focus:outline-none focus:border-champanhe">
            <option value="">Todos</option>
            {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-wide text-cacau/50">Status</label>
          <select value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            className="px-3 py-2 text-sm border border-areia rounded-sm focus:outline-none focus:border-champanhe">
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
          <CalendarDays size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-newsreader italic">Nenhum agendamento no período.</p>
        </div>
      ) : (
        <div className="bg-white border border-areia rounded-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-areia/20 border-b border-areia">
              <tr>
                <th className="text-left px-5 py-3 text-xs uppercase tracking-wide text-cacau/50">Nome</th>
                <th className="text-left px-5 py-3 text-xs uppercase tracking-wide text-cacau/50">Procedimento</th>
                <th className="text-left px-5 py-3 text-xs uppercase tracking-wide text-cacau/50">Data/Hora</th>
                <th className="text-left px-5 py-3 text-xs uppercase tracking-wide text-cacau/50">Local</th>
                <th className="text-left px-5 py-3 text-xs uppercase tracking-wide text-cacau/50">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-areia/40">
              {appointments.map((a) => (
                <tr key={a.id} className="hover:bg-areia/10 transition-colors">
                  <td className="px-5 py-3.5">
                    {a.patient ? (
                      <Link href={`/pacientes/${a.patient.id}`} className="font-medium text-cacau hover:text-champanhe transition-colors">
                        {a.nameSnapshot}
                      </Link>
                    ) : (
                      <span className="text-cacau/70">{a.nameSnapshot}</span>
                    )}
                    {a.notes && <p className="text-xs text-cacau/40 mt-0.5">{a.notes}</p>}
                  </td>
                  <td className="px-5 py-3.5 text-cacau/70">
                    {a.procedureType?.name ?? a.procedureText ?? "—"}
                  </td>
                  <td className="px-5 py-3.5 text-cacau/70">
                    <span>{formatDate(a.date)}</span>
                    <span className="text-cacau/40 ml-1.5">{a.time}</span>
                  </td>
                  <td className="px-5 py-3.5 text-cacau/70">
                    {a.location?.name ?? a.locationText ?? "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={a.status} />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(a)} className="text-cacau/40 hover:text-champanhe transition-colors" title="Editar">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(a.id)} className="text-cacau/40 hover:text-red-500 transition-colors" title="Excluir">
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
            <label className="text-xs font-medium text-cacau/70 uppercase tracking-wide block mb-1">Paciente (opcional)</label>
            <div className="relative">
              <input
                value={patientSearch || (form.nameSnapshot && form.patientId ? form.nameSnapshot : patientSearch)}
                onChange={(e) => { setPatientSearch(e.target.value); setForm((f) => ({ ...f, patientId: "", nameSnapshot: e.target.value })); }}
                placeholder="Buscar paciente ou digitar nome…"
                className="w-full px-3 py-2 text-sm bg-white border border-areia rounded-sm focus:outline-none focus:border-champanhe"
              />
              {patientResults.length > 0 && (
                <div className="absolute top-full inset-x-0 z-20 bg-white border border-areia rounded-sm shadow-lg mt-0.5 max-h-40 overflow-y-auto">
                  {patientResults.map((p) => (
                    <button key={p.id} type="button" className="w-full text-left px-3 py-2 text-sm hover:bg-areia/20"
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
              <label className="text-xs font-medium text-cacau/70 uppercase tracking-wide block mb-1">Data</label>
              <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-areia rounded-sm focus:outline-none focus:border-champanhe" />
            </div>
            <div>
              <label className="text-xs font-medium text-cacau/70 uppercase tracking-wide block mb-1">Horário</label>
              <input type="time" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-areia rounded-sm focus:outline-none focus:border-champanhe" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-cacau/70 uppercase tracking-wide block mb-1">Procedimento</label>
            <select value={form.procedureTypeId} onChange={(e) => setForm((f) => ({ ...f, procedureTypeId: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-areia rounded-sm focus:outline-none focus:border-champanhe">
              <option value="">— Selecionar do catálogo —</option>
              {procedureTypes.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            {!form.procedureTypeId && (
              <input value={form.procedureText} onChange={(e) => setForm((f) => ({ ...f, procedureText: e.target.value }))}
                placeholder="Ou descreva o procedimento…"
                className="w-full mt-2 px-3 py-2 text-sm border border-areia rounded-sm focus:outline-none focus:border-champanhe" />
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-cacau/70 uppercase tracking-wide block mb-1">Local</label>
            <select value={form.locationId} onChange={(e) => setForm((f) => ({ ...f, locationId: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-areia rounded-sm focus:outline-none focus:border-champanhe">
              <option value="">— Selecionar —</option>
              {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
            {!form.locationId && (
              <input value={form.locationText} onChange={(e) => setForm((f) => ({ ...f, locationText: e.target.value }))}
                placeholder="Ou descreva o local…"
                className="w-full mt-2 px-3 py-2 text-sm border border-areia rounded-sm focus:outline-none focus:border-champanhe" />
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-cacau/70 uppercase tracking-wide block mb-1">Status</label>
            <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-areia rounded-sm focus:outline-none focus:border-champanhe">
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-cacau/70 uppercase tracking-wide block mb-1">Comentários</label>
            <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-areia rounded-sm focus:outline-none focus:border-champanhe" rows={2} />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
