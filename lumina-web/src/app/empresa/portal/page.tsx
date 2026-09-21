"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  FileCheck,
  Landmark,
  Loader2,
  Lock,
  Printer,
} from "lucide-react";
import { DEMO_PAYMENT, formatArs, formatUsd } from "@/lib/empresa/payment";
import type { Aporte, Certificado } from "@/lib/empresa/types";
import { IMPACT_APPS, getImpactApp } from "@/lib/impact-apps";
import { aggregateBySchema, quantityFromLock } from "@/lib/hito/fact";
import { useEmpresaSession } from "@/hooks/useEmpresaSession";
import { useToast } from "@/context/ToastContext";

const STATUS_LABEL: Record<Aporte["status"], string> = {
  orden: "Orden de transferencia",
  pendiente_psav: "Esperando PSAV",
  en_escrow: "En escrow",
  certificado: "Hito certificado",
};

export default function EmpresaPortalPage() {
  const router = useRouter();
  const { session, loading: sessionLoading, rail } = useEmpresaSession();
  const { toast } = useToast();
  const paidToast = useRef(false);
  const [aportes, setAportes] = useState<Aporte[]>([]);
  const [certificados, setCertificados] = useState<Certificado[]>([]);
  const [amountUsd, setAmountUsd] = useState("40");
  const [appId, setAppId] = useState(IMPACT_APPS[0]?.id ?? "mira");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [aportesRes, certsRes] = await Promise.all([
      fetch("/api/empresa/aportes"),
      fetch("/api/empresa/certificados"),
    ]);
    if (aportesRes.status === 401) {
      router.replace("/empresa");
      return;
    }
    const aportesData = await aportesRes.json();
    const certsData = await certsRes.json();
    setAportes(aportesData.aportes ?? []);
    setCertificados(certsData.certificados ?? []);
  }, [router]);

  useEffect(() => {
    if (sessionLoading) return;
    if (!session) {
      router.replace("/empresa");
      return;
    }
    void load();
  }, [session, sessionLoading, router, load]);

  useEffect(() => {
    if (paidToast.current || typeof window === "undefined") return;
    const paid = new URLSearchParams(window.location.search).get("paid");
    if (paid === "1") {
      paidToast.current = true;
      toast({
        type: "success",
        title: "Pago recibido por el cobrador",
        message: "Cuando el webhook acredite, el aporte pasa a escrow. Sin billetera.",
      });
    }
    if (paid === "0") {
      paidToast.current = true;
      toast({
        type: "error",
        title: "El cobrador no confirmó el pago",
        message: "Podés reintentar desde la orden. No se debitó el protocolo.",
      });
    }
  }, [toast]);

  const act = async (id: string, action: string) => {
    setBusy(`${id}:${action}`);
    setError(null);
    try {
      const response = await fetch(`/api/empresa/aportes/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo actualizar.");
      await load();
      if (action === "certificar" && data.certificado?.id) {
        toast({
          type: "success",
          title: "Certificado emitido",
          message: "Ya podés imprimirlo o compartirlo. Sin billetera.",
        });
        router.push(`/c/${data.certificado.id}`);
        return;
      }
      toast({
        type: "success",
        title:
          action === "confirmar"
            ? "Transferencia indicada"
            : "Aporte acreditado en escrow",
        message:
          action === "confirmar"
            ? "En producción el PSAV confirma el crédito. Acá lo simulamos."
            : "El protocolo depositaría on-chain. La empresa no firma.",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error.");
    } finally {
      setBusy(null);
    }
  };

  const onCreate = async (event: FormEvent) => {
    event.preventDefault();
    setBusy("create");
    setError(null);
    try {
      const response = await fetch("/api/empresa/aportes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountUsd: Number(amountUsd), appId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo crear la orden.");
      setActiveId(data.aporte.id);
      await load();
      if (data.aporte?.checkoutUrl) {
        window.location.href = data.aporte.checkoutUrl;
        return;
      }
      toast({
        type: "info",
        title: "Orden de pago lista",
        message: data.aporte?.providerError
          ? `Cobrador no live: ${data.aporte.providerError}`
          : "Pagás un servicio a Lumina. No comprás cripto. Cobro ARS: en trabajo.",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error.");
    } finally {
      setBusy(null);
    }
  };

  const active = aportes.find((item) => item.id === activeId) ?? aportes[0];
  const locked = aportes
    .filter((item) => item.status === "en_escrow" || item.status === "pendiente_psav")
    .reduce((sum, item) => sum + item.amountUsd, 0);
  const certified = certificados.reduce((sum, item) => sum + item.amountUsd, 0);
  const impactTotals = aggregateBySchema(certificados);
  const selectedApp = getImpactApp(appId);
  const previewQty = selectedApp
    ? quantityFromLock(Number(amountUsd) || 0, selectedApp.priceUsdc)
    : 0;

  if (sessionLoading || !session) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center text-sm text-[var(--muted)]">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Cargando portal…
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-10 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">
            Portal Empresa
          </span>
          <h1 className="font-serif text-3xl font-bold text-[var(--foreground)] mt-1">
            {session.company}
          </h1>
          <p className="text-sm text-[var(--muted)]">{session.email}</p>
        </div>
        <div className="flex flex-col items-start sm:items-end gap-2">
          <Link href="/empresa/impacto" className="text-xs font-bold text-teal-600 uppercase tracking-wider">
            Pack RSE →
          </Link>
          <p className="text-xs text-[var(--muted)] max-w-sm">
            Pagás un servicio de RSE, no comprás cripto. {rail?.label ?? "Simulación ABC"}.
            {rail?.live ? " Cobrador live." : " No transferir pesos reales."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "En proceso", value: formatUsd(locked), icon: Lock },
          { label: "Certificado (USD)", value: formatUsd(certified), icon: FileCheck },
          { label: "Fee del riel", value: "2.5%", icon: Landmark },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs text-[var(--muted)] uppercase tracking-wider">
              {stat.label}
              <stat.icon className="h-4 w-4 text-teal-600" />
            </div>
            <p className="font-mono text-2xl font-bold text-[var(--foreground)]">{stat.value}</p>
          </div>
        ))}
      </div>

      {impactTotals.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {impactTotals.map((row) => (
            <div key={row.schemaId} className="glass-card p-5 rounded-2xl space-y-1">
              <p className="text-xs text-[var(--muted)] uppercase tracking-wider">{row.appName}</p>
              <p className="font-serif text-3xl font-bold text-[var(--foreground)]">{row.quantity}</p>
              <p className="text-sm text-[var(--foreground)]">{row.unitLabel}</p>
              <p className="text-[11px] text-[var(--muted)]">{formatUsd(row.amountUsd)} lockeados</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <section className="lg:col-span-2 glass-card p-6 rounded-2xl space-y-4">
          <h2 className="font-serif text-lg font-bold text-[var(--foreground)]">Fondear RSE</h2>
          <form onSubmit={onCreate} className="space-y-4" id="form-empresa-aporte">
            <label className="block space-y-1">
              <span className="text-xs font-semibold text-[var(--muted)]">Monto en USD</span>
              <input
                id="empresa-amount"
                type="number"
                min={1}
                max={100000}
                step="0.01"
                required
                value={amountUsd}
                onChange={(event) => setAmountUsd(event.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm"
              />
              <span className="text-[11px] text-[var(--muted)]">
                Equivale a {formatArs(Number(amountUsd || 0) * DEMO_PAYMENT.usdToArs)} · {DEMO_PAYMENT.fxNote}
                {selectedApp
                  ? ` · ${previewQty} ${selectedApp.unitLabel} (US$ ${selectedApp.priceUsdc} / hito)`
                  : ""}
              </span>
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-semibold text-[var(--muted)]">App de impacto</span>
              <select
                id="empresa-app"
                value={appId}
                onChange={(event) => setAppId(event.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm"
              >
                {IMPACT_APPS.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.name} — {app.unitLabel}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              disabled={busy === "create"}
              id="btn-empresa-orden"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-500 py-3 text-sm font-bold text-white cursor-pointer disabled:opacity-50"
            >
              {busy === "create" ? "Generando orden…" : "Generar orden de transferencia"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </section>

        <section className="lg:col-span-3 glass-card p-6 rounded-2xl space-y-4" id="empresa-orden-pago">
          <h2 className="font-serif text-lg font-bold text-[var(--foreground)]">Orden de pago</h2>
          {!active ? (
            <p className="text-sm text-[var(--muted)]">
              Todavía no hay órdenes. Generá una a la izquierda. En producción el
              cobrador (Koywe PAYIN o Circle HQ) abre el checkout.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
                  {STATUS_LABEL[active.status]}
                </span>
                <span className="font-mono text-xs text-[var(--muted)]">{active.referencia}</span>
              </div>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-[10px] uppercase text-[var(--muted)] font-bold">Beneficiario</dt>
                  <dd className="text-[var(--foreground)]">
                    {active.paymentInstructions?.beneficiary ?? DEMO_PAYMENT.beneficiary}
                  </dd>
                  <dd className="text-[11px] text-[var(--muted)]">
                    {active.paymentInstructions?.license ?? DEMO_PAYMENT.license}
                  </dd>
                </div>
                {active.paymentInstructions?.kind === "circle-mint" ? (
                  <>
                    <div>
                      <dt className="text-[10px] uppercase text-[var(--muted)] font-bold">Banco</dt>
                      <dd>{active.paymentInstructions.bankName ?? "Circle Mint"}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] uppercase text-[var(--muted)] font-bold">Cuenta / SWIFT</dt>
                      <dd className="font-mono text-xs">
                        {active.paymentInstructions.accountNumber ?? "—"}
                        {active.paymentInstructions.swiftCode
                          ? ` · ${active.paymentInstructions.swiftCode}`
                          : ""}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[10px] uppercase text-[var(--muted)] font-bold">Tracking</dt>
                      <dd className="font-mono text-xs">
                        {active.paymentInstructions.trackingRef ?? active.referencia}
                      </dd>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <dt className="text-[10px] uppercase text-[var(--muted)] font-bold">Alias</dt>
                      <dd className="font-mono">
                        {active.paymentInstructions?.alias ?? DEMO_PAYMENT.alias}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[10px] uppercase text-[var(--muted)] font-bold">
                        {active.checkoutUrl ? "Checkout" : "CBU (demo)"}
                      </dt>
                      <dd className="font-mono text-xs">
                        {active.checkoutUrl
                          ? "Koywe PAYIN — no es un CBU de Lumina"
                          : (active.paymentInstructions?.cbu ?? DEMO_PAYMENT.cbu)}
                      </dd>
                    </div>
                  </>
                )}
                <div>
                  <dt className="text-[10px] uppercase text-[var(--muted)] font-bold">Importe</dt>
                  <dd>
                    {formatArs(active.amountArs)} · {formatUsd(active.amountUsd)}
                  </dd>
                </div>
              </dl>
              <p className="text-xs text-[var(--gold)] bg-[var(--gold-light)] rounded-lg px-3 py-2">
                {DEMO_PAYMENT.legalNote} Referencia <strong>{active.referencia}</strong>.
                {rail?.live ? "" : ` ${DEMO_PAYMENT.bankLabel}.`}
              </p>
              {active.providerError && (
                <p className="text-xs text-[var(--danger)]">{active.providerError}</p>
              )}
              {active.txHash && (
                <p className="text-[11px] font-mono text-[var(--muted)]">
                  Depósito tesorería: {active.txHash}
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                {active.checkoutUrl && active.status === "orden" && (
                  <a
                    id="btn-empresa-checkout"
                    href={active.checkoutUrl}
                    className="rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white inline-flex items-center"
                  >
                    Pagar el servicio (Koywe)
                  </a>
                )}
                {active.status === "orden" && (
                  <button
                    id="btn-empresa-confirmar"
                    onClick={() => void act(active.id, "confirmar")}
                    disabled={!!busy}
                    className="rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white cursor-pointer disabled:opacity-50"
                  >
                    Ya indiqué la transferencia
                  </button>
                )}
                {active.status === "pendiente_psav" && rail?.live && (
                  <p className="text-xs text-[var(--muted)] py-2">
                    Esperando webhook del cobrador. Tesorería Lumina deposita; la empresa no firma.
                  </p>
                )}
                {active.status === "pendiente_psav" && !rail?.live && (
                  <button
                    id="btn-empresa-acreditar"
                    onClick={() => void act(active.id, "acreditar")}
                    disabled={!!busy}
                    className="rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white cursor-pointer disabled:opacity-50"
                  >
                    Simular acreditación PSAV
                  </button>
                )}
                {active.status === "en_escrow" && (
                  <button
                    id="btn-empresa-certificar"
                    onClick={() => void act(active.id, "certificar")}
                    disabled={!!busy}
                    className="rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white cursor-pointer disabled:opacity-50"
                  >
                    Emitir certificado de hito
                  </button>
                )}
                {active.status === "certificado" && active.certificadoId && (
                  <Link
                    href={`/c/${active.certificadoId}`}
                    className="rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white inline-flex items-center gap-2"
                  >
                    Ver certificado
                    <Printer className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
              <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                Lock hasta{" "}
                {new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" }).format(
                  new Date(active.lockUntil),
                )}
                . App: {active.appName}.
              </p>
            </div>
          )}
        </section>
      </div>

      {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

      <section className="space-y-3">
        <h2 className="font-serif text-lg font-bold text-[var(--foreground)]">Aportes</h2>
        {aportes.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">Sin movimientos todavía.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-[var(--border)]">
            <table className="w-full text-sm">
              <thead className="text-left text-[10px] uppercase tracking-wider text-[var(--muted)] bg-[var(--muted-bg)]">
                <tr>
                  <th className="px-4 py-3">Referencia</th>
                  <th className="px-4 py-3">Monto</th>
                  <th className="px-4 py-3">App</th>
                  <th className="px-4 py-3">Estado</th>
                </tr>
              </thead>
              <tbody>
                {aportes.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t border-[var(--border)] cursor-pointer hover:bg-[var(--muted-bg)]"
                    onClick={() => setActiveId(item.id)}
                  >
                    <td className="px-4 py-3 font-mono text-xs">{item.referencia}</td>
                    <td className="px-4 py-3">{formatUsd(item.amountUsd)}</td>
                    <td className="px-4 py-3">{item.appName}</td>
                    <td className="px-4 py-3">{STATUS_LABEL[item.status]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg font-bold text-[var(--foreground)]">Certificados</h2>
        {certificados.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">
            Cuando la app certifica el hito, acá aparece el documento. El usuario de
            esa app ve el mismo PDF — nunca una wallet.
          </p>
        ) : (
          <ul className="space-y-2">
            {certificados.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/c/${item.id}`}
                  className="glass-card flex items-center justify-between gap-4 p-4 rounded-xl text-sm"
                >
                  <span>
                    <strong className="text-[var(--foreground)]">{item.appName}</strong>
                    <span className="text-[var(--muted)]">
                      {" "}
                      · {item.quantity ?? 0} {item.unitLabel ?? "hito"} · {formatUsd(item.amountUsd)}
                    </span>
                    <span className="block font-mono text-[11px] text-[var(--muted)] mt-1">
                      {item.reportHash.slice(0, 16)}…
                    </span>
                  </span>
                  <span className="text-teal-600 text-xs font-bold uppercase tracking-wider">
                    Abrir
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
