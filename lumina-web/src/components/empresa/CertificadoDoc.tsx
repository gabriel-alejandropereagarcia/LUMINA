"use client";

import { formatUsd } from "@/lib/empresa/payment";
import type { Certificado } from "@/lib/empresa/types";
import RecibosMovimiento from "@/components/empresa/RecibosMovimiento";
import type { ReciboPaso } from "@/lib/empresa/recibos";
import { txUrl } from "@/lib/explorer";

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(iso));
}

export default function CertificadoDoc({
  certificado,
  pasos,
}: {
  certificado: Certificado;
  pasos?: ReciboPaso[];
}) {
  const quantity = certificado.quantity ?? 0;
  const unitLabel = certificado.unitLabel || "trabajo";

  return (
    <article className="cert-sheet mx-auto w-full max-w-[800px] bg-[#FBF9F4] text-[#1A232E] shadow-2xl print:shadow-none">
      <div className="border-t-8 border-[#0D5E6A] px-8 py-10 sm:px-12 sm:py-14 space-y-8">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#0D5E6A]">
              Lumina
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight mt-1">
              Certificado de impacto
            </h1>
            <p className="text-sm text-[#5A6B7A] mt-2">
              Una luz en el camino: qué se hizo, cuánto se pagó, recibo
            </p>
          </div>
          <div className="h-16 w-16 rounded-full border-2 border-[#0D5E6A] flex items-center justify-center shrink-0">
            <span className="font-serif text-lg font-bold text-[#0D5E6A]">L</span>
          </div>
        </header>

        <section className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#0D5E6A]">1. Impacto</p>
          <p className="text-lg leading-relaxed">
            <strong>{certificado.company}</strong> financió{" "}
            <strong>
              {quantity} {unitLabel}
              {quantity === 1 ? "" : ""}
            </strong>{" "}
            a través de <strong>{certificado.appName}</strong>
            {certificado.period ? ` · período ${certificado.period}` : ""}.
          </p>
          {certificado.valueMethod ? (
            <p className="text-sm text-[#5A6B7A]">{certificado.valueMethod}</p>
          ) : null}
        </section>

        <section className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#0D5E6A]">2. Pago</p>
          <p className="text-sm leading-relaxed">
            {certificado.simulation ? (
              <>
                Reserva {formatUsd(certificado.amountUsd)}. El 97,5% (
                {formatUsd(certificado.payoutAppUsd)}) se paga a {certificado.appName}{" "}
                cuando confirma el trabajo. Este documento todavía no es un cobro.
              </>
            ) : (
              <>
                Reserva {formatUsd(certificado.amountUsd)}. El 97,5% (
                {formatUsd(certificado.payoutAppUsd)}) fue a {certificado.appName}. El 2,5% (
                {formatUsd(certificado.feeUsd)}) es de Lumina. Quien usó la app no pagó.
              </>
            )}
          </p>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="border border-[#0D5E6A]/15 rounded-xl p-4 bg-white/70">
              <dt className="text-[10px] uppercase tracking-wider text-[#5A6B7A] font-bold">
                Identificador
              </dt>
              <dd className="font-mono text-xs mt-1 break-all">{certificado.id}</dd>
            </div>
            <div className="border border-[#0D5E6A]/15 rounded-xl p-4 bg-white/70">
              <dt className="text-[10px] uppercase tracking-wider text-[#5A6B7A] font-bold">
                Emitido
              </dt>
              <dd className="mt-1">{formatDate(certificado.issuedAt)}</dd>
            </div>
            <div className="sm:col-span-2 border border-[#0D5E6A]/15 rounded-xl p-4 bg-white/70">
              <dt className="text-[10px] uppercase tracking-wider text-[#5A6B7A] font-bold">
                Código del trabajo (único, para que no se cobre dos veces)
              </dt>
              <dd className="font-mono text-[11px] mt-1 break-all leading-relaxed">
                {certificado.reportHash}
              </dd>
            </div>
            {certificado.canonical ? (
              <div className="sm:col-span-2 border border-[#0D5E6A]/15 rounded-xl p-4 bg-white/70">
                <dt className="text-[10px] uppercase tracking-wider text-[#5A6B7A] font-bold">
                  Detalle del trabajo
                </dt>
                <dd className="font-mono text-[10px] mt-1 break-all leading-relaxed text-[#5A6B7A]">
                  {certificado.canonical}
                </dd>
              </div>
            ) : null}
          </dl>
        </section>

        <section className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#0D5E6A]">3. Alcance</p>
          <p className="text-sm text-[#1A232E]">{certificado.scopeLumina || "Lumina registra el pago. El mismo trabajo no se cobra dos veces."}</p>
          <p className="text-sm text-[#5A6B7A]">{certificado.scopeApp}</p>
        </section>

        {certificado.simulation && (
          <p className="text-xs text-[#8A6A1A] bg-[#F7E7C0] border border-[#D4A84B]/40 rounded-lg px-3 py-2">
            Recorrido de prueba: el código identifica el trabajo (unidad + cantidad). El 97,5%
            todavía no se pagó. El pago de prueba está en Probar.
          </p>
        )}

        {pasos && pasos.length > 0 ? (
          <section className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#0D5E6A]">Recibos</p>
            <RecibosMovimiento pasos={pasos} />
          </section>
        ) : certificado.txHash ? (
          <p className="text-xs text-[#5A6B7A]">
            <a href={txUrl(certificado.txHash)} className="underline" target="_blank" rel="noreferrer">
              La app cobró el 97,5%
            </a>
          </p>
        ) : null}

        <footer className="border-t border-[#0D5E6A]/15 pt-4 space-y-1">
          <p className="text-[11px] text-[#5A6B7A] leading-relaxed">
            El recibo público cubre el trabajo y el pago. Datos personales quedan fuera (Ley 25.326).
          </p>
          <p className="text-[11px] text-[#5A6B7A]">
            Si no hay trabajo en 12 meses, la empresa recupera el aporte por el mismo camino.
            El recibo se abre en Recibos Lumina.
          </p>
        </footer>
      </div>
    </article>
  );
}
