"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Building2,
  FileCheck,
  Landmark,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { useEmpresaSession } from "@/hooks/useEmpresaSession";

export default function EmpresaLandingPage() {
  const router = useRouter();
  const { session, loading, setSession } = useEmpresaSession();
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/empresa/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, company }),
      });
      const data = await response.json();
      if (!response.ok) {
          throw new Error(data.error || "No se pudo entrar a Lumina.");
      }
      setSession(data.session);
      router.push("/empresa/portal");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de sesión.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-12 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <div className="space-y-6">
          <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">
            Empresas en Lumina
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-[var(--foreground)] leading-tight">
            Pagás el impacto como pagás cualquier proveedor
          </h1>
          <p className="text-base text-[var(--muted)] leading-relaxed max-w-xl">
            Transferís pesos. No abrís una cuenta cripto. El panel cuenta 10 niño-mes, no una
            planilla de dólares. Cada trabajo deja un PDF. Quien usa la app no paga.
          </p>

          <ul className="space-y-3 text-sm text-[var(--muted)]">
            {[
              {
                icon: Landmark,
                text: "Una factura. Lumina cobra el servicio. Vos no comprás cripto.",
              },
              {
                icon: Lock,
                text: "El dinero queda reservado 12 meses. Si el trabajo no ocurre, recuperás todo. El 2,5% solo si hubo impacto.",
              },
              {
                icon: FileCheck,
                text: "Un PDF: qué se hizo, cuánto se pagó. Sin DNI ni clínica.",
              },
              {
                icon: ShieldCheck,
                text: "La app cobra el 97,5%. La familia no paga.",
              },
            ].map((item) => (
              <li key={item.text} className="flex gap-3 items-start">
                <item.icon className="h-4 w-4 text-teal-600 mt-0.5 shrink-0" />
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-card p-8 rounded-2xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[var(--teal-light)] text-teal-600 flex items-center justify-center">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-[var(--foreground)]">
                Entrar a Lumina
              </h2>
              <p className="text-xs text-[var(--muted)]">
                Email de la empresa. Sin cuenta cripto.
              </p>
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-[var(--muted)]">Cargando sesión…</p>
          ) : session ? (
            <div className="space-y-4">
              <p className="text-sm text-[var(--muted)]">
                Sesión activa: <strong className="text-[var(--foreground)]">{session.company}</strong>
                <span className="block font-mono text-xs mt-1">{session.email}</span>
              </p>
              <Link
                href="/empresa/portal"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-green-600 px-6 py-3 text-sm font-semibold text-white"
              >
                Ir a Empresas en Lumina
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4" id="form-empresa-login">
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-[var(--muted)]">Empresa</span>
                <input
                  id="empresa-company"
                  required
                  minLength={2}
                  maxLength={80}
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                  placeholder="ARLI S.A."
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)]"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-[var(--muted)]">Email corporativo</span>
                <input
                  id="empresa-email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="rse@empresa.com"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)]"
                />
              </label>
              {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                id="btn-empresa-entrar"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-green-600 px-6 py-3 text-sm font-semibold text-white disabled:opacity-50 cursor-pointer"
              >
                {submitting ? "Entrando…" : "Continuar"}
                <ArrowRight className="h-4 w-4" />
              </button>
              <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                Entrás con el email. El cobro en pesos: en trabajo. Lumina no te vende cripto.
              </p>
            </form>
          )}
        </div>
      </div>

      <p className="text-[11px] text-[var(--muted)] leading-relaxed max-w-3xl">
        Pagás un servicio, no comprás cripto. El cobro en pesos: en trabajo — no transferir
        dinero real.         Si querés ver un pago de prueba, andá a{" "}
        <Link href="/invest" className="underline font-semibold">
          Probar Lumina
        </Link>
        .
      </p>
    </div>
  );
}
