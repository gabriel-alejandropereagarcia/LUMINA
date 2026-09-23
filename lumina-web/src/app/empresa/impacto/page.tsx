"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Printer } from "lucide-react";
import { formatUsd } from "@/lib/empresa/payment";
import { useEmpresaSession } from "@/hooks/useEmpresaSession";
import type { Aporte, Certificado } from "@/lib/empresa/types";
import RecibosMovimiento from "@/components/empresa/RecibosMovimiento";
import { pasosDeCertificado } from "@/lib/empresa/recibos";
import type { ImpactTotalsRow } from "@/lib/hito/fact";

export default function EmpresaImpactoPage() {
  const router = useRouter();
  const { session, loading } = useEmpresaSession();
  const [totals, setTotals] = useState<ImpactTotalsRow[]>([]);
  const [aportes, setAportes] = useState<Aporte[]>([]);
  const [certificados, setCertificados] = useState<Certificado[]>([]);
  const [sentence, setSentence] = useState("");
  const [enTrabajo, setEnTrabajo] = useState(0);
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
        setAportes(data.aportes ?? []);
        setCertificados(data.certificados ?? []);
        setSentence(data.sentence ?? "");
        setEnTrabajo(typeof data.enTrabajo === "number" ? data.enTrabajo : 0);
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
          ← Empresas en Lumina
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
        <p className="text-xs font-bold text-teal-600 uppercase tracking-widest">
          Para comunicaciones e inversores
        </p>
        <h1 className="font-serif text-3xl font-bold">{session.company}</h1>
        {session.cuit ? (
          <p className="font-mono text-xs text-[var(--muted)]">{session.cuit}</p>
        ) : null}
        <p className="text-sm text-[var(--muted)] leading-relaxed">
          La empresa reservó la ayuda y eligió la app. La app marcó el trabajo.
          Eso liberó el dinero. Este informe se agrega a la memoria y a lo que se muestra a inversores.
        </p>
      </header>

      {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}

      {sentence ? (
        <blockquote className="rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-5 text-sm leading-relaxed">
          En este período, {session.company} hizo llegar la ayuda: {sentence}. La app
          marcó cada trabajo y eso liberó el 97,5%. La familia no pagó. Cada recibo se
          abre en Lumina. Este informe no descuenta en Ganancias.
        </blockquote>
      ) : (
        <p className="text-sm text-[var(--muted)]">
          Todavía no hay un trabajo confirmado para esta CUIT. Un recorrido de prueba
          no es ayuda que llegó.
        </p>
      )}

      {enTrabajo > 0 ? (
        <p className="text-sm text-[var(--muted)]">
          {enTrabajo === 1
            ? "Hay 1 recorrido en trabajo. Todavía no liberó dinero."
            : `Hay ${enTrabajo} recorridos en trabajo. Todavía no liberaron dinero.`}
        </p>
      ) : null}

      <section className="rounded-2xl border border-[var(--border)] p-5 space-y-2 text-sm text-[var(--muted)]">
        <h2 className="font-serif text-lg font-bold text-[var(--foreground)]">Cómo se libera</h2>
        <p>La empresa reserva el dinero y elige la app.</p>
        <p>La app emite el informe. Ese informe queda en el recibo y libera el 97,5%.</p>
        <p>Si en 12 meses no hay informe, el dinero vuelve y Lumina cobra 0%.</p>
      </section>

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
            <th className="px-3 py-2">Estado</th>
            <th className="px-3 py-2">Recibos</th>
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
              <td className="px-3 py-2">{item.simulation ? "En trabajo" : "La ayuda llegó"}</td>
              <td className="px-3 py-2">
                <RecibosMovimiento
                  pasos={pasosDeCertificado(
                    item,
                    aportes.find((aporte) => aporte.id === item.aporteId),
                  )}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
