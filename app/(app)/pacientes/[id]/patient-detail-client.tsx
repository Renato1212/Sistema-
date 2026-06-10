"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft, Edit2, Archive, RotateCcw, Download, Plus, Trash2,
  Image, FileText, Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { PatientForm } from "../patient-form";
import { formatDate, formatCurrency, calculateAge } from "@/lib/format";
import { pt } from "@/lib/i18n/pt";
import { format } from "date-fns";

interface ProcedureType {
  id: string;
  name: string;
  defaultPriceCents: number | null;
  defaultCurrency: string;
}

interface Procedure {
  id: string;
  procedureTypeId: string | null;
  customName: string | null;
  amountCents: number;
  currency: string;
  date: Date;
  notes: string | null;
  procedureType: { name: string } | null;
}

interface Attachment {
  id: string;
  type: string;
  fileName: string;
  storageKey: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: Date;
}

interface Patient {
  id: string;
  fullName: string;
  birthDate: Date | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
  marketingConsent: boolean;
  marketingConsentDate: Date | null;
  deletedAt: Date | null;
  procedures: Procedure[];
  attachments: Attachment[];
}

interface Props {
  patient: Patient;
  procedureTypes: ProcedureType[];
}

const ATTACHMENT_TYPES = [
  { value: "FICHA_ANAMNESE", label: "Ficha de Anamnese" },
  { value: "CONSENTIMENTO_MARKETING", label: "Consentimento de Marketing" },
  { value: "FOTO_ANTES", label: "Foto Antes" },
  { value: "FOTO_DEPOIS", label: "Foto Depois" },
  { value: "OUTRO", label: "Outro" },
];

export function PatientDetailClient({ patient: initialPatient, procedureTypes }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [patient, setPatient] = useState(initialPatient);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddProcedure, setShowAddProcedure] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  const [procForm, setProcForm] = useState({
    procedureTypeId: "",
    customName: "",
    amountCents: "",
    currency: "EUR",
    date: format(new Date(), "yyyy-MM-dd"),
    notes: "",
  });
  const [uploadForm, setUploadForm] = useState({ type: "FOTO_ANTES", file: null as File | null });

  async function refreshPatient() {
    try {
      const [patRes, prRes, attRes] = await Promise.all([
        fetch(`/api/patients/${patient.id}`),
        fetch(`/api/patients/${patient.id}/procedures`),
        fetch(`/api/patients/${patient.id}/attachments`),
      ]);
      if (!patRes.ok || !prRes.ok || !attRes.ok) { toast("Erro ao atualizar dados.", "error"); return; }
      const [updated, procedures, attachments] = await Promise.all([patRes.json(), prRes.json(), attRes.json()]);
      setPatient({ ...updated, procedures, attachments });
    } catch {
      toast("Erro ao atualizar dados.", "error");
    }
  }

  async function handleArchive() {
    if (!confirm(`Arquivar ${patient.fullName}?`)) return;
    const res = await fetch(`/api/patients/${patient.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deletedAt: new Date().toISOString() }),
    });
    if (!res.ok) { toast("Erro ao arquivar paciente.", "error"); return; }
    toast("Paciente arquivado.", "info");
    router.push("/pacientes");
  }

  async function handleRestore() {
    const res = await fetch(`/api/patients/${patient.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deletedAt: null }),
    });
    if (!res.ok) { toast("Erro ao restaurar paciente.", "error"); return; }
    toast("Paciente restaurado.", "success");
    await refreshPatient();
  }

  async function handleAddProcedure() {
    const amount = parseFloat(procForm.amountCents.replace(",", "."));
    if (!amount || amount <= 0) { toast("Informe o valor.", "error"); return; }
    const res = await fetch(`/api/patients/${patient.id}/procedures`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        procedureTypeId: procForm.procedureTypeId || undefined,
        customName: procForm.customName || undefined,
        amountCents: Math.round(amount * 100),
        currency: "EUR",
        date: procForm.date,
        notes: procForm.notes || undefined,
      }),
    });
    if (!res.ok) { toast("Erro ao adicionar procedimento.", "error"); return; }
    toast("Procedimento adicionado!", "success");
    setShowAddProcedure(false);
    await refreshPatient();
  }

  async function handleDeleteProcedure(procedureId: string) {
    if (!confirm("Remover este procedimento?")) return;
    const res = await fetch(`/api/patients/${patient.id}/procedures?procedureId=${procedureId}`, { method: "DELETE" });
    if (!res.ok) { toast("Erro ao remover procedimento.", "error"); return; }
    toast("Procedimento removido.", "info");
    await refreshPatient();
  }

  async function handleUpload() {
    if (!uploadForm.file) { toast("Selecione um arquivo.", "error"); return; }
    const fd = new FormData();
    fd.append("file", uploadForm.file);
    fd.append("type", uploadForm.type);
    const res = await fetch(`/api/patients/${patient.id}/attachments`, { method: "POST", body: fd });
    if (!res.ok) {
      const d = await res.json();
      toast(d.error ?? "Erro ao enviar arquivo.", "error");
      return;
    }
    toast("Arquivo enviado!", "success");
    setShowUpload(false);
    await refreshPatient();
  }

  async function handleDeleteAttachment(attachmentId: string) {
    if (!confirm("Remover este arquivo?")) return;
    const res = await fetch(`/api/patients/${patient.id}/attachments?attachmentId=${attachmentId}`, { method: "DELETE" });
    if (!res.ok) { toast("Erro ao remover arquivo.", "error"); return; }
    toast("Arquivo removido.", "info");
    await refreshPatient();
  }

  const totalEur = patient.procedures
    .filter((p) => p.currency === "EUR")
    .reduce((s, p) => s + p.amountCents, 0);

  const photos = patient.attachments.filter((a) => a.type === "FOTO_ANTES" || a.type === "FOTO_DEPOIS");
  const docs = patient.attachments.filter((a) => a.type !== "FOTO_ANTES" && a.type !== "FOTO_DEPOIS");

  return (
    <div className="p-4 sm:p-8 max-w-5xl">
      {/* Back + actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 sm:mb-7">
        <Link href="/pacientes" className="flex items-center gap-1.5 text-sm text-cacau/40 hover:text-cacau transition-colors w-fit">
          <ChevronLeft size={16} />
          Pacientes
        </Link>
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href={`/api/patients/${patient.id}/export`}
            className="flex items-center gap-1.5 text-xs text-cacau/40 hover:text-cacau border border-white/10 rounded-full px-3.5 py-1.5 transition-all hover:border-areia/40 hover:bg-white/[0.04] touch-manipulation"
          >
            <Download size={12} />
            Exportar
          </a>
          <Button variant="secondary" size="sm" onClick={() => setShowEditModal(true)}>
            <Edit2 size={13} />
            Editar
          </Button>
          {patient.deletedAt ? (
            <Button variant="secondary" size="sm" onClick={handleRestore}>
              <RotateCcw size={13} />
              Restaurar
            </Button>
          ) : (
            <Button variant="danger" size="sm" onClick={handleArchive}>
              <Archive size={13} />
              Arquivar
            </Button>
          )}
        </div>
      </div>

      {/* Header card */}
      <div className="hero-dark text-cacau rounded-2xl p-5 sm:p-8 mb-6 sm:mb-8 shadow-apple">
        <h1 className="font-bodoni text-2xl sm:text-display-md font-bold">{patient.fullName}</h1>
        {patient.deletedAt && (
          <span className="text-xs text-rose/80 mt-1 block">Arquivado em {formatDate(patient.deletedAt)}</span>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 mt-5 sm:mt-7 text-sm">
          {patient.birthDate && (
            <div>
              <p className="text-areia/70 text-[10px] uppercase tracking-[0.15em] mb-1 font-bodoni font-medium">Nascimento</p>
              <p>{formatDate(patient.birthDate)}</p>
              <p className="text-cacau/45 text-xs mt-0.5">{calculateAge(patient.birthDate)} anos</p>
            </div>
          )}
          {patient.email && (
            <div className="col-span-2 sm:col-span-1">
              <p className="text-areia/70 text-[10px] uppercase tracking-[0.15em] mb-1 font-bodoni font-medium">E-mail</p>
              <p className="break-all text-sm">{patient.email}</p>
            </div>
          )}
          {patient.phone && (
            <div>
              <p className="text-areia/70 text-[10px] uppercase tracking-[0.15em] mb-1 font-bodoni font-medium">Telefone</p>
              <p>{patient.phone}</p>
            </div>
          )}
          <div>
            <p className="text-areia/70 text-[10px] uppercase tracking-[0.15em] mb-1 font-bodoni font-medium">Marketing</p>
            <p>{patient.marketingConsent ? "✓ Consentiu" : "Não consentiu"}</p>
            {patient.marketingConsentDate && (
              <p className="text-cacau/40 text-xs mt-0.5">{formatDate(patient.marketingConsentDate)}</p>
            )}
          </div>
        </div>
      </div>

      {/* Notes */}
      {patient.notes && (
        <div className="cp-card bg-areia/10 p-4 sm:p-5 mb-6 sm:mb-8">
          <p className="cp-label mb-2">Comentários</p>
          <p className="text-sm text-cacau whitespace-pre-wrap">{patient.notes}</p>
        </div>
      )}

      {/* Procedures */}
      <section className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bodoni font-semibold text-xl text-cacau">Procedimentos</h2>
          <Button size="sm" onClick={() => setShowAddProcedure(true)}>
            <Plus size={14} />
            Adicionar
          </Button>
        </div>
        {patient.procedures.length === 0 ? (
          <p className="text-sm text-cacau/35 italic">Nenhum procedimento registrado.</p>
        ) : (
          <>
            <div className="cp-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[380px]">
                  <thead className="bg-areia/[0.06] border-b border-white/[0.06]">
                    <tr>
                      <th className="text-left px-4 sm:px-5 py-3.5 text-[11px] uppercase tracking-wider text-cacau/40 font-medium">Procedimento</th>
                      <th className="text-left px-4 sm:px-5 py-3.5 text-[11px] uppercase tracking-wider text-cacau/40 font-medium">Data</th>
                      <th className="text-right px-4 sm:px-5 py-3.5 text-[11px] uppercase tracking-wider text-cacau/40 font-medium">Valor</th>
                      <th className="px-4 sm:px-5 py-3.5 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.05]">
                    {patient.procedures.map((proc) => (
                      <tr key={proc.id} className="hover:bg-areia/[0.06] transition-colors">
                        <td className="px-4 sm:px-5 py-3.5">
                          {proc.procedureType?.name ?? proc.customName ?? "—"}
                          {proc.notes && <p className="text-xs text-cacau/35 mt-0.5">{proc.notes}</p>}
                        </td>
                        <td className="px-4 sm:px-5 py-3.5 text-cacau/50 whitespace-nowrap">{formatDate(proc.date)}</td>
                        <td className="px-4 sm:px-5 py-3.5 text-right font-medium whitespace-nowrap">
                          {formatCurrency(proc.amountCents)}
                        </td>
                        <td className="px-4 sm:px-5 py-3.5 text-right">
                          <button
                            onClick={() => handleDeleteProcedure(proc.id)}
                            className="p-2 text-cacau/25 hover:text-rose hover:bg-rose/10 rounded-lg transition-all touch-manipulation"
                            title="Remover"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {totalEur > 0 && (
              <div className="flex justify-end mt-3">
                <div className="text-right">
                  <span className="text-[11px] uppercase tracking-wider text-cacau/35 mr-2">Total</span>
                  <span className="font-medium text-sm">{formatCurrency(totalEur)}</span>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* Photos */}
      <section className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bodoni font-semibold text-xl text-cacau">Fotos</h2>
          <Button size="sm" variant="secondary" onClick={() => setShowUpload(true)}>
            <Upload size={14} />
            Enviar
          </Button>
        </div>
        <p className="text-xs text-cacau/35 mb-4 flex items-center gap-1.5">
          <Image size={11} />
          As fotos clínicas requerem consentimento documentado do paciente.
        </p>
        {photos.length === 0 ? (
          <p className="text-sm text-cacau/35 italic">Nenhuma foto enviada.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {photos.map((att) => (
              <div key={att.id} className="relative group border border-white/[0.07] rounded-xl overflow-hidden aspect-square bg-surface-2 shadow-card">
                {att.mimeType.startsWith("image/") ? (
                  <img
                    src={`/api/files/${att.storageKey}`}
                    alt={att.fileName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <FileText size={32} className="text-cacau/25" />
                  </div>
                )}
                <div className="absolute bottom-0 inset-x-0 bg-black/70 text-cacau text-xs p-2 flex items-center justify-between opacity-0 group-hover:opacity-100 active:opacity-100 transition-opacity rounded-b-xl">
                  <span className="truncate">{pt.attachment.type[att.type as keyof typeof pt.attachment.type] ?? att.type}</span>
                  <button onClick={() => handleDeleteAttachment(att.id)} className="shrink-0 ml-1 p-1 touch-manipulation">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Documents */}
      <section className="mb-6 sm:mb-8">
        <h2 className="font-bodoni font-semibold text-xl text-cacau mb-4">Documentos</h2>
        {docs.length === 0 ? (
          <p className="text-sm text-cacau/35 italic">Nenhum documento enviado.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {docs.map((att) => (
              <div key={att.id} className="flex items-center justify-between cp-card px-4 sm:px-5 py-3.5 gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <FileText size={16} className="text-champanhe shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{att.fileName}</p>
                    <p className="text-xs text-cacau/40 mt-0.5">
                      {pt.attachment.type[att.type as keyof typeof pt.attachment.type] ?? att.type} · {formatDate(att.uploadedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href={`/api/files/${att.storageKey}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-champanhe hover:underline px-2 py-1 touch-manipulation"
                  >
                    Baixar
                  </a>
                  <button onClick={() => handleDeleteAttachment(att.id)} className="p-2 text-cacau/25 hover:text-rose hover:bg-rose/10 rounded-lg transition-all touch-manipulation">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-4">
          <Button size="sm" variant="secondary" onClick={() => setShowUpload(true)}>
            <Upload size={14} />
            Enviar documento
          </Button>
        </div>
      </section>

      {/* Edit modal */}
      <Modal open={showEditModal} onClose={() => setShowEditModal(false)} title="Editar Paciente" size="lg">
        <PatientForm
          patientId={patient.id}
          defaultValues={{
            fullName: patient.fullName,
            birthDate: patient.birthDate ? new Date(patient.birthDate).toISOString().slice(0, 10) : undefined,
            email: patient.email ?? undefined,
            phone: patient.phone ?? undefined,
            notes: patient.notes ?? undefined,
            marketingConsent: patient.marketingConsent,
            marketingConsentDate: patient.marketingConsentDate
              ? new Date(patient.marketingConsentDate).toISOString().slice(0, 10)
              : undefined,
          }}
          onSuccess={async () => {
            setShowEditModal(false);
            toast("Paciente atualizado!", "success");
            await refreshPatient();
          }}
          onCancel={() => setShowEditModal(false)}
        />
      </Modal>

      {/* Add procedure modal */}
      <Modal open={showAddProcedure} onClose={() => setShowAddProcedure(false)} title="Adicionar Procedimento">
        <div className="flex flex-col gap-4">
          <div>
            <label className="cp-label">Procedimento do catálogo</label>
            <select
              value={procForm.procedureTypeId}
              onChange={(e) => {
                const pt_found = procedureTypes.find((p) => p.id === e.target.value);
                setProcForm((f) => ({
                  ...f,
                  procedureTypeId: e.target.value,
                  amountCents: pt_found?.defaultPriceCents ? String(pt_found.defaultPriceCents / 100) : f.amountCents,
                }));
              }}
              className="cp-field"
            >
              <option value="">— Selecionar —</option>
              {procedureTypes.map((pt) => (
                <option key={pt.id} value={pt.id}>{pt.name}</option>
              ))}
            </select>
          </div>
          {!procForm.procedureTypeId && (
            <div>
              <label className="cp-label">Nome personalizado</label>
              <input
                value={procForm.customName}
                onChange={(e) => setProcForm((f) => ({ ...f, customName: e.target.value }))}
                className="cp-field"
                placeholder="Ex: Consulta de retorno"
              />
            </div>
          )}
          <div>
            <label className="cp-label">Valor (€)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={procForm.amountCents}
              onChange={(e) => setProcForm((f) => ({ ...f, amountCents: e.target.value }))}
              className="cp-field"
              placeholder="0,00"
              inputMode="decimal"
            />
          </div>
          <div>
            <label className="cp-label">Data</label>
            <input
              type="date"
              value={procForm.date}
              onChange={(e) => setProcForm((f) => ({ ...f, date: e.target.value }))}
              className="cp-field"
            />
          </div>
          <div>
            <label className="cp-label">Observações</label>
            <textarea
              value={procForm.notes}
              onChange={(e) => setProcForm((f) => ({ ...f, notes: e.target.value }))}
              className="cp-field"
              rows={2}
            />
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <Button variant="secondary" onClick={() => setShowAddProcedure(false)}>Cancelar</Button>
            <Button onClick={handleAddProcedure}>Adicionar</Button>
          </div>
        </div>
      </Modal>

      {/* Upload modal */}
      <Modal open={showUpload} onClose={() => setShowUpload(false)} title="Enviar Arquivo">
        <div className="flex flex-col gap-4">
          <div>
            <label className="cp-label">Tipo</label>
            <select
              value={uploadForm.type}
              onChange={(e) => setUploadForm((f) => ({ ...f, type: e.target.value }))}
              className="cp-field"
            >
              {ATTACHMENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="cp-label">Arquivo (JPEG, PNG, WebP, PDF · máx. 10 MB)</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={(e) => setUploadForm((f) => ({ ...f, file: e.target.files?.[0] ?? null }))}
              className="w-full text-sm text-cacau/60 file:mr-3 file:py-2 file:px-4 file:border file:border-areia/30 file:rounded-full file:text-xs file:bg-surface-2 file:text-cacau hover:file:bg-areia/10 transition-all"
            />
          </div>
          <p className="text-xs text-cacau/35">As fotos clínicas requerem consentimento documentado do paciente.</p>
          <div className="flex justify-end gap-3 pt-1">
            <Button variant="secondary" onClick={() => setShowUpload(false)}>Cancelar</Button>
            <Button onClick={handleUpload}>Enviar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
