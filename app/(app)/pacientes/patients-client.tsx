"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, Search, Archive, User } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <div className="p-4 sm:p-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="font-bodoni text-display-md text-cacau">Pacientes</h1>
          <p className="text-sm text-cacau/40 mt-1">
            {patients.length} {patients.length === 1 ? "paciente" : "pacientes"}
          </p>
        </div>
        <Button onClick={() => setShowModal(true)} size="sm">
          <UserPlus size={15} />
          <span className="hidden sm:inline">Novo Paciente</span>
          <span className="sm:hidden">Novo</span>
        </Button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex items-center gap-2 sm:gap-3 mb-5 sm:mb-6">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cacau/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou e-mail…"
            className="cp-field pl-9"
          />
        </div>
        <Button type="submit" variant="secondary" size="sm">Buscar</Button>
        <Link
          href={showArchived ? "/pacientes" : "/pacientes?archived=1"}
          className="flex items-center gap-1.5 text-xs text-cacau/40 hover:text-cacau border border-black/10 rounded-full px-3 py-1.5 transition-all hover:border-black/15 hover:bg-white shrink-0 touch-manipulation"
        >
          <Archive size={13} />
          <span className="hidden sm:inline">{showArchived ? "Ver ativos" : "Arquivados"}</span>
        </Link>
      </form>

      {/* Content */}
      {patients.length === 0 ? (
        <div className="text-center py-20 text-cacau/35">
          <User size={40} className="mx-auto mb-3 opacity-25" />
          <p className="font-newsreader italic text-lg">Nenhum paciente encontrado.</p>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="sm:hidden flex flex-col gap-3">
            {patients.map((p) => (
              <Link key={p.id} href={`/pacientes/${p.id}`} className="cp-card p-4 block active:scale-[0.99] transition-transform touch-manipulation">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-cacau truncate">
                      {p.fullName}
                      {p.deletedAt && <span className="ml-2 text-xs text-red-400">(arquivado)</span>}
                    </p>
                    {p.email && <p className="text-sm text-cacau/50 truncate mt-0.5">{p.email}</p>}
                    {p.phone && <p className="text-xs text-cacau/40 mt-0.5">{p.phone}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-cacau/40">{p._count.procedures} proc.</p>
                    {p.marketingConsent && (
                      <span className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5 mt-1 inline-block">MKT ✓</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block cp-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[580px]">
                <thead className="bg-areia/10 border-b border-black/5">
                  <tr>
                    <th className="text-left px-5 py-3.5 text-[11px] uppercase tracking-wider text-cacau/40 font-medium">Nome</th>
                    <th className="text-left px-5 py-3.5 text-[11px] uppercase tracking-wider text-cacau/40 font-medium">Contato</th>
                    <th className="text-left px-5 py-3.5 text-[11px] uppercase tracking-wider text-cacau/40 font-medium">Nascimento</th>
                    <th className="text-left px-5 py-3.5 text-[11px] uppercase tracking-wider text-cacau/40 font-medium">Proc.</th>
                    <th className="text-left px-5 py-3.5 text-[11px] uppercase tracking-wider text-cacau/40 font-medium">Marketing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04]">
                  {patients.map((p) => (
                    <tr key={p.id} className="hover:bg-areia/[0.08] transition-colors">
                      <td className="px-5 py-4">
                        <Link href={`/pacientes/${p.id}`} className="font-medium text-cacau hover:text-champanhe transition-colors">
                          {p.fullName}
                          {p.deletedAt && <span className="ml-2 text-xs text-red-400">(arquivado)</span>}
                        </Link>
                      </td>
                      <td className="px-5 py-4 text-cacau/50">
                        <div>{p.email}</div>
                        <div className="text-xs mt-0.5">{p.phone}</div>
                      </td>
                      <td className="px-5 py-4 text-cacau/50">
                        {p.birthDate ? formatDate(p.birthDate) : "—"}
                      </td>
                      <td className="px-5 py-4 text-cacau/50">{p._count.procedures}</td>
                      <td className="px-5 py-4">
                        {p.marketingConsent ? (
                          <span className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5">Sim</span>
                        ) : (
                          <span className="text-xs text-cacau/30">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
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
