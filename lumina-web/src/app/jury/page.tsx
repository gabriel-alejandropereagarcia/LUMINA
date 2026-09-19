"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { USDC_TESTNET_CLASSIC, USDC_TESTNET_SAC, USDT0_OFFICIAL } from "@/lib/official-assets";
import { txUrl } from "@/lib/explorer";

const ESCROW = process.env.NEXT_PUBLIC_LUMINA_CONTRACT_ID || "CBZAI24XP2RXDVXLRJNVGVGZ5QRDMNI54GTPBTN4OOLFTSFJRWQ4M3EJ";
const SPONSOR = process.env.NEXT_PUBLIC_SPONSOR_ADDRESS || "GBRR6QWYT5UIHATCC7SYJITERMDWKLE5HHJCNM5PP6GK2DRB4YPKSP5E";
const USDT0_TX = process.env.NEXT_PUBLIC_USDT0_PROOF_TX || "";
const RELEASE_TX = process.env.NEXT_PUBLIC_LAST_RELEASE_TX || "";
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
  const stored = readStored();
  const [release, setRelease] = useState(
    params.get("release") || RELEASE_TX || stored.release,
  );
  const [reportHash, setReportHash] = useState(params.get("hash") || stored.hash);
  const [usdt0, setUsdt0] = useState(params.get("usdt0") || USDT0_TX || stored.usdt0);

  useEffect(() => {
    const fromQuery: Proof = {
      release: params.get("release") || RELEASE_TX || stored.release,
      hash: params.get("hash") || stored.hash,
      usdt0: params.get("usdt0") || USDT0_TX || stored.usdt0,
    };
    setRelease(fromQuery.release);
    setReportHash(fromQuery.hash);
    setUsdt0(fromQuery.usdt0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          Argentina Builder Challenge · Scale · Demo Day 26/9
        </span>
        <h1 className="font-serif text-4xl font-bold text-[var(--foreground)]">
          Lo que el jurado tiene que ver
        </h1>
        <p className="text-sm text-[var(--muted)] leading-relaxed">
          Tres minutos: empresa sin cripto, release USDC en testnet, USDT0 oficial en mainnet.
          Una tesis. Hashes reales.
        </p>
      </div>

      <section className="space-y-2 text-sm text-[var(--muted)]">
        <h2 className="text-[var(--foreground)] font-bold">El camino de 3 minutos</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            <Link href="/empresa" className="text-teal-500 underline">
              /empresa
            </Link>{" "}
            — factura RSE, panel de unidades (10 niño-mes), PDF de tres bloques. Sin Freighter.
          </li>
          <li>
            <Link href="/invest" className="text-teal-500 underline">
              /invest
            </Link>{" "}
            — Freighter testnet, 40 USDC Circle, asignar MIRA. Solo el juez firma acá.
          </li>
          <li>
            Certify: <code className="font-mono">npx tsx examples/certify.ts</code> con{" "}
            <code className="font-mono">LUMINA_SPONSOR</code> = la G que depositó. 97.5% a la app.
          </li>
        </ol>
      </section>

      <section className="space-y-3 text-sm">
        <h2 className="text-[var(--foreground)] font-bold">Pegar hashes (sin rebuild)</h2>
        <p className="text-xs text-[var(--muted)]">
          Tras faucet + certify, o tras comprar USDT0, pegá acá. Queda en la URL y en esta pestaña.
        </p>
        <form onSubmit={applyProof} className="space-y-2">
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-[var(--muted)]">Release tx (testnet)</span>
            <input
              value={release}
              onChange={(e) => setRelease(e.target.value)}
              placeholder="hash de release_impact"
              className="w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2 font-mono text-xs"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-[var(--muted)]">reportHash (64 hex)</span>
            <input
              value={reportHash}
              onChange={(e) => setReportHash(e.target.value)}
              placeholder="sha256 del fact"
              className="w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2 font-mono text-xs"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-[var(--muted)]">USDT0 tx (mainnet)</span>
            <input
              value={usdt0}
              onChange={(e) => setUsdt0(e.target.value)}
              placeholder="hash stellar.expert public"
              className="w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2 font-mono text-xs"
            />
          </label>
          <button
            type="submit"
            className="rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white"
          >
            Mostrar en esta página
          </button>
        </form>
      </section>

      <section className="space-y-2 text-sm">
        <h2 className="text-[var(--foreground)] font-bold">Prueba USDC (testnet)</h2>
        {releaseShown ? (
          <p className="text-xs font-mono break-all">
            Release:{" "}
            <a href={txUrl(releaseShown)} className="text-teal-500 underline" target="_blank" rel="noreferrer">
              {releaseShown}
            </a>
          </p>
        ) : (
          <p className="text-sm text-[var(--muted)]">
            Todavía no hay release. Faucet Circle (2×20 USDC, 2 h) a{" "}
            <code className="font-mono break-all">{SPONSOR}</code>. Después:{" "}
            <code className="font-mono">powershell -File scripts/e2e-usdc.ps1</code>.
          </p>
        )}
        {hashShown ? (
          <p className="text-xs font-mono break-all text-[var(--muted)]">reportHash: {hashShown}</p>
        ) : null}
      </section>

      <section className="space-y-2 text-sm">
        <h2 className="text-[var(--foreground)] font-bold">Prueba USDT0 (mainnet oficial)</h2>
        <p className="text-sm text-[var(--muted)]">
          No hay USDT0 de testnet. SAC {USDT0_OFFICIAL.sac.slice(0, 8)}… · 7 decimales · clawback.
          Transfer UI:{" "}
          <a href={USDT0_OFFICIAL.transferUi} className="text-teal-500 underline" target="_blank" rel="noreferrer">
            usdt0.to/transfer
          </a>
          .
        </p>
        {usdt0Shown ? (
          <p className="text-xs font-mono break-all">
            Tx mainnet:{" "}
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
          <p className="text-sm text-amber-700">
            Pendiente: 1 unidad USDT0 oficial y el hash pegado arriba. No se finge.
          </p>
        )}
      </section>

      <section className="space-y-2 text-sm text-[var(--muted)]">
        <h2 className="text-[var(--foreground)] font-bold">Forms ABC + Apex</h2>
        <p>
          Cheat sheet campo a campo (form live Scale) en ABC-SCALE-NOTES §3.
          Cierra ABC el 21/9. Falta PII del lead y del compañero para enviar.
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <a
              href="https://argentinabuilderchallenge.netlify.app/aplicar"
              className="text-teal-500 underline"
              target="_blank"
              rel="noreferrer"
            >
              ABC aplicar
            </a>
            {" "}— este cuenta. Track Scale. Equipo Lumina, 2 personas, hub Salta, BAF.
          </li>
          <li>
            <a
              href="https://stellarapex.nearx.com.br/"
              className="text-teal-500 underline"
              target="_blank"
              rel="noreferrer"
            >
              Stellar Apex
            </a>
            {" "}— cuenta + equipo. Instaward “coming soon”.
          </li>
        </ul>
      </section>

      <section className="space-y-2 text-xs font-mono text-[var(--muted)] break-all">
        <h2 className="font-sans text-sm font-bold text-[var(--foreground)]">Addresses</h2>
        <p>Escrow testnet: {ESCROW}</p>
        <p>Admin: {process.env.NEXT_PUBLIC_ADMIN_ADDRESS || "GBKDKKKCMCB5CQG25R37F7VIHGO62557HZQUU4CZWTOTUK6HKLMNUDMK"}</p>
        <p>Oracle (firma certify): {process.env.NEXT_PUBLIC_ORACLE_ADDRESS || "GBJJCKJBEF2ILRD5LGWXGH5BQIKZ6EYFDS3RHQZQ5KBCOV4XHSDESM7W"}</p>
        <p>Sponsor demo: {SPONSOR}</p>
        <p>USDC classic: {USDC_TESTNET_CLASSIC.code}:{USDC_TESTNET_CLASSIC.issuer}</p>
        <p>USDC SAC: {USDC_TESTNET_SAC}</p>
        <p>
          USDT0: {USDT0_OFFICIAL.code}:{USDT0_OFFICIAL.issuer}
        </p>
      </section>

      <section className="space-y-2 text-sm text-[var(--muted)]">
        <h2 className="text-[var(--foreground)] font-bold">Apps de ejemplo</h2>
        <p>
          MIRA: cribado M-CHAT-R/F, WIP, no firma Stellar. PuenteMAE: ayuda social a docentes de
          inclusión, no obra social, no facturación a OS. El jurado certifica con el script, no con
          la UX clínica.
        </p>
        <p>
          Panel de unidades:{" "}
          <Link href="/empresa/portal" className="text-teal-500 underline">
            /empresa/portal
          </Link>{" "}
          y pack{" "}
          <Link href="/empresa/impacto" className="text-teal-500 underline">
            /empresa/impacto
          </Link>
          .
        </p>
      </section>

      <div className="flex flex-wrap gap-4 text-sm">
        <Link href="/connect" className="text-teal-500 underline">
          Connect
        </Link>
        <Link href="/developers" className="text-teal-500 underline">
          Developers
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
