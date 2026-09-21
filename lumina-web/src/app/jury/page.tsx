"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { USDC_TESTNET_CLASSIC, USDC_TESTNET_SAC } from "@/lib/official-assets";
import { txUrl } from "@/lib/explorer";

const ESCROW = process.env.NEXT_PUBLIC_LUMINA_CONTRACT_ID || "CBZAI24XP2RXDVXLRJNVGVGZ5QRDMNI54GTPBTN4OOLFTSFJRWQ4M3EJ";
const SPONSOR = process.env.NEXT_PUBLIC_SPONSOR_ADDRESS || "GBRR6QWYT5UIHATCC7SYJITERMDWKLE5HHJCNM5PP6GK2DRB4YPKSP5E";
const USDT0_TX = process.env.NEXT_PUBLIC_USDT0_PROOF_TX || "";

/** Evidencia E2E 19/9. */
const EVIDENCE = {
  deposit: "9fdbc2e8865a0a94339884d6345eb628c2d6ee16792ab5ebfe5f0a946765812f",
  assign: "0f58d322ce32855649d7f8c821987cd822d4181ea7121d0ce3829dfa5f48f9c3",
  release: "a26a36263013a9d38370c4ef55bb9a7f96fa860213e11f4805873b8a2995a522",
  reportHash: "4c39fcc97b18fddae23671ccebf5bb182db64a9e9e27f5f4e01cb365b21664ca",
};

const STORAGE_KEY = "lumina-jury-proof";

type Proof = { release: string; hash: string; usdt0: string };

function readStored(): Proof {
  if (typeof window === "undefined") return { release: "", hash: "", usdt0: "" };
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return { release: "", hash: "", usdt0: "" };
    const parsed = JSON.parse(raw) as Partial<Proof>;
    return {
      release: typeof parsed.release === "string" ? parsed.release : "",
      hash: typeof parsed.hash === "string" ? parsed.hash : "",
      usdt0: typeof parsed.usdt0 === "string" ? parsed.usdt0 : "",
    };
  } catch {
    return { release: "", hash: "", usdt0: "" };
  }
}

function JuryBody() {
  const params = useSearchParams();
  const router = useRouter();
  const [release, setRelease] = useState("");
  const [reportHash, setReportHash] = useState("");
  const [usdt0, setUsdt0] = useState("");

  useEffect(() => {
    const stored = readStored();
    setRelease(params.get("release") || stored.release);
    setReportHash(params.get("hash") || stored.hash);
    setUsdt0(params.get("usdt0") || USDT0_TX || stored.usdt0);
  }, [params]);

  const releaseShown = release.trim();
  const hashShown = reportHash.trim();
  const usdt0Shown = usdt0.trim();

  const applyProof = (event: FormEvent) => {
    event.preventDefault();
    const next: Proof = {
      release: release.trim(),
      hash: reportHash.trim(),
      usdt0: usdt0.trim(),
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    const query = new URLSearchParams();
    if (next.release) query.set("release", next.release);
    if (next.hash) query.set("hash", next.hash);
    if (next.usdt0) query.set("usdt0", next.usdt0);
    router.replace(query.size ? `/jury?${query.toString()}` : "/jury");
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-16 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-8">
      <div className="space-y-3">
        <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">
          En Lumina
        </span>
        <h1 className="font-serif text-4xl font-bold text-[var(--foreground)]">
          Recibos Lumina
        </h1>
        <p className="text-sm text-[var(--muted)] leading-relaxed">
          Impacto sin fricción. Una factura. Si el trabajo ocurrió, el 97,5% llega a la app.
          Si no, el dinero vuelve. El usuario final nunca paga. Abajo, el pago del 19/9
          y cómo recorrerlo.{" "}
          <Link href="/presentation" className="text-teal-500 underline">
            Cómo funciona, en 8 slides
          </Link>
          .
        </p>
      </div>

      <section className="space-y-3 rounded-2xl border border-[var(--border)] p-5">
        <h2 className="text-[var(--foreground)] font-bold">Pago del 19/9 · 40 USDC de prueba</h2>
        <p className="text-xs text-[var(--muted)]">
          La empresa pagó → la empresa eligió MIRA → MIRA cobró. Cada enlace abre el recibo.
        </p>
        <ul className="space-y-2 text-xs font-mono break-all">
          <li>
            La empresa pagó:{" "}
            <a href={txUrl(EVIDENCE.deposit)} className="text-teal-500 underline" target="_blank" rel="noreferrer">
              {EVIDENCE.deposit}
            </a>
          </li>
          <li>
            La empresa eligió MIRA:{" "}
            <a href={txUrl(EVIDENCE.assign)} className="text-teal-500 underline" target="_blank" rel="noreferrer">
              {EVIDENCE.assign}
            </a>
          </li>
          <li>
            MIRA cobró el 97,5%:{" "}
            <a href={txUrl(EVIDENCE.release)} className="text-teal-500 underline" target="_blank" rel="noreferrer">
              {EVIDENCE.release}
            </a>
          </li>
          <li className="text-[var(--muted)]">Código del trabajo: {EVIDENCE.reportHash}</li>
        </ul>
      </section>

      <section className="space-y-2 text-sm text-[var(--muted)]">
        <h2 className="text-[var(--foreground)] font-bold">Cómo recorrerlo</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            <Link href="/empresa" className="text-teal-500 underline">
              Empresas en Lumina
            </Link>{" "}
            — factura. El cobro en pesos: en trabajo (este recorrido muestra cómo se ve).
            El PDF sale cuando la app cobra.
          </li>
          <li>
            <Link href="/invest" className="text-teal-500 underline">
              Probar Lumina
            </Link>{" "}
            — Freighter + USDC de prueba: depositás y elegís qué financiar. Después, confirmá el trabajo
            o usá los recibos de arriba.
          </li>
          <li>
            Recibo:{" "}
            <a
              href={`https://stellar.expert/explorer/testnet/contract/${ESCROW}`}
              className="text-teal-500 underline font-mono break-all"
              target="_blank"
              rel="noreferrer"
            >
              {ESCROW}
            </a>
          </li>
        </ol>
      </section>

      <section className="space-y-3 text-sm">
        <h2 className="text-[var(--foreground)] font-bold">Otro recibo (opcional)</h2>
        <p className="text-xs text-[var(--muted)]">
          Si corriste un cobro nuevo, pegalo acá. No reemplaza el del 19/9.
        </p>
        <form onSubmit={applyProof} className="space-y-2">
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-[var(--muted)]">Recibo del cobro</span>
            <input
              value={release}
              onChange={(e) => setRelease(e.target.value)}
              placeholder="identificador del cobro"
              className="w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2 font-mono text-xs"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-[var(--muted)]">Código del trabajo</span>
            <input
              value={reportHash}
              onChange={(e) => setReportHash(e.target.value)}
              placeholder="código único"
              className="w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2 font-mono text-xs"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-[var(--muted)]">USDT0 tx mainnet</span>
            <input
              value={usdt0}
              onChange={(e) => setUsdt0(e.target.value)}
              placeholder="vacío = próximamente"
              className="w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2 font-mono text-xs"
            />
          </label>
          <button
            type="submit"
            className="rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white"
          >
            Mostrar
          </button>
        </form>
        {releaseShown ? (
          <p className="text-xs font-mono break-all">
            Extra:{" "}
            <a href={txUrl(releaseShown)} className="text-teal-500 underline" target="_blank" rel="noreferrer">
              {releaseShown}
            </a>
            {hashShown ? ` · ${hashShown}` : ""}
          </p>
        ) : null}
      </section>

      <section className="space-y-2 text-sm">
        <h2 className="text-[var(--foreground)] font-bold">USDT0</h2>
        <p className="text-sm text-[var(--muted)]">
          Hoy el recorrido usa USDC Circle de prueba. USDT0 oficial: próximamente.
        </p>
        {usdt0Shown ? (
          <p className="text-xs font-mono break-all">
            <a
              href={`https://stellar.expert/explorer/public/tx/${usdt0Shown}`}
              className="text-teal-500 underline"
              target="_blank"
              rel="noreferrer"
            >
              {usdt0Shown}
            </a>
          </p>
        ) : null}
      </section>

      <section className="space-y-2 text-xs font-mono text-[var(--muted)] break-all">
        <h2 className="font-sans text-sm font-bold text-[var(--foreground)]">Cuentas</h2>
        <p>Reserva: {ESCROW}</p>
        <p>Admin: {process.env.NEXT_PUBLIC_ADMIN_ADDRESS || "GBKDKKKCMCB5CQG25R37F7VIHGO62557HZQUU4CZWTOTUK6HKLMNUDMK"}</p>
        <p>App (firma): {process.env.NEXT_PUBLIC_ORACLE_ADDRESS || "GBJJCKJBEF2ILRD5LGWXGH5BQIKZ6EYFDS3RHQZQ5KBCOV4XHSDESM7W"}</p>
        <p>Sponsor: {SPONSOR}</p>
        <p>
          USDC: {USDC_TESTNET_CLASSIC.code}:{USDC_TESTNET_CLASSIC.issuer}
        </p>
        <p>USDC: {USDC_TESTNET_SAC}</p>
      </section>

      <section className="space-y-3 text-sm text-[var(--muted)]">
        <h2 className="text-[var(--foreground)] font-bold">Apps en Lumina</h2>
        <p>
          MIRA y PuenteMAE cobran cuando el trabajo se hizo. El 97,5% llega a la app.
          El usuario final nunca paga.
        </p>
        <ul className="space-y-2">
          <li>
            <strong className="text-[var(--foreground)]">MIRA</strong> — cribado de desarrollo
            infantil. En trabajo.
          </li>
          <li>
            <strong className="text-[var(--foreground)]">PuenteMAE</strong> — ayuda social a
            docentes de inclusión. En trabajo.
          </li>
        </ul>
      </section>

      <div className="flex flex-wrap gap-4 text-sm">
        <Link href="/connect" className="text-teal-500 underline">
          Apps en Lumina
        </Link>
        <Link href="/developers" className="text-teal-500 underline">
          Cómo se cobra
        </Link>
        <Link href="/empresa" className="text-teal-500 underline">
          Empresas en Lumina
        </Link>
        <Link href="/presentation" className="text-teal-500 underline">
          Cómo funciona
        </Link>
      </div>
    </div>
  );
}

export default function JuryEvidencePage() {
  return (
    <Suspense fallback={<div className="p-16 text-sm text-[var(--muted)]">Cargando comprobantes…</div>}>
      <JuryBody />
    </Suspense>
  );
}
