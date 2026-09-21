"use client";

import { useState } from "react";
import Link from "next/link";

type Props = {
  sponsor: string;
  amount: number;
};

export default function CertifyDemoButton({ sponsor, amount }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ hash: string; reportHash: string } | null>(null);

  const run = async () => {
    setBusy(true);
    setError(null);
    try {
      const period = new Date().toISOString().slice(0, 7);
      const commitment = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
      const fact = {
        schemaId: "mira.cribado.v1",
        unitLabel: "cribado M-CHAT-R/F",
        quantity: 1,
        period,
        subjectCommitments: [commitment],
        sponsorRef: sponsor,
        amountUsd: amount,
        appId: "mira",
      };
      const res = await fetch("/api/v1/certify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-lumina-demo": "jury",
        },
        body: JSON.stringify({ sponsor, amount, fact }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(
          typeof json.error === "string"
            ? json.error
            : "No se pudo confirmar. Si este deploy no tiene la clave de la app, usá los comprobantes del 19/9.",
        );
      }
      setResult({ hash: json.hash, reportHash: json.reportHash });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se pudo confirmar el trabajo.");
    } finally {
      setBusy(false);
    }
  };

  if (result) {
    return (
      <p className="text-xs text-[var(--muted)] leading-relaxed">
        Cobro listo.{" "}
        <Link
          href={`/jury?release=${result.hash}&hash=${result.reportHash}`}
          className="text-teal-500 underline"
        >
          Ver comprobante
        </Link>
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={run}
        disabled={busy || !sponsor.startsWith("G")}
        className="w-full rounded-xl border border-teal-500/40 px-4 py-3 text-sm font-semibold text-teal-600 hover:bg-[var(--teal-light)] disabled:opacity-50"
      >
        {busy ? "Confirmando el trabajo…" : "Confirmar que el trabajo se hizo"}
      </button>
      <p className="text-[11px] text-[var(--muted)] leading-relaxed">
        Confirma el trabajo de prueba y paga el 97,5% a la app. Si falla, los comprobantes
        del 19/9 están en Comprobantes.
      </p>
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  );
}
