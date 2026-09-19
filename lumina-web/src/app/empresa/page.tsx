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
        throw new Error(data.error || "No se pudo entrar al portal.");
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
      <div className="rounded-xl border border-[var(--gold-border,#D4A84B)]/30 bg-[var(--gold-light)] px-4 py-3 text-xs text-[var(--gold)]">
        Pagás un servicio de RSE, no comprás cripto. En el demo ABC el cobro ARS es simulado —
        no transferir pesos reales. El jurado on-chain entra por{" "}
        <Link href="/invest" className="underline font-semibold">
          /invest
        </Link>
        .
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <div className="space-y-6">
          <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">
            Portal Empresa
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-[var(--foreground)] leading-tight">
            Lockeá RSE como pagás cualquier proveedor
          </h1>
          <p className="text-base text-[var(--muted)] leading-relaxed max-w-xl">
            Transferís ARS. No abrís wallet. El panel cuenta 10 niño-mes, no una planilla de
            dólares. Cada hito deja PDF + hash. Quien usa la app de impacto no paga.
          </p>

          <ul className="space-y-3 text-sm text-[var(--muted)]">
            {[
              {
                icon: Landmark,
                text: "Factura de servicio RSE. El PSAV cobra para Lumina. No sos clienta de un exchange.",
              },
              {
                icon: Lock,
                text: "Capital locked 12 meses. Sin hito, recuperás. Fee 2,5% solo si hubo release.",
              },
              {
                icon: FileCheck,
                text: "Certificado imprimible: unidad, pago y hash. Sin DNI ni clínica.",
              },
              {
                icon: ShieldCheck,
                text: "La app cobra el 97,5%. La familia no toca cripto.",
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
                Entrar al portal
              </h2>
              <p className="text-xs text-[var(--muted)]">
                Email corporativo. Cero Freighter, cero seed.
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
                Ir al portal
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
                Demo sin contraseña. En producción: KYB del cobrador (PSAV o
                Circle HQ). Lumina no vende USDC a la empresa.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
