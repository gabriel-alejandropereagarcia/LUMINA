"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Printer } from "lucide-react";
import { formatUsd } from "@/lib/empresa/payment";
import { useEmpresaSession } from "@/hooks/useEmpresaSession";
import type { Certificado } from "@/lib/empresa/types";
import type { ImpactTotalsRow } from "@/lib/hito/fact";

export default function EmpresaImpactoPage() {
  const router = useRouter();
  const { session, loading } = useEmpresaSession();
  const [totals, setTotals] = useState<ImpactTotalsRow[]>([]);
  const [certificados, setCertificados] = useState<Certificado[]>([]);
  const [sentence, setSentence] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!session) {
      router.replace("/empresa");
      return;
    }
    fetch("/api/empresa/impacto")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "No se pudo cargar.");
        setTotals(data.totals ?? []);
        setCertificados(data.certificados ?? []);
        setSentence(data.sentence ?? "");
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Error.");
      });
  }, [loading, session, router]);

  if (loading || !session) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center text-sm text-[var(--muted)]">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Cargando resumen…
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-10 sm:px-6 max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between gap-3 print:hidden">
        <Link href="/empresa/portal" className="text-xs text-teal-600 underline">
          ← Portal
        </Link>
        <div className="flex gap-2">
          <a
            href="/api/empresa/impacto/csv"
            className="rounded-xl border border-[var(--border)] px-4 py-2 text-xs font-bold"
          >
            Descargar CSV
          </a>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white"
          >
            <Printer className="h-3.5 w-3.5" />
            Imprimir resumen
          </button>
        </div>
      </div>

      <header className="space-y-2">
        <p className="text-xs font-bold text-teal-600 uppercase tracking-widest">Resumen de impacto</p>
        <h1 className="font-serif text-3xl font-bold">{session.company}</h1>
        <p className="text-sm text-[var(--muted)] leading-relaxed">
          Unidades financiadas. Cada una sale de la ficha de la app. Lumina atestigua el pago.
          El trabajo lo confirma la app.
        </p>
      </header>

      {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}

      {sentence ? (
        <blockquote className="rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-5 text-sm leading-relaxed">
            En este período financiamos {sentence}. Cada trabajo tiene un certificado
            (qué se hizo y cuánto se pagó). El 97,5% fue a esa app.
        </blockquote>
      ) : (
        <p className="text-sm text-[var(--muted)]">Todavía no hay trabajos confirmados.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {totals.map((row) => (
          <div key={row.schemaId} className="rounded-2xl border border-[var(--border)] p-5">
            <p className="text-xs text-[var(--muted)] uppercase tracking-wider">{row.appName}</p>
            <p className="font-serif text-4xl font-bold mt-1">{row.quantity}</p>
            <p className="text-sm">{row.unitLabel}</p>
            <p className="text-xs text-[var(--muted)] mt-2">{formatUsd(row.amountUsd)}</p>
          </div>
        ))}
      </div>

      <table className="w-full text-sm border border-[var(--border)] rounded-2xl overflow-hidden">
        <thead className="text-left text-[10px] uppercase tracking-wider text-[var(--muted)] bg-[var(--muted-bg)]">
          <tr>
            <th className="px-3 py-2">Período</th>
            <th className="px-3 py-2">Unidad</th>
            <th className="px-3 py-2">Qty</th>
            <th className="px-3 py-2">Recibo</th>
          </tr>
        </thead>
        <tbody>
          {certificados.map((item) => (
            <tr key={item.id} className="border-t border-[var(--border)]">
              <td className="px-3 py-2">{item.period}</td>
              <td className="px-3 py-2">
                <Link href={`/c/${item.id}`} className="text-teal-600 underline">
                  {item.unitLabel}
                </Link>
              </td>
              <td className="px-3 py-2">{item.quantity}</td>
              <td className="px-3 py-2 font-mono text-[11px]">{item.reportHash.slice(0, 16)}…</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
