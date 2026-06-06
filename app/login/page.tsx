"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: fd.get("email"),
      password: fd.get("password"),
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError("E-mail ou senha inválidos.");
    } else {
      router.push("/agenda");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-marfim flex items-center justify-center relative overflow-hidden">
      {/* Soft champagne glow — clean, no busy texture */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full bg-champanhe/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm mx-4">
        {/* Brand mark */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-full bg-cacau flex items-center justify-center text-white font-bodoni font-bold text-3xl mx-auto mb-6 shadow-apple ring-4 ring-cacau/10">
            CP
          </div>
          <h1 className="font-bodoni text-[1.6rem] text-cacau tracking-wide leading-tight">Cláudia Pacheco</h1>
          <p className="text-[11px] text-cacau/40 font-hanken mt-1.5 uppercase tracking-[0.18em]">
            Sistema de Gestão Clínica
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-md border border-black/5 rounded-2xl shadow-apple px-8 py-9">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              name="email"
              type="email"
              label="E-mail"
              placeholder="admin@clinicacp.com"
              autoComplete="email"
              required
            />
            <Input
              name="password"
              type="password"
              label="Senha"
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">
                {error}
              </p>
            )}
            <Button type="submit" size="lg" disabled={loading} className="mt-1 w-full">
              {loading ? "Entrando…" : "Entrar"}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-cacau/25 mt-6">
          Acesso exclusivo para equipa da clínica.
        </p>
      </div>
    </div>
  );
}
