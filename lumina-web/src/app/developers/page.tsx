"use client";

import Link from "next/link";
import { USDC_TESTNET_SAC, USDT0_OFFICIAL } from "@/lib/official-assets";

export default function DevelopersPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-16 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-8">
      <div className="space-y-3">
        <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">
          Developers
        </span>
        <h1 className="font-serif text-4xl font-bold text-[var(--foreground)]">
          Un POST. El 97,5% llega a la app.
        </h1>
        <p className="text-sm text-[var(--muted)] leading-relaxed">
          La app avisa que el trabajo se hizo (unidad, cantidad).
          El panel de la empresa suma esas unidades, no un número de marketing.
        </p>
      </div>

      <pre className="rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-4 text-[11px] overflow-x-auto text-[var(--foreground)] leading-relaxed">
{`POST /api/v1/certify
Authorization: Bearer <secret de la app>
{
  "oracle": "G...",
  "sponsor": "G...",
  "asset": "${USDC_TESTNET_SAC}",
  "amount": 40,
  "fact": {
    "schemaId": "puentemae.nino-mes.v1",
    "unitLabel": "niño-mes de apoyo a la inclusión",
    "quantity": 1,
    "period": "2026-09",
    "subjectCommitments": ["<64 hex>"],
    "sponsorRef": "apo-xxxxxxxx",
    "amountUsd": 40,
    "appId": "puentemae"
  }
}`}
      </pre>

      <p className="text-xs text-[var(--muted)]">
        El mismo trabajo (misma persona, mismo período) no se cobra dos veces. Ejemplo:{" "}
        <code className="font-mono">npx tsx examples/certify.ts</code>.
      </p>

      <div className="rounded-2xl border border-[var(--border)] p-4 text-xs space-y-2 text-[var(--muted)]">
        <p className="font-semibold text-[var(--foreground)]">Assets</p>
        <p>
          USDC testnet:{" "}
          <span className="font-mono break-all">{USDC_TESTNET_SAC}</span>
        </p>
        <p>
          USDT0 oficial (mainnet, próximamente en el recorrido):{" "}
          <span className="font-mono break-all">{USDT0_OFFICIAL.sac}</span>
          . Entorno de prueba oficial: no existe. Docs:{" "}
          <a href={USDT0_OFFICIAL.docs} className="text-teal-400 underline" target="_blank" rel="noreferrer">
            SDF USDT0
          </a>
          .
        </p>
      </div>

      <Link href="/connect" className="text-sm text-teal-500 underline">
        ← Volver a Apps
      </Link>
    </div>
  );
}
