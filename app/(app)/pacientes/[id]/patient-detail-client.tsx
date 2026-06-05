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

  // Procedure form state
  const [procForm, setProcForm] = useState({
    procedureTypeId: "",
    customName: "",
    amountCents: "",
    currency: "BRL",
    date: new Date().toISOString().slice(0, 10),
    notes: "",
  });
  const [uploadForm, setUploadForm] = useState({ type: "FOTO_ANTES", file: null as File | null });

  async function refreshPatient() {
    const res = await fetch(`/api/patients/${patient.id}`);
    const updated = await res.json();
    // also fetch procedures and attachments separately
    const [prRes, attRes] = await Promise.all([
      fetch(`/api/patients/${patient.id}/procedures`),
      fetch(`/api/patients/${patient.id}/attachments`),
    ]);
    const procedures = await prRes.json();
    const attachments = await attRes.json();
    setPatient({ ...updated, procedures, attachments });
  }

  async function handleArchive() {
    if (!confirm(`Arquivar ${patient.fullName}?`)) return;
    await fetch(`/api/patients/${patient.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deletedAt: new Date().toISOString() }),
    });
    toast("Paciente arquivado.", "info");
    router.push("/pacientes");
  }

  async function handleRestore() {
    await fetch(`/api/patients/${patient.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deletedAt: null }),
    });
    toast("Paciente restaurado.", "success");
    await refreshPatient();
  }

  async function handleAddProcedure() {
    const amount = parseFloat(procForm.amountCents);
    if (!amount || amount <= 0) { toast("Informe o valor.", "error"); return; }
    const res = await fetch(`/api/patients/${patient.id}/procedures`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        procedureTypeId: procForm.procedureTypeId || undefined,
        customName: procForm.customName || undefined,
        amountCents: Math.round(amount * 100),
        currency: procForm.currency,
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
    await fetch(`/api/patients/${patient.id}/procedures?procedureId=${procedureId}`, { method: "DELETE" });
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
    await fetch(`/api/patients/${patient.id}/attachments?attachmentId=${attachmentId}`, { method: "DELETE" });
    toast("Arquivo removido.", "info");
    await refreshPatient();
  }

  // Subtotals per currency
  const subtotals: Record<string, number> = {};
  for (const p of patient.procedures) {
    subtotals[p.currency] = (subtotals[p.currency] ?? 0) + p.amountCents;
  }

  const photos = patient.attachments.filter((a) => a.type === "FOTO_ANTES" || a.type === "FOTO_DEPOIS");
  const docs = patient.attachments.filter((a) => a.type !== "FOTO_ANTES" && a.type !== "FOTO_DEPOIS");

  return (
    <div className="p-8 max-w-5xl">
      {/* Back + actions */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/pacientes" className="flex items-center gap-1.5 text-sm text-cacau/50 hover:text-cacau transition-colors">
          <ChevronLeft size={16} />
          Pacientes
        </Link>
        <div className="flex items-center gap-2">
          <a
            href={`/api/patients/${patient.id}/export`}
            className="flex items-center gap-1.5 text-xs text-cacau/50 hover:text-cacau border border-areia rounded-sm px-3 py-2 transition-colors"
          >
            <Download size={13} />
            Exportar dados
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

      {/* Header */}
      <div className="isolinhas bg-cacau text-white rounded-sm p-8 mb-8">
        <h1 className="font-bodoni text-display-md text-white">{patient.fullName}</h1>
        {patient.deletedAt && (
          <span className="text-xs text-red-300 mt-1 block">Arquivado em {formatDate(patient.deletedAt)}</span>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6 text-sm">
          {patient.birthDate && (
            <div>
              <p className="text-white/40 text-xs uppercase tracking-wide mb-1">Nascimento</p>
              <p>{formatDate(patient.birthDate)}</p>
              <p className="text-white/60 text-xs">{calculateAge(patient.birthDate)} anos</p>
            </div>
          )}
          {patient.email && (
            <div>
              <p className="text-white/40 text-xs uppercase tracking-wide mb-1">E-mail</p>
              <p>{patient.email}</p>
            </div>
          )}
          {patient.phone && (
            <div>
              <p className="text-white/40 text-xs uppercase tracking-wide mb-1">Telefone</p>
              <p>{patient.phone}</p>
            </div>
          )}
          <div>
            <p className="text-white/40 text-xs uppercase tracking-wide mb-1">Marketing</p>
            <p>{patient.marketingConsent ? "✓ Consentiu" : "Não consentiu"}</p>
            {patient.marketingConsentDate && (
              <p className="text-white/60 text-xs">{formatDate(patient.marketingConsentDate)}</p>
            )}
          </div>
        </div>
      </div>

      {/* Notes */}
      {patient.notes && (
        <div className="bg-areia/20 border border-areia rounded-sm p-4 mb-8">
          <p className="text-xs uppercase tracking-wide text-cacau/50 mb-2">Comentários</p>
          <p className="text-sm text-cacau whitespace-pre-wrap">{patient.notes}</p>
        </div>
      )}

      {/* Procedures */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bodoni text-xl text-cacau">Procedimentos</h2>
          <Button size="sm" onClick={() => setShowAddProcedure(true)}>
            <Plus size={14} />
            Adicionar
          </Button>
        </div>
        {patient.procedures.length === 0 ? (
          <p className="text-sm text-cacau/40 italic">Nenhum procedimento registrado.</p>
        ) : (
          <>
            <div className="bg-white border border-areia rounded-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-areia/20 border-b border-areia">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-cacau/50">Procedimento</th>
                    <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-cacau/50">Data</th>
                    <th className="text-right px-4 py-3 text-xs uppercase tracking-wide text-cacau/50">Valor</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-areia/40">
                  {patient.procedures.map((proc) => (
                    <tr key={proc.id} className="hover:bg-areia/10">
                      <td className="px-4 py-3">
                        {proc.procedureType?.name ?? proc.customName ?? "—"}
                        {proc.notes && <p className="text-xs text-cacau/40">{proc.notes}</p>}
                      </td>
                      <td className="px-4 py-3 text-cacau/60">{formatDate(proc.date)}</td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatCurrency(proc.amountCents, proc.currency as "BRL" | "EUR")}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDeleteProcedure(proc.id)}
                          className="text-cacau/30 hover:text-red-500 transition-colors"
                          title="Remover"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex gap-6 mt-3 justify-end text-sm">
              {Object.entries(subtotals).map(([currency, total]) => (
                <div key={currency} className="text-right">
                  <span className="text-xs uppercase text-cacau/40 mr-2">Subtotal {currency}</span>
                  <span className="font-medium">{formatCurrency(total, currency as "BRL" | "EUR")}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Photos */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bodoni text-xl text-cacau">Fotos</h2>
          <Button size="sm" variant="secondary" onClick={() => setShowUpload(true)}>
            <Upload size={14} />
            Enviar
          </Button>
        </div>
        <p className="text-xs text-cacau/40 mb-3 flex items-center gap-1.5">
          <Image size={11} />
          As fotos clínicas requerem consentimento documentado do paciente.
        </p>
        {photos.length === 0 ? (
          <p className="text-sm text-cacau/40 italic">Nenhuma foto enviada.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {photos.map((att) => (
              <div key={att.id} className="relative group border border-areia rounded-sm overflow-hidden aspect-square bg-areia/20">
                {att.mimeType.startsWith("image/") ? (
                  <img
                    src={`/api/files/${att.storageKey}`}
                    alt={att.fileName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <FileText size={32} className="text-cacau/30" />
                  </div>
                )}
                <div className="absolute bottom-0 inset-x-0 bg-cacau/70 text-white text-xs p-1.5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="truncate">{pt.attachment.type[att.type as keyof typeof pt.attachment.type] ?? att.type}</span>
                  <button onClick={() => handleDeleteAttachment(att.id)} className="shrink-0 ml-1">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Documents */}
      <section className="mb-8">
        <h2 className="font-bodoni text-xl text-cacau mb-4">Documentos</h2>
        {docs.length === 0 ? (
          <p className="text-sm text-cacau/40 italic">Nenhum documento enviado.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {docs.map((att) => (
              <div key={att.id} className="flex items-center justify-between bg-white border border-areia rounded-sm px-4 py-3">
                <div className="flex items-center gap-3">
                  <FileText size={16} className="text-champanhe" />
                  <div>
                    <p className="text-sm font-medium">{att.fileName}</p>
                    <p className="text-xs text-cacau/40">
                      {pt.attachment.type[att.type as keyof typeof pt.attachment.type] ?? att.type} · {formatDate(att.uploadedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`/api/files/${att.storageKey}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-champanhe hover:underline"
                  >
                    Baixar
                  </a>
                  <button onClick={() => handleDeleteAttachment(att.id)} className="text-cacau/30 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-3">
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
            <label className="text-xs font-medium text-cacau/70 uppercase tracking-wide block mb-1">Procedimento do catálogo</label>
            <select
              value={procForm.procedureTypeId}
              onChange={(e) => {
                const pt_found = procedureTypes.find((p) => p.id === e.target.value);
                setProcForm((f) => ({
                  ...f,
                  procedureTypeId: e.target.value,
                  amountCents: pt_found?.defaultPriceCents ? String(pt_found.defaultPriceCents / 100) : f.amountCents,
                  currency: pt_found?.defaultCurrency ?? f.currency,
                }));
              }}
              className="w-full px-3 py-2 text-sm bg-white border border-areia rounded-sm focus:outline-none focus:border-champanhe"
            >
              <option value="">— Selecionar —</option>
              {procedureTypes.map((pt) => (
                <option key={pt.id} value={pt.id}>{pt.name}</option>
              ))}
            </select>
          </div>
          {!procForm.procedureTypeId && (
            <div>
              <label className="text-xs font-medium text-cacau/70 uppercase tracking-wide block mb-1">Nome personalizado</label>
              <input
                value={procForm.customName}
                onChange={(e) => setProcForm((f) => ({ ...f, customName: e.target.value }))}
                className="w-full px-3 py-2 text-sm bg-white border border-areia rounded-sm focus:outline-none focus:border-champanhe"
                placeholder="Ex: Consulta de retorno"
              />
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-cacau/70 uppercase tracking-wide block mb-1">Valor</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={procForm.amountCents}
                onChange={(e) => setProcForm((f) => ({ ...f, amountCents: e.target.value }))}
                className="w-full px-3 py-2 text-sm bg-white border border-areia rounded-sm focus:outline-none focus:border-champanhe"
                placeholder="0,00"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-cacau/70 uppercase tracking-wide block mb-1">Moeda</label>
              <select
                value={procForm.currency}
                onChange={(e) => setProcForm((f) => ({ ...f, currency: e.target.value }))}
                className="w-full px-3 py-2 text-sm bg-white border border-areia rounded-sm focus:outline-none focus:border-champanhe"
              >
                <option value="BRL">BRL — Real</option>
                <option value="EUR">EUR — Euro</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-cacau/70 uppercase tracking-wide block mb-1">Data</label>
            <input
              type="date"
              value={procForm.date}
              onChange={(e) => setProcForm((f) => ({ ...f, date: e.target.value }))}
              className="w-full px-3 py-2 text-sm bg-white border border-areia rounded-sm focus:outline-none focus:border-champanhe"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-cacau/70 uppercase tracking-wide block mb-1">Observações</label>
            <textarea
              value={procForm.notes}
              onChange={(e) => setProcForm((f) => ({ ...f, notes: e.target.value }))}
              className="w-full px-3 py-2 text-sm bg-white border border-areia rounded-sm focus:outline-none focus:border-champanhe"
              rows={2}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowAddProcedure(false)}>Cancelar</Button>
            <Button onClick={handleAddProcedure}>Adicionar</Button>
          </div>
        </div>
      </Modal>

      {/* Upload modal */}
      <Modal open={showUpload} onClose={() => setShowUpload(false)} title="Enviar Arquivo">
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium text-cacau/70 uppercase tracking-wide block mb-1">Tipo</label>
            <select
              value={uploadForm.type}
              onChange={(e) => setUploadForm((f) => ({ ...f, type: e.target.value }))}
              className="w-full px-3 py-2 text-sm bg-white border border-areia rounded-sm focus:outline-none focus:border-champanhe"
            >
              {ATTACHMENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-cacau/70 uppercase tracking-wide block mb-1">
              Arquivo (JPEG, PNG, WebP, PDF · máx. 10MB)
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={(e) => setUploadForm((f) => ({ ...f, file: e.target.files?.[0] ?? null }))}
              className="w-full text-sm text-cacau/70 file:mr-3 file:py-2 file:px-3 file:border file:border-areia file:rounded-sm file:text-xs file:bg-areia/20 file:text-cacau hover:file:bg-areia/40"
            />
          </div>
          <p className="text-xs text-cacau/40">As fotos clínicas requerem consentimento documentado do paciente.</p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowUpload(false)}>Cancelar</Button>
            <Button onClick={handleUpload}>Enviar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
