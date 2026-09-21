"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Plug, FileCode, ShieldCheck, ArrowRight, ClipboardCheck } from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import { buildAddOracleTx, submitSorobanTransaction } from "@/lib/stellar";
import { signStellarTransaction } from "@/lib/integrations/wallets-kit";
import { IMPACT_APPS } from "@/lib/impact-apps";

const ADMIN_ADDRESS = process.env.NEXT_PUBLIC_ADMIN_ADDRESS || "";

type ListingRow = {
  id: string;
  name: string;
  schemaId: string;
  unitLabel: string;
  status: string;
};

export default function ConnectPage() {
  const { address, isConnected, connect } = useWallet();
  const isAdmin = Boolean(isConnected && address && ADMIN_ADDRESS && address === ADMIN_ADDRESS);

  const [name, setName] = useState("");
  const [oracle, setOracle] = useState("");
  const [payout, setPayout] = useState("");
  const [price, setPrice] = useState("40");
  const [schemaId, setSchemaId] = useState("");
  const [unitLabel, setUnitLabel] = useState("");
  const [valueMethod, setValueMethod] = useState("");
  const [milestone, setMilestone] = useState("");
  const [hashExcludes, setHashExcludes] = useState("DNI, CUD, diagnóstico, escuela");
  const [postRelease, setPostRelease] = useState("Pago en pesos al beneficiario. Lumina no lo ejecuta.");
  const [acceptedToS, setAcceptedToS] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [altas, setAltas] = useState<ListingRow[]>([]);

  useEffect(() => {
    fetch("/api/connect/listing")
      .then((response) => response.json())
      .then((data) => setAltas(data.altas ?? []))
      .catch(() => undefined);
  }, []);

  const handleListing = async (event: FormEvent) => {
    event.preventDefault();
    if (!acceptedToS) {
      setStatus("Tenés que aceptar los términos.");
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const response = await fetch("/api/connect/listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          oracle,
          payout,
          lockPriceUsd: Number(price),
          schemaId,
          unitLabel,
          valueMethod,
          milestone,
          hashExcludes,
          postReleasePromise: postRelease,
          acceptedToS,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo enviar el alta.");
      setStatus(
        `Pedido ${data.listing.id} recibido. Lumina revisa la ficha y después publica la app.`,
      );
      setAltas((current) => [data.listing, ...current]);
    } catch (err: unknown) {
      setStatus(err instanceof Error ? err.message : "No se pudo enviar el alta.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    if (!oracle.startsWith("G") || oracle.length < 56) {
      setStatus("La cuenta que firma tiene que empezar con G y ser válida.");
      return;
    }
    if (!isAdmin || !address) {
      setStatus("Lumina publica la app. Si no sos admin, pedí el alta con el formulario de arriba.");
      return;
    }

    setLoading(true);
    setStatus("Publicando la app…");
    try {
      const xdr = await buildAddOracleTx(address, oracle, Number(price), payout || oracle);
      const signed = await signStellarTransaction(xdr, address);
      if (!signed) throw new Error("Firma rechazada.");
      const hash = await submitSorobanTransaction(signed);
      setStatus(`${name || "App"} publicada. Recibo ${hash}`);
    } catch (err: unknown) {
      setStatus(err instanceof Error ? err.message : "No se pudo registrar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-16 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-10">
      <div className="space-y-3">
        <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">
          Para apps
        </span>
        <h1 className="font-serif text-4xl font-bold tracking-tight text-[var(--foreground)]">
          Sumá tu app
        </h1>
        <p className="text-sm text-[var(--muted)] leading-relaxed">
          Completá una ficha. No hace falta cuenta cripto para pedir el alta. Lumina revisa
          qué cobrás y a quién. Cuando el trabajo se hizo, cobrás el 97,5%. El panel de la
          empresa suma esas unidades — no el marketing.
        </p>
        <a
          href="#registro"
          className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white hover:bg-teal-500"
        >
          Completar la ficha
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>

      <section className="rounded-2xl border border-[var(--border)] p-5 space-y-3 text-sm">
        <h2 className="font-serif text-lg font-bold flex items-center gap-2">
          <ClipboardCheck className="h-4 w-4 text-teal-600" />
          Qué revisamos
        </h2>
        <ol className="list-decimal pl-5 space-y-1 text-[var(--muted)]">
          <li>Personería o titular nombrado.</li>
          <li>La cuenta que cobra el 97,5% es tuya.</li>
          <li>Unidad clara: niño-mes, cribado, horas. Eso es lo que suma el panel.</li>
          <li>Cómo se calcula el valor. El precio, aparte.</li>
          <li>Qué datos nunca viajan (DNI, clínica, menores). Quien usa la app no paga.</li>
          <li>Una prueba de cobro en el entorno de prueba.</li>
        </ol>
        <p className="text-xs text-[var(--muted)]">
          No visitamos el aula. No seguimos la cuenta del docente. Si rompés el esquema, se
          pausa el alta. No digas “certificado por Lumina” como impacto: el trabajo lo
          confirmás vos.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg font-bold">Apps ya en el camino</h2>
        <ul className="space-y-2 text-sm">
          {IMPACT_APPS.map((app) => (
            <li key={app.id} className="rounded-xl border border-[var(--border)] p-4">
              <p className="font-semibold">{app.name}</p>
              <p className="text-[var(--muted)]">
                {app.unitLabel} · US$ {app.priceUsdc} c/u
              </p>
              <p className="text-xs text-[var(--muted)] mt-1">{app.valueMethod}</p>
            </li>
          ))}
        </ul>
      </section>

      <form id="registro" onSubmit={handleListing} className="rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-6 space-y-4 text-sm scroll-mt-24">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-teal-600">
            Paso 1 · Pedí el alta
          </p>
          <p className="text-xs text-[var(--muted)]">
            Completá la ficha. Queda en revisión. No hace falta ser admin.
          </p>
        </div>
        <label className="block space-y-1">
          <span className="text-xs font-semibold text-[var(--muted)]">Nombre de la app</span>
          <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2" />
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-semibold text-[var(--muted)]">
            Identificador del trabajo (no se cambia después)
          </span>
          <input required value={schemaId} onChange={(e) => setSchemaId(e.target.value)} placeholder="miapp.nino-mes.v1" className="w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2 font-mono text-xs" />
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-semibold text-[var(--muted)]">Unidad que suma el panel de la empresa</span>
          <input required value={unitLabel} onChange={(e) => setUnitLabel(e.target.value)} placeholder="niño-mes de apoyo a la inclusión" className="w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2" />
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-semibold text-[var(--muted)]">Método de valor</span>
          <textarea required value={valueMethod} onChange={(e) => setValueMethod(e.target.value)} rows={2} className="w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2" />
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-semibold text-[var(--muted)]">Frase corta del trabajo</span>
          <input value={milestone} onChange={(e) => setMilestone(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2" />
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-semibold text-[var(--muted)]">Datos que nunca viajan</span>
          <input value={hashExcludes} onChange={(e) => setHashExcludes(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2" />
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-semibold text-[var(--muted)]">Después del cobro (promesa tuya, no de Lumina)</span>
          <input value={postRelease} onChange={(e) => setPostRelease(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2" />
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-semibold text-[var(--muted)]">Cuenta que confirma el trabajo (G…)</span>
          <input required value={oracle} onChange={(e) => setOracle(e.target.value.trim())} className="w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2 font-mono text-xs" />
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-semibold text-[var(--muted)]">Cuenta que cobra el 97,5% (G…)</span>
          <input value={payout} onChange={(e) => setPayout(e.target.value.trim())} className="w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2 font-mono text-xs" />
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-semibold text-[var(--muted)]">Precio por trabajo (USDC)</span>
          <input required type="number" min="0.0000001" step="any" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2 font-mono" />
        </label>
        <label className="flex items-start gap-3 text-xs text-[var(--muted)] leading-relaxed">
          <input
            type="checkbox"
            required
            checked={acceptedToS}
            onChange={(e) => setAcceptedToS(e.target.checked)}
            className="mt-0.5"
          />
          <span>
            Acepto: Lumina audita la ficha, no el aula. No digo “certificado por Lumina” como impacto.
            El 97,5% es mío. Quien usa la app no paga. No meto datos de menores en el recibo público.
            Si rompo el esquema, el alta se pausa.
          </span>
        </label>
        <button type="submit" disabled={loading || !acceptedToS} className="w-full rounded-xl border border-teal-600 py-3 text-xs font-bold text-teal-700 disabled:opacity-50">
          {loading ? "Enviando…" : "Enviar ficha"}
        </button>
      </form>

      <form onSubmit={handleRegister} className="rounded-2xl border border-[var(--border)] p-6 space-y-3 text-sm">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
            Paso 2 · Solo el admin de Lumina
          </p>
          <p className="text-xs text-[var(--muted)]">
            Si acabás de enviar la ficha, no tenés que tocar esto. Acá Lumina publica la app
            después de revisar.
          </p>
        </div>
        {!isConnected ? (
          <button type="button" onClick={connect} className="w-full rounded-xl border border-[var(--border)] py-3 text-xs font-bold">
            Conectar
          </button>
        ) : null}
        <button type="submit" disabled={loading} className="w-full rounded-xl bg-teal-600 py-3 text-xs font-bold text-white disabled:opacity-50">
          {loading ? "Firmando…" : isAdmin ? "Publicar la app" : "Solo el admin de Lumina"}
        </button>
      </form>

      {status ? <p className="text-xs text-[var(--muted)] break-all">{status}</p> : null}

      {altas.length > 0 ? (
        <ul className="text-xs space-y-1 text-[var(--muted)]">
          {altas.map((item) => (
            <li key={item.id}>
              {item.name} · {item.schemaId} · {item.status}
            </li>
          ))}
        </ul>
      ) : null}

      <ol className="space-y-4 text-sm text-[var(--muted)]">
        <li className="flex gap-3">
          <Plug className="h-5 w-5 text-teal-500 shrink-0" />
          <span>
            <strong className="text-[var(--foreground)]">Ficha.</strong> Unidad + valor + prohibidos.
            Sin eso el panel de la empresa no puede decir “10 niños”.
          </span>
        </li>
        <li className="flex gap-3">
          <FileCode className="h-5 w-5 text-teal-500 shrink-0" />
          <span>
            <strong className="text-[var(--foreground)]">Confirmá.</strong> Un aviso cuando el
            trabajo se hizo (unidad y cantidad). El mismo hecho no se cobra dos veces.
          </span>
        </li>
        <li className="flex gap-3">
          <ShieldCheck className="h-5 w-5 text-teal-500 shrink-0" />
          <span>
            <strong className="text-[var(--foreground)]">Pago.</strong> 97,5% a la app. Lumina no
            sigue la cuenta del docente.
          </span>
        </li>
      </ol>

      <Link
        href="/developers"
        className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white hover:bg-teal-500"
      >
        Cómo se cobra
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
