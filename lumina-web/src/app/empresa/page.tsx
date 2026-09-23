"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  FileCheck,
  Landmark,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useEmpresaSession } from "@/hooks/useEmpresaSession";

export default function EmpresaLandingPage() {
  const { session, loading, ops } = useEmpresaSession();
  const [cuit, setCuit] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [devLink, setDevLink] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<"entrar" | "reset" | null>(null);

  const askLink = async (reset: boolean) => {
    setSubmitting(reset ? "reset" : "entrar");
    setError(null);
    setNotice(null);
    setDevLink(null);
    try {
      const response = await fetch("/api/empresa/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cuit, email, reset }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "No se pudo pedir el acceso.");
      }
      setNotice(
        data.mailReady
          ? "Si el mail es de esa empresa, te llega un link. Vence en 15 minutos."
          : data.message || "El envío de mail está en trabajo.",
      );
      if (typeof data.entrarUrl === "string") setDevLink(data.entrarUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de acceso.");
    } finally {
      setSubmitting(null);
    }
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await askLink(false);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-12 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <div className="space-y-6">
          <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">
            Empresas en Lumina
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-[var(--foreground)] leading-tight">
            Una factura. Una luz en el camino.
          </h1>
          <p className="text-base text-[var(--muted)] leading-relaxed max-w-xl">
            El tablero es de la CUIT. Lumina manda un link al mail de la empresa.
            Transferís pesos. Cada unidad confirmada enciende una luz. Quien usa la app no paga.
          </p>

          <ul className="space-y-3 text-sm text-[var(--muted)]">
            {[
              {
                icon: Landmark,
                text: "Una factura. Lumina cobra el servicio.",
              },
              {
                icon: Lock,
                text: "El dinero queda reservado 12 meses. Si el trabajo no ocurre, recuperás todo. El 2,5% solo si hubo impacto.",
              },
              {
                icon: FileCheck,
                text: "Un PDF y un recibo: pagó, eligió, cobró. Se ve en el camino.",
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
          <p className="text-sm">
            <Link href="/?vista=hoy#camino" className="text-teal-600 underline font-semibold">
              Ver cómo se ve en el camino
            </Link>
          </p>
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
                CUIT y mail de la empresa. Te mandamos un link.
              </p>
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-[var(--muted)]">Cargando sesión…</p>
          ) : session ? (
            <div className="space-y-4">
              <p className="text-sm text-[var(--muted)]">
                Tablero de <strong className="text-[var(--foreground)]">{session.company}</strong>
                <span className="block font-mono text-xs mt-1">{session.cuit}</span>
                <span className="block font-mono text-xs">{session.email}</span>
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
                <span className="text-xs font-semibold text-[var(--muted)]">CUIT</span>
                <input
                  id="empresa-cuit"
                  required
                  inputMode="numeric"
                  autoComplete="off"
                  value={cuit}
                  onChange={(event) => setCuit(event.target.value)}
                  placeholder="30-12345678-9"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)]"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-[var(--muted)]">Mail de la empresa</span>
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
              {notice && <p className="text-xs text-teal-700">{notice}</p>}
              {devLink && (
                <p className="text-xs leading-relaxed">
                  Correo en trabajo.{" "}
                  <a id="link-empresa-dev" href={devLink} className="text-teal-600 underline font-semibold">
                    Abrir el link de esta máquina
                  </a>
                  .
                </p>
              )}
              <button
                type="submit"
                disabled={!!submitting}
                id="btn-empresa-entrar"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-green-600 px-6 py-3 text-sm font-semibold text-white disabled:opacity-50 cursor-pointer"
              >
                <Mail className="h-4 w-4" />
                {submitting === "entrar" ? "Enviando…" : "Mandame el link"}
              </button>
              <button
                type="button"
                disabled={!!submitting}
                id="btn-empresa-reset"
                onClick={() => void askLink(true)}
                className="w-full text-xs font-semibold text-teal-600 underline disabled:opacity-50 cursor-pointer"
              >
                {submitting === "reset" ? "Pidiendo uno nuevo…" : "No me llegó. Pedir un link nuevo"}
              </button>
              <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                No se tipea el nombre. El tablero es de esa CUIT.
                {ops?.mailReady ? "" : " El envío de mail: en trabajo."}
                {ops?.persistReady ? "" : " El dato: en trabajo (un deploy puede borrarlo)."}
              </p>
            </form>
          )}
        </div>
      </div>

      <p className="text-[11px] text-[var(--muted)] leading-relaxed max-w-3xl">
        Pagás un servicio a Lumina. El cobro en pesos: en trabajo — no transferir
        dinero real. El camino de hoy muestra la luz del 19/9. Si querés ver un pago de prueba, andá a{" "}
        <Link href="/invest" className="underline font-semibold">
          Probar Lumina
        </Link>
        .
      </p>
    </div>
  );
}
