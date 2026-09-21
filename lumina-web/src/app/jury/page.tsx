"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { USDC_TESTNET_CLASSIC, USDC_TESTNET_SAC, USDT0_OFFICIAL } from "@/lib/official-assets";
import { txUrl } from "@/lib/explorer";

const ESCROW = process.env.NEXT_PUBLIC_LUMINA_CONTRACT_ID || "CBZAI24XP2RXDVXLRJNVGVGZ5QRDMNI54GTPBTN4OOLFTSFJRWQ4M3EJ";
const SPONSOR = process.env.NEXT_PUBLIC_SPONSOR_ADDRESS || "GBRR6QWYT5UIHATCC7SYJITERMDWKLE5HHJCNM5PP6GK2DRB4YPKSP5E";
const USDT0_TX = process.env.NEXT_PUBLIC_USDT0_PROOF_TX || "";

/** Evidencia E2E 19/9 — no es un default mágico del formulario. */
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
          Argentina Builder Challenge · Scale
        </span>
        <h1 className="font-serif text-4xl font-bold text-[var(--foreground)]">
          Evidencia on-chain
        </h1>
        <p className="text-sm text-[var(--muted)] leading-relaxed">
          Impacto sin fricción. Factura, no cripto. Si el hecho ocurrió, 97,5% en Stellar.
          Si no, el capital vuelve. El usuario final nunca paga. Abajo, el loop del 19/9
          y cómo recorrerlo.{" "}
          <Link href="/presentation" className="text-teal-500 underline">
            Tesis en 8 slides
          </Link>
          .
        </p>
      </div>

      <section className="space-y-3 rounded-2xl border border-[var(--border)] p-5">
        <h2 className="text-[var(--foreground)] font-bold">E2E 19/9 · 40 USDC testnet</h2>
        <p className="text-xs text-[var(--muted)]">
          Deposit → assign MIRA → certify. Explorer abre la tx, no un PDF.
        </p>
        <ul className="space-y-2 text-xs font-mono break-all">
          <li>
            Deposit:{" "}
            <a href={txUrl(EVIDENCE.deposit)} className="text-teal-500 underline" target="_blank" rel="noreferrer">
              {EVIDENCE.deposit}
            </a>
          </li>
          <li>
            Assign:{" "}
            <a href={txUrl(EVIDENCE.assign)} className="text-teal-500 underline" target="_blank" rel="noreferrer">
              {EVIDENCE.assign}
            </a>
          </li>
          <li>
            Release (97,5% a la app):{" "}
            <a href={txUrl(EVIDENCE.release)} className="text-teal-500 underline" target="_blank" rel="noreferrer">
              {EVIDENCE.release}
            </a>
          </li>
          <li className="text-[var(--muted)]">reportHash: {EVIDENCE.reportHash}</li>
        </ul>
      </section>

      <section className="space-y-2 text-sm text-[var(--muted)]">
        <h2 className="text-[var(--foreground)] font-bold">Cómo recorrerlo</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            <Link href="/empresa" className="text-teal-500 underline">
              /empresa
            </Link>{" "}
            — factura sin Freighter. El cobro en pesos está simulado y rotulado. El PDF no
            afirma payout hasta que haya release.
          </li>
          <li>
            <Link href="/invest" className="text-teal-500 underline">
              /invest
            </Link>{" "}
            — Freighter + USDC testnet: deposit y assign. Después, el botón Certificar hito
            (si este deploy tiene el oracle) o esta página con las txs de arriba.
          </li>
          <li>
            Contrato:{" "}
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
        <h2 className="text-[var(--foreground)] font-bold">Otra tx (opcional)</h2>
        <p className="text-xs text-[var(--muted)]">
          Si corriste un release nuevo, pegalo acá. No reemplaza la evidencia del 19/9.
        </p>
        <form onSubmit={applyProof} className="space-y-2">
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-[var(--muted)]">Release tx</span>
            <input
              value={release}
              onChange={(e) => setRelease(e.target.value)}
              placeholder="hash de release_impact"
              className="w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2 font-mono text-xs"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-[var(--muted)]">reportHash</span>
            <input
              value={reportHash}
              onChange={(e) => setReportHash(e.target.value)}
              placeholder="sha256 del fact"
              className="w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2 font-mono text-xs"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-[var(--muted)]">USDT0 tx mainnet</span>
            <input
              value={usdt0}
              onChange={(e) => setUsdt0(e.target.value)}
              placeholder="vacío = todavía no hay prueba oficial"
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
        <h2 className="text-[var(--foreground)] font-bold">USDT0 oficial (mainnet)</h2>
        <p className="text-sm text-[var(--muted)]">
          No existe USDT0 de testnet. No se fabrica. Transfer:{" "}
          <a href={USDT0_OFFICIAL.transferUi} className="text-teal-500 underline" target="_blank" rel="noreferrer">
            usdt0.to/transfer
          </a>
          .
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
        ) : (
          <p className="text-sm text-amber-700">Pendiente: 1 unidad oficial y su hash. El demo ABC es USDC testnet.</p>
        )}
      </section>

      <section className="space-y-2 text-xs font-mono text-[var(--muted)] break-all">
        <h2 className="font-sans text-sm font-bold text-[var(--foreground)]">Addresses</h2>
        <p>Escrow: {ESCROW}</p>
        <p>Admin: {process.env.NEXT_PUBLIC_ADMIN_ADDRESS || "GBKDKKKCMCB5CQG25R37F7VIHGO62557HZQUU4CZWTOTUK6HKLMNUDMK"}</p>
        <p>Oracle: {process.env.NEXT_PUBLIC_ORACLE_ADDRESS || "GBJJCKJBEF2ILRD5LGWXGH5BQIKZ6EYFDS3RHQZQ5KBCOV4XHSDESM7W"}</p>
        <p>Sponsor: {SPONSOR}</p>
        <p>
          USDC: {USDC_TESTNET_CLASSIC.code}:{USDC_TESTNET_CLASSIC.issuer}
        </p>
        <p>SAC: {USDC_TESTNET_SAC}</p>
      </section>

      <section className="space-y-2 text-sm text-[var(--muted)]">
        <h2 className="text-[var(--foreground)] font-bold">Apps de ejemplo</h2>
        <p>
          MIRA y PuenteMAE están listadas en Connect. No viven en este repo. El jurado no
          abre una UX clínica: certifica el riel.
        </p>
      </section>

      <div className="flex flex-wrap gap-4 text-sm">
        <Link href="/connect" className="text-teal-500 underline">
          Connect
        </Link>
        <Link href="/invest" className="text-teal-500 underline">
          Depositar
        </Link>
        <Link href="/presentation" className="text-teal-500 underline">
          Deck
        </Link>
      </div>
    </div>
  );
}

export default function JuryEvidencePage() {
  return (
    <Suspense fallback={<div className="p-16 text-sm text-[var(--muted)]">Cargando evidencia…</div>}>
      <JuryBody />
    </Suspense>
  );
}
