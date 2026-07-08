"use client";

import { useState } from "react";
import { 
  BookOpen, ShieldCheck, Cpu, Milestone, Lock, Coins, 
  ArrowRight, Users, Activity, HelpCircle, FileText, CheckCircle
} from "lucide-react";

export default function WhitepaperAndRoadmap() {
  const [activeSection, setActiveSection] = useState<string>("intro");

  const sections = [
    { id: "intro", title: "1. Introducción y ReFi", icon: BookOpen },
    { id: "contract", title: "2. Escrow & Time-Locks", icon: Lock },
    { id: "security", title: "3. Criptografía y EIP-712", icon: ShieldCheck },
    { id: "economics", title: "4. Sostenibilidad Económica", icon: Coins },
    { id: "roadmap", title: "5. Hoja de Ruta a Producción", icon: Milestone },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-teal-500 uppercase tracking-widest block mb-2">
            Documentación Institucional
          </span>
          <h1 className="text-4xl font-serif font-bold tracking-tight bg-gradient-to-r from-teal-400 to-green-400 bg-clip-text text-transparent sm:text-5xl">
            Libro Blanco (Whitepaper) & Hoja de Ruta
          </h1>
          <p className="mt-4 text-sm text-[var(--muted)] max-w-2xl mx-auto">
            Especificación técnica de la infraestructura ReFi de Lumina para sponsors institucionales y socios estratégicos.
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
                  1. Introducción y la Filosofía ReFi
                </h2>
                <p className="text-sm leading-relaxed text-[var(--muted)]">
                  Las finanzas regenerativas (ReFi) proponen alinear los incentivos económicos con la remediación ecológica y el bienestar social. Sin embargo, el financiamiento corporativo de Responsabilidad Social Empresaria (RSE) tradicional sufre de graves ineficiencias: opacidad administrativa, retraso de meses en auditorías y falta de trazabilidad a nivel de unidad de impacto.
                </p>
                <div className="rounded-xl border border-teal-500/10 bg-teal-500/5 p-4 space-y-2">
                  <h4 className="text-xs font-bold text-teal-400">El Propósito de Lumina</h4>
                  <p className="text-xs leading-relaxed text-[var(--muted)]">
                    Lumina opera como una <strong>capa de protocolo de custodia segura (escrow)</strong> que retiene los presupuestos de RSE y los libera de forma atómica a las plataformas ejecutoras sólo cuando un oráculo digital autorizado firma criptográficamente la consecución de un hito medible.
                  </p>
                </div>
                <p className="text-sm leading-relaxed text-[var(--muted)]">
                  De este modo, convertimos las auditorías trimestrales reactivas en un sistema de **validación on-chain inmediato e irrevocable**, protegiendo el capital del sponsor y garantizando que el 97.5% de los fondos llegue directamente a los proveedores de impacto en el territorio.
                </p>
              </div>
            )}

            {activeSection === "contract" && (
              <div className="space-y-6 animate-fadeIn">
                <h2 className="text-2xl font-serif font-bold text-[var(--foreground)] flex items-center gap-2 border-b border-[var(--border)] pb-3">
                  <Lock className="h-6 w-6 text-teal-400" />
                  2. Contratos de Custodia Inteligente y Time-Locks
                </h2>
                <p className="text-sm leading-relaxed text-[var(--muted)]">
                  El núcleo de Lumina reside en contratos inteligentes desarrollados en Rust (Soroban) y Solidity (EVM) que operan de forma simétrica. El diseño prioriza la seguridad del capital depositado a través de protecciones robustas integradas a nivel de protocolo.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--background)]">
                    <h4 className="text-xs font-bold text-[var(--foreground)] flex items-center gap-2 mb-2">
                      <Lock className="h-4 w-4 text-amber-500" />
                      Garantía Time-Lock de 12 Meses
                    </h4>
                    <p className="text-[11px] leading-relaxed text-[var(--muted)]">
                      Si un oráculo validador no emite firmas de cumplimiento dentro de los 12 meses posteriores al depósito, los fondos asignados se desbloquean automáticamente en el contrato, permitiendo al sponsor retirarlos. Esto evita la inmovilización indefinida del capital.
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
                  3. Criptografía y Firmas EIP-712
                </h2>
                <p className="text-sm leading-relaxed text-[var(--muted)]">
                  Para mitigar ataques sofisticados en redes EVM, Lumina implementa firmas tipadas bajo el estándar **EIP-712** en el contrato Solidity de `LuminaEscrow.sol`.
                </p>
                <div className="p-4 rounded-xl bg-slate-950 font-mono text-[11px] text-teal-400 space-y-2 border border-slate-800">
                  <p className="text-slate-500">// Estructura criptográfica de verificación</p>
                  <p>bytes32 public constant RELEASE_TYPEHASH = keccak256(</p>
                  <p>&nbsp;&nbsp;&nbsp;&nbsp;"ReleaseImpact(address sponsor,uint256 amount,bytes32 reportHash)"</p>
                  <p>);</p>
                </div>
                <p className="text-sm leading-relaxed text-[var(--muted)]">
                  Este estándar introduce firmas legibles y liga la autorización al ID de la cadena actual y a la dirección física del contrato en ejecución. Esto mitiga de forma definitiva:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-xs text-[var(--muted)]">
                  <li><strong>Ataques de Replay Cruzados (Cross-chain Replay):</strong> Una firma autorizada para una transacción en la Testnet no puede ser copiada ni ejecutada por un atacante en la red principal (Mainnet).</li>
                  <li><strong>Suplantación de Oráculos:</strong> Los fondos sólo se transfieren si la firma del mensaje coincide con la dirección pública registrada y activa del validador.</li>
                </ul>
              </div>
            )}

            {activeSection === "economics" && (
              <div className="space-y-6 animate-fadeIn">
                <h2 className="text-2xl font-serif font-bold text-[var(--foreground)] flex items-center gap-2 border-b border-[var(--border)] pb-3">
                  <Coins className="h-6 w-6 text-teal-400" />
                  4. Sostenibilidad Económica del Protocolo
                </h2>
                <p className="text-sm leading-relaxed text-[var(--muted)]">
                  Lumina busca autofinanciar su desarrollo abierto e infraestructura sin recurrir a subsidios temporales. Para ello, se establece un split automático de comisiones de **2.5%** sobre cada liberación de hito:
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
                  5. Hoja de Ruta Estratégica Hacia Producción
                </h2>
                <p className="text-sm leading-relaxed text-[var(--muted)]">
                  Nuestra transición a producción real con actores y capitales institucionales se ejecutará de forma rigurosa a través de cuatro fases consecutivas:
                </p>

                <div className="space-y-4">
                  {[
                    {
                      fase: "Fase 1 · En Curso",
                      title: "Auditoría de Seguridad y Verificación Formal",
                      desc: "Auditorías externas de los smart contracts Soroban y EVM por firmas de seguridad independientes para validar la inmunidad a reentradas y manipulación de hashes."
                    },
                    {
                      fase: "Fase 2 · Planificado",
                      title: "Consorcio de Oráculos y Arbitraje Descentralizado",
                      desc: "Creación de un registro de oráculos gobernado multifirma por instituciones del tercer sector y el despliegue del Portal de Disputas para resolver controversias sobre validaciones."
                    },
                    {
                      fase: "Fase 3 · Planificado",
                      title: "Compliance Regulatorio y KYB Corporativo",
                      desc: "Integración de procesos de validación fiscal (Know Your Business) para sponsors y soporte nativo de pasarelas reguladas (SEP-24) para transferencias directas de moneda fiat a USDC."
                    },
                    {
                      fase: "Fase 4 · Planificado",
                      title: "Lanzamiento de Piloto Comercial con MIRA AI",
                      desc: "Puesta en producción del primer canal de cribado médico en zonas vulnerables financiado por corporaciones adheridas a programas ESG en Argentina."
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

          </div>
        </div>

      </div>
    </div>
  );
}