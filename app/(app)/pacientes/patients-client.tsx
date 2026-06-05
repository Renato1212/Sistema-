"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, Search, Archive, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { PatientForm } from "./patient-form";
import { formatDate } from "@/lib/format";

interface Patient {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  birthDate: Date | null;
  deletedAt: Date | null;
  marketingConsent: boolean;
  _count: { procedures: number; appointments: number };
}

interface Props {
  patients: Patient[];
  query: string;
  showArchived: boolean;
}

export function PatientsClient({ patients, query, showArchived }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [search, setSearch] = useState(query);
  const [showModal, setShowModal] = useState(false);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (showArchived) params.set("archived", "1");
    router.push(`/pacientes?${params.toString()}`);
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-bodoni text-display-md text-cacau">Pacientes</h1>
          <p className="text-sm text-cacau/50 mt-1">
            {patients.length} {patients.length === 1 ? "paciente" : "pacientes"} encontrado{patients.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-2">
          <UserPlus size={16} />
          Novo Paciente
        </Button>
      </div>

      {/* Filters */}
      <form onSubmit={handleSearch} className="flex items-center gap-3 mb-6">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cacau/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, e-mail ou telefone…"
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-areia rounded-sm focus:outline-none focus:border-champanhe"
          />
        </div>
        <Button type="submit" variant="secondary" size="sm">Buscar</Button>
        <Link
          href={showArchived ? "/pacientes" : "/pacientes?archived=1"}
          className="flex items-center gap-1.5 text-xs text-cacau/50 hover:text-cacau border border-areia rounded-sm px-3 py-2 transition-colors"
        >
          <Archive size={13} />
          {showArchived ? "Ver ativos" : "Arquivados"}
        </Link>
      </form>

      {/* Table */}
      {patients.length === 0 ? (
        <div className="text-center py-20 text-cacau/40">
          <User size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-newsreader italic">Nenhum paciente encontrado.</p>
        </div>
      ) : (
        <div className="bg-white border border-areia rounded-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-areia/20 border-b border-areia">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-cacau/60 text-xs uppercase tracking-wide">Nome</th>
                <th className="text-left px-5 py-3 font-medium text-cacau/60 text-xs uppercase tracking-wide">Contato</th>
                <th className="text-left px-5 py-3 font-medium text-cacau/60 text-xs uppercase tracking-wide">Nascimento</th>
                <th className="text-left px-5 py-3 font-medium text-cacau/60 text-xs uppercase tracking-wide">Procedimentos</th>
                <th className="text-left px-5 py-3 font-medium text-cacau/60 text-xs uppercase tracking-wide">Marketing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-areia/40">
              {patients.map((p) => (
                <tr key={p.id} className="hover:bg-areia/10 transition-colors">
                  <td className="px-5 py-3.5">
                    <Link href={`/pacientes/${p.id}`} className="font-medium text-cacau hover:text-champanhe transition-colors">
                      {p.fullName}
                      {p.deletedAt && <span className="ml-2 text-xs text-red-400">(arquivado)</span>}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-cacau/60">
                    <div>{p.email}</div>
                    <div className="text-xs">{p.phone}</div>
                  </td>
                  <td className="px-5 py-3.5 text-cacau/60">
                    {p.birthDate ? formatDate(p.birthDate) : "—"}
                  </td>
                  <td className="px-5 py-3.5 text-cacau/60">
                    {p._count.procedures}
                  </td>
                  <td className="px-5 py-3.5">
                    {p.marketingConsent ? (
                      <span className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">Sim</span>
                    ) : (
                      <span className="text-xs text-cacau/40">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Novo Paciente" size="lg">
        <PatientForm
          onSuccess={(id) => {
            setShowModal(false);
            toast("Paciente criado com sucesso!", "success");
            router.push(`/pacientes/${id}`);
          }}
          onCancel={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
}
