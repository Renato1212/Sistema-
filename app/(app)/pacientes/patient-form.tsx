"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { patientSchema, PatientInput } from "@/lib/schemas";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface Props {
  defaultValues?: Partial<PatientInput>;
  onSuccess: (id: string) => void;
  onCancel: () => void;
  patientId?: string;
}

export function PatientForm({ defaultValues, onSuccess, onCancel, patientId }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PatientInput>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      marketingConsent: false,
      ...defaultValues,
    },
  });

  const consentChecked = watch("marketingConsent");

  async function onSubmit(data: PatientInput) {
    setLoading(true);
    setError("");
    try {
      const url = patientId ? `/api/patients/${patientId}` : "/api/patients";
      const method = patientId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Erro ao salvar.");
        return;
      }
      const result = await res.json();
      onSuccess(result.id);
    } catch {
      setError("Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input label="Nome completo" error={errors.fullName?.message} {...register("fullName")} />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Data de nascimento" type="date" {...register("birthDate")} />
        <Input label="Telefone" {...register("phone")} placeholder="+351 91 000 0000" />
      </div>
      <Input label="E-mail" type="email" error={errors.email?.message} {...register("email")} />
      <Textarea label="Comentários" {...register("notes")} rows={3} />

      {/* Marketing consent */}
      <div className="border border-white/10 rounded-xl p-4 bg-areia/[0.06]">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-areia/40 text-champanhe focus:ring-champanhe accent-champanhe"
            {...register("marketingConsent")}
          />
          <span className="text-sm text-cacau">Consentimento para Marketing</span>
        </label>
        {consentChecked && (
          <div className="mt-3.5">
            <Input label="Data do consentimento" type="date" {...register("marketingConsentDate")} />
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-rose bg-rose/10 border border-rose/25 rounded-xl px-3.5 py-2.5">{error}</p>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando…" : "Salvar"}
        </Button>
      </div>
    </form>
  );
}
