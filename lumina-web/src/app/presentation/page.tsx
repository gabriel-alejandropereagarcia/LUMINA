"use client";

import { useState } from "react";
import { 
  BookOpen, ShieldCheck, Cpu, Milestone, Lock, Coins, 
  ArrowRight, Users, Activity, HelpCircle, FileText, CheckCircle
} from "lucide-react";

export default function WhitepaperAndRoadmap() {
  const [activeSection, setActiveSection] = useState<string>("intro");

  const sections = [
    { id: "intro", title: "1. El problema", icon: BookOpen },
    { id: "contract", title: "2. Escrow y time-lock", icon: Lock },
    { id: "security", title: "3. Hash y firma de la app", icon: ShieldCheck },
    { id: "economics", title: "4. Fee 2,5% al release", icon: Coins },
    { id: "roadmap", title: "5. Próximamente", icon: Milestone },
    { id: "scale", title: "6. Recorrido", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-teal-500 uppercase tracking-widest block mb-2">
            Impacto sin fricción
          </span>
          <h1 className="text-4xl font-serif font-bold tracking-tight bg-gradient-to-r from-teal-400 to-green-400 bg-clip-text text-transparent sm:text-5xl">
            Lumina
          </h1>
          <p className="mt-4 text-sm text-[var(--muted)] max-w-2xl mx-auto">
            Impacto sin fricción. La empresa paga una factura — sin wallets, sin cripto.
            Si el hecho ocurrió, el 97,5% se cobra en Stellar. El usuario final nunca paga.
          </p>
        </div>

        {/* Layout de dos columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Columna Izquierda: Navegación de Secciones */}
          <div className="lg:col-span-1 space-y-2 sticky top-24">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] block pl-3 mb-4">
              Secciones
            </span>
            {sections.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  id={`btn-nav-${sec.id}`}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                    isActive 
                      ? "bg-teal-600/10 text-teal-400 border border-teal-500/20 shadow-sm" 
                      : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--muted-bg)]"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {sec.title}
                </button>
              );
            })}
          </div>

          {/* Columna Derecha: Contenido Dinámico */}
          <div className="lg:col-span-3 glass-card p-6 sm:p-10 rounded-2xl border border-[var(--border)] shadow-xl space-y-6">
            
            {activeSection === "intro" && (
              <div className="space-y-6 animate-fadeIn">
                <h2 className="text-2xl font-serif font-bold text-[var(--foreground)] flex items-center gap-2 border-b border-[var(--border)] pb-3">
                  <BookOpen className="h-6 w-6 text-teal-400" />
                  1. El problema
                </h2>
                <p className="text-sm leading-relaxed text-[var(--muted)]">
                  Hoy, una empresa quiere financiar salud, educación o asistencia.
                  Una familia lo necesita, pero el capital se pierde en informes, meses
                  de espera y burocracia.
                </p>
                <div className="rounded-xl border border-teal-500/10 bg-teal-500/5 p-4 space-y-2">
                  <h4 className="text-xs font-bold text-teal-400">Lumina lo resuelve</h4>
                  <p className="text-xs leading-relaxed text-[var(--muted)]">
                    Factura simple — sin wallets, sin cripto. La app certifica el hecho:
                    una unidad, una cantidad. Si ocurrió, 97,5% en Stellar. Si no, el
                    capital vuelve. El usuario final nunca paga.
                  </p>
                </div>
                <p className="text-sm leading-relaxed text-[var(--muted)]">
                  El capital de impacto necesita trazabilidad y velocidad. Lumina convierte
                  burocracia en ejecución inmediata. Nacimos en Salta. Visión: escalar desde
                  Argentina al mundo.
                </p>
              </div>
            )}

            {activeSection === "contract" && (
              <div className="space-y-6 animate-fadeIn">
                <h2 className="text-2xl font-serif font-bold text-[var(--foreground)] flex items-center gap-2 border-b border-[var(--border)] pb-3">
                  <Lock className="h-6 w-6 text-teal-400" />
                  2. Escrow y time-lock de 12 meses
                </h2>
                <p className="text-sm leading-relaxed text-[var(--muted)]">
                  El núcleo es un contrato Soroban. La empresa paga un servicio RSE (factura, no cripto).
                  Tesorería Lumina lockea USDC Circle en el demo, o USDT0 oficial en mainnet cuando hay
                  unidad real. Solo la app asignada libera. Sin hito en 12 meses, la empresa recupera.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--background)]">
                    <h4 className="text-xs font-bold text-[var(--foreground)] flex items-center gap-2 mb-2">
                      <Lock className="h-4 w-4 text-amber-500" />
                      Garantía Time-Lock de 12 Meses
                    </h4>
                    <p className="text-[11px] leading-relaxed text-[var(--muted)]">
                      Si un oráculo no certifica el hito dentro de los 12 meses, los fondos se desbloquean y la empresa los recupera. Lumina cobra 0% en ese withdraw.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--background)]">
                    <h4 className="text-xs font-bold text-[var(--foreground)] flex items-center gap-2 mb-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      Deduplicación Anti-Replay
                    </h4>
                    <p className="text-[11px] leading-relaxed text-[var(--muted)]">
                      Cada hito certificado genera un hash SHA-256 único del reporte de impacto. El contrato almacena de forma persistente estos hashes; si se intenta enviar el mismo hash de reporte dos veces, la transacción es inmediatamente rechazada por el ledger.
                    </p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-[var(--muted)]">
                  Adicionalmente, el registro de oráculos autorizados permite revocar de inmediato las credenciales de cualquier aplicación que emita firmas inválidas o maliciosas, conteniendo el riesgo financiero.
                </p>
              </div>
            )}

            {activeSection === "security" && (
              <div className="space-y-6 animate-fadeIn">
                <h2 className="text-2xl font-serif font-bold text-[var(--foreground)] flex items-center gap-2 border-b border-[var(--border)] pb-3">
                  <ShieldCheck className="h-6 w-6 text-teal-400" />
                  3. Hash y firma de la app
                </h2>
                <p className="text-sm leading-relaxed text-[var(--muted)]">
                  La app firma <code className="font-mono">release_impact</code> en Soroban con su key.
                  El hito es un SHA-256. Sin DNI ni clínica. El contrato exige que esa app
                  esté asignada al pozo de la empresa.
                </p>
                <div className="p-4 rounded-xl bg-slate-950 font-mono text-[11px] text-teal-400 space-y-2 border border-slate-800">
                  <p className="text-slate-500">// Split on-chain</p>
                  <p>protocol_fee = amount * 25 / 1000  // 2.5% → tesorería del protocolo</p>
                  <p>app_amount   = amount - protocol_fee // 97.5% → OracleConfig.payout</p>
                </div>
                <ul className="list-disc pl-5 space-y-2 text-xs text-[var(--muted)]">
                  <li><strong>Assign obligatorio:</strong> otra app registrada no puede vaciar el pozo.</li>
                  <li><strong>Hash único:</strong> el mismo reporte no se cobra dos veces.</li>
                </ul>
              </div>
            )}

            {activeSection === "economics" && (
              <div className="space-y-6 animate-fadeIn">
                <h2 className="text-2xl font-serif font-bold text-[var(--foreground)] flex items-center gap-2 border-b border-[var(--border)] pb-3">
                  <Coins className="h-6 w-6 text-teal-400" />
                  4. Fee 2,5% — solo al release
                </h2>
                <p className="text-sm leading-relaxed text-[var(--muted)]">
                  Si no hay hito, Lumina cobra 0%. On-chain el 2,5% va a una sola wallet de
                  protocolo. El 1% / 1% / 0,5% es asignación interna (OSS, captación, infra), no
                  tres transfers.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--background)]">
                    <span className="text-lg font-bold text-teal-400 font-mono block">1.0%</span>
                    <span className="text-xs font-bold text-[var(--foreground)] block mt-1">Desarrollo Abierto</span>
                    <p className="text-[10px] text-[var(--muted)] mt-1">Fondeo de recompensas (bounties) para programadores de integraciones de oráculos.</p>
                  </div>
                  <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--background)]">
                    <span className="text-lg font-bold text-green-400 font-mono block">1.0%</span>
                    <span className="text-xs font-bold text-[var(--foreground)] block mt-1">Difusión y Captación</span>
                    <p className="text-[10px] text-[var(--muted)] mt-1">Esfuerzos de marketing para incorporar patrocinadores corporativos del sector tradicional.</p>
                  </div>
                  <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--background)]">
                    <span className="text-lg font-bold text-emerald-400 font-mono block">0.5%</span>
                    <span className="text-xs font-bold text-[var(--foreground)] block mt-1">Infraestructura</span>
                    <p className="text-[10px] text-[var(--muted)] mt-1">Gastos de hosting, auditorías formales anuales y mantenimiento de nodos RPC estables.</p>
                  </div>
                </div>
                <p className="text-xs text-[var(--muted)] leading-relaxed italic">
                  *Nota de transparencia: Las liberaciones con montos pequeños están protegidas por división entera para evitar el cobro de fees que superen la transacción.*
                </p>
              </div>
            )}

            {activeSection === "roadmap" && (
              <div className="space-y-6 animate-fadeIn">
                <h2 className="text-2xl font-serif font-bold text-[var(--foreground)] flex items-center gap-2 border-b border-[var(--border)] pb-3">
                  <Milestone className="h-6 w-6 text-teal-400" />
                  5. Próximamente
                </h2>
                <p className="text-sm leading-relaxed text-[var(--muted)]">
                  El riel ya existe. Lo que escala es compliance, más apps y el mismo contrato:
                </p>

                <div className="space-y-4">
                  {[
                    {
                      fase: "En curso",
                      title: "Auditoría de Seguridad y Verificación Formal",
                      desc: "El contrato paga a la app. Assign obligatorio. Certify con la key de esa app. USDC testnet + path USDT0 oficial."
                    },
                    {
                      fase: "En trabajo",
                      title: "Consorcio de oráculos y disputas",
                      desc: "Creación de un registro de oráculos gobernado multifirma por instituciones del tercer sector y el despliegue del Portal de Disputas para resolver controversias sobre validaciones."
                    },
                    {
                      fase: "En trabajo",
                      title: "Compliance y KYB corporativo",
                      desc: "Riel fiat para tesorerías que no pueden tocar cripto (BCRA). No cambia el protocolo: entra el mismo escrow."
                    },
                    {
                      fase: "Próximamente",
                      title: "Más apps en el mismo protocolo",
                      desc: "MIRA u otras apps pegan el mismo POST /api/v1/certify. Connect es ficha + auditoría chica, no otro producto."
                    }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--background)]">
                      <div className="h-8 w-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold text-xs shrink-0">
                        {i + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-teal-500 uppercase tracking-wider">{item.fase}</span>
                          {i === 0 && <span className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />}
                        </div>
                        <h4 className="text-xs font-bold text-[var(--foreground)] mt-1">{item.title}</h4>
                        <p className="text-[11px] text-[var(--muted)] mt-1 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === "scale" && (
              <div className="space-y-6 animate-fadeIn">
                <h2 className="text-2xl font-serif font-bold text-[var(--foreground)] flex items-center gap-2 border-b border-[var(--border)] pb-3">
                  <FileText className="h-6 w-6 text-teal-400" />
                  6. Recorrido
                </h2>
                <p className="text-sm leading-relaxed text-[var(--muted)]">
                  Impacto sin fricción. Una factura. Un certify. El 97,5% en Stellar.
                </p>
                <ol className="text-sm text-[var(--muted)] space-y-3 list-decimal pl-5">
                  <li>
                    <strong className="text-[var(--foreground)]">0–20s · Home.</strong> Impacto sin
                    fricción. La empresa no toca cripto. El usuario final nunca paga.
                  </li>
                  <li>
                    <strong className="text-[var(--foreground)]">20–50s · /empresa + pack.</strong>{" "}
                    Factura. Panel: 10 niño-mes. PDF de tres bloques. Sin Freighter.
                  </li>
                  <li>
                    <strong className="text-[var(--foreground)]">50–110s · /invest.</strong> Depósito
                    de 40 USDC Circle testnet y assign de la app. Freighter solo acá.
                  </li>
                  <li>
                    <strong className="text-[var(--foreground)]">110–150s · certify.</strong> En
                    /invest, botón Certificar hito (testnet) o la evidencia ya corrida en /jury.
                    97,5% a la app. Explorer.
                  </li>
                  <li>
                    <strong className="text-[var(--foreground)]">150–170s · /jury.</strong> Tx USDC
                    + tx USDT0 oficial mainnet. USDT0: próximamente.
                  </li>
                  <li>
                    <strong className="text-[var(--foreground)]">170–180s · cierre.</strong> Connect
                    es el enchufe. PuenteMAE es ayuda social a docentes. Lumina cobra 0% si no hubo hito.
                  </li>
                </ol>
                <p className="text-[11px] text-[var(--muted)]">
                  Forms: argentinabuilderchallenge.netlify.app/aplicar · stellarapex.org
                </p>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}