"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PRODUCT, TENANT } from "@/lib/brand";

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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
      <div className="relative z-10 w-full max-w-sm">
        {/* Brand mark */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-full bg-grad flex items-center justify-center text-[#241A10] font-bodoni font-bold text-3xl mx-auto mb-7 shadow-gold-lg">
            {TENANT.initials}
          </div>
          <h1 className="font-bodoni font-bold text-[1.7rem] tracking-tight leading-tight">
            <span className="grad-text">{TENANT.shortName}</span>
          </h1>
          <p className="kicker mt-2.5">
            {PRODUCT.name} · {PRODUCT.tagline}
          </p>
        </div>

        {/* Card */}
        <div className="glow-card bg-surface/80 backdrop-blur-md rounded-2xl shadow-apple px-8 py-9">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              name="email"
              type="email"
              label="E-mail"
              placeholder="o-seu@email.com"
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
              <p className="text-xs text-rose bg-rose/10 border border-rose/25 rounded-xl px-3.5 py-2.5">
                {error}
              </p>
            )}
            <Button type="submit" size="lg" disabled={loading} className="mt-1 w-full">
              {loading ? "Entrando…" : "Entrar"}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-cacau/25 mt-6">
          Acesso exclusivo para a equipa da clínica.
        </p>
      </div>
    </div>
  );
}
