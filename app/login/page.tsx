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
      {/* Texture background */}
      <div className="absolute inset-0 isolinhas opacity-60 pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm mx-4">
        {/* Brand mark */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-full bg-cacau flex items-center justify-center text-white font-bodoni font-bold text-2xl mx-auto mb-5 shadow-lg">
            CP
          </div>
          <h1 className="font-bodoni text-2xl text-cacau tracking-wide">Cláudia Pacheco</h1>
          <p className="text-xs text-cacau/50 font-hanken mt-1 uppercase tracking-widest">
            Sistema de Gestão Clínica
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-areia rounded-sm shadow-sm p-8">
          <h2 className="font-newsreader text-lg text-cacau mb-6 italic">Acesso restrito</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                {error}
              </p>
            )}
            <Button type="submit" size="lg" disabled={loading} className="mt-2 w-full">
              {loading ? "Entrando…" : "Entrar"}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-cacau/30 mt-6">
          Acesso exclusivo para equipa da clínica.
        </p>
      </div>
    </div>
  );
}
