"use client";

import { useState, useEffect } from "react";
import {
  AlertTriangle, ShieldCheck, Cpu, Milestone, CheckCircle2,
  ExternalLink, Activity, Zap, Landmark, Lock, Coins, Globe,
  TrendingUp, Users, ArrowRight, ChevronLeft, ChevronRight, Heart,
} from "lucide-react";

interface Slide {
  id: number;
  label: string;
  title: React.ReactNode;
  subtitle: string;
  icon: any;
  accent: string;
  bgGradient: string;
  content: React.ReactNode;
}

export default function PitchPresentation() {
  const [current, setCurrent] = useState<number>(0);

  const slides: Slide[] = [
    {
      id: 0,
      label: "Portada",
      title: (
        <>
          Infraestructura <span className="text-gradient">ReFi</span> Universal
          <br />
          para Hitos de Impacto
        </>
      ),
      subtitle: "Escrow programable + oráculos verificados on-chain en Stellar",
      icon: Zap,
      accent: "text-[var(--teal)]",
      bgGradient: "from-[var(--teal-light)] via-transparent to-[var(--green-light)]",
      content: (
        <div className="space-y-8 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-sm font-bold tracking-wide">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-ping" />
            DESPLEGADO EN STELLAR TESTNET — CONTRATO OPERATIVO
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="glass-card p-4 rounded-xl">
              <div className="text-2xl font-bold text-[var(--teal)]">MVP</div>
              <div className="text-xs text-[var(--muted)] uppercase">Contrato operativo en Testnet</div>
            </div>
            <div className="glass-card p-4 rounded-xl">
              <div className="text-2xl font-bold text-[var(--green)]">Soroban</div>
              <div className="text-xs text-[var(--muted)] uppercase">Smart contract Rust + WASM</div>
            </div>
            <div className="glass-card p-4 rounded-xl">
              <div className="text-2xl font-bold text-[var(--gold)]">97.5%</div>
              <div className="text-xs text-[var(--muted)] uppercase">De fondos directo a impacto</div>
            </div>
          </div>
          <p className="text-sm text-[var(--muted)]">
            Stellar PULSO Hackathon 2026 · Track PULSO Argentina
          </p>
        </div>
      ),
    },
    {
      id: 1,
      label: "El Problema",
      title: (
        <>
          $3.7 billones de dólares <span className="text-[var(--danger)]">se pierden</span>
          <br />
          en el camino del RSE al impacto real
        </>
      ),
      subtitle: "Opacidad. Intermediarios. Cero trazabilidad granular.",
      icon: AlertTriangle,
      accent: "text-[var(--danger)]",
      bgGradient: "from-rose-950/30 via-transparent to-transparent",
      content: (
        <div className="space-y-6 max-w-3xl">
          <p className="text-[var(--foreground)] text-lg leading-relaxed font-semibold">
            Cuando una empresa argentina destina presupuesto de RSE:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-card p-6 rounded-2xl border-l-4 border-[var(--danger)]">
              <div className="text-3xl font-bold text-[var(--danger)] mb-2">60-70%</div>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                del presupuesto se consume en intermediarios administrativos, ONGs gestoras y auditorías trimestrales — antes de llegar al impacto.
              </p>
            </div>
            <div className="glass-card p-6 rounded-2xl border-l-4 border-[var(--danger)]">
              <div className="text-3xl font-bold text-[var(--danger)] mb-2">3-6 meses</div>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                de retraso entre el momento del impacto y el reporte que lo certifica. La empresa descubre qué pasó con su dinero cuando ya es tarde.
              </p>
            </div>
          </div>
          <div className="glass-card p-6 rounded-2xl border border-[var(--border)]">
            <p className="text-sm text-[var(--foreground)] leading-relaxed">
              <strong>El resultado:</strong> las empresas <span className="text-[var(--danger)] font-bold">no pueden auditar granularmente</span> si cada peso financió un screening, un árbol plantado, o una beca. El riesgo de <em>impact-washing</em> es permanente y la confianza depende del intermediario.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      label: "La Solución",
      title: (
        <>
          Escrow Programable + <span className="text-gradient">Oráculos de Impacto</span>
          <br />
          firmados criptográficamente on-chain
        </>
      ),
      subtitle: "Lumina conecta capital corporativo con hitos de impacto verificado",
      icon: ShieldCheck,
      accent: "text-[var(--green)]",
      bgGradient: "from-[var(--green-light)] via-transparent to-[var(--teal-light)]",
      content: (
        <div className="space-y-6 max-w-3xl">
          <p className="text-[var(--foreground)] text-lg leading-relaxed font-semibold">
            Una capa de confianza que reemplaza intermediarios por criptografía:
          </p>
          <div className="space-y-4">
            {[
              { step: "1", title: "Custodia Programable", text: "El sponsor deposita USDC en un smart contract de Soroban. Los fondos NO son custodiados por Lumina — quedan bloqueados en escrow y pertenecen al sponsor hasta verificar el impacto." },
              { step: "2", title: "Oráculo de Impacto Ciego", text: "Cualquier app de impacto (MIRA, EcoForest, EducaReFi) registra una cuenta oráculo. Al completar un hito, firma el hash SHA-256 del reporte — no transmite datos sensibles, cumple HIPAA/GDPR." },
              { step: "3", title: "Liberación Atómica", text: "El contrato verifica la firma del oráculo, valida que el monto coincida con la tarifa configurada, previene doble cobro por hash duplicado, y libera USDC al ejecutor — en un solo bloque." },
              { step: "4", title: "Score Reputacional Soulbound", text: "Cada hito liberado incrementa el Impact Score del sponsor. Un token no transferible ($LUMINA) que certifica su compromiso verificable para reporting ESG." },
            ].map((s) => (
              <div key={s.step} className="flex gap-4 items-start glass-card p-4 rounded-xl">
                <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-[var(--green-light)] text-[var(--green)] text-lg font-bold font-mono">
                  {s.step}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--foreground)] mb-1">{s.title}</h3>
                  <p className="text-xs text-[var(--muted)] leading-relaxed">{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 3,
      label: "Caso Real",
      title: (
        <>
          MIRA AI: <span className="text-gradient">MVP funcional</span>
          <br />
          integración oracular verificada on-chain en Testnet
        </>
      ),
      subtitle: "El primer oráculo desplegado — screening de neurodesarrollo infantil",
      icon: Heart,
      accent: "text-[var(--teal)]",
      bgGradient: "from-[var(--teal-light)] via-transparent to-transparent",
      content: (
        <div className="space-y-6 max-w-3xl">
          <div className="glass-card p-6 rounded-2xl border-l-4 border-[var(--teal)]">
            <p className="text-sm text-[var(--foreground)] leading-relaxed mb-3">
              <strong>El problema:</strong> 1 de cada 36 niños presenta rasgos del espectro autista. La intervención temprana durante la ventana crítica de 16-30 meses cambia el pronóstico de por vida — pero en Argentina <strong className="text-[var(--danger)]">no existe financiamiento sistemático para cribados masivos</strong>.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="glass-card p-4 rounded-xl text-center">
              <div className="text-3xl font-bold text-[var(--teal)] mb-1">83%</div>
              <div className="text-xs text-[var(--muted)] uppercase tracking-wider">Sensibilidad M-CHAT-R/F</div>
            </div>
            <div className="glass-card p-4 rounded-xl text-center">
              <div className="text-3xl font-bold text-[var(--teal)] mb-1">57.7%</div>
              <div className="text-xs text-[var(--muted)] uppercase tracking-wider">Valor predictivo positivo</div>
            </div>
            <div className="glass-card p-4 rounded-xl text-center">
              <div className="text-3xl font-bold text-[var(--green)] mb-1">-50%</div>
              <div className="text-xs text-[var(--muted)] uppercase tracking-wider">Costos de atención a largo plazo</div>
            </div>
            <div className="glass-card p-4 rounded-xl text-center">
              <div className="text-3xl font-bold text-[var(--gold)] mb-1">$40</div>
              <div className="text-xs text-[var(--muted)] uppercase tracking-wider">USDC por screening liberado</div>
            </div>
          </div>
          <div className="glass-card p-4 rounded-xl flex items-center gap-3 border border-[var(--teal-light)] bg-[var(--teal-light)]">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-ping flex-shrink-0" />
            <p className="text-xs text-[var(--foreground)] font-bold">
              LIVE: Transacciones auditable en stellar.expert →
              <a
                href="https://stellar.expert/explorer/testnet/contract/CBLKDMO6M5GJZVNPKD2QRCAKGDFUHJCF27EG7MOFRAEHSNWMXAOOG6HA"
                target="_blank"
                rel="noreferrer"
                className="text-[var(--teal)] hover:underline ml-1"
              >
                Ver contrato
              </a>
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 4,
      label: "Arquitectura",
      title: (
        <>
          Carga-pesos <span className="text-gradient">en Stellar</span>:
          <br />
          de depósito a liberación en 4 pasos atómicos
        </>
      ),
      subtitle: "Contrato Rust compilado a WASM · oráculo firmado · deduplicación persistente",
      icon: Cpu,
      accent: "text-[var(--teal)]",
      bgGradient: "from-transparent via-[var(--teal-light)] to-transparent",
      content: (
        <div className="space-y-5 max-w-3xl">
          <div className="glass-card p-5 rounded-xl font-mono text-xs space-y-3 border border-[var(--teal-light)]">
            {[
              { cmd: "deposit()", args: "sponsor, amount →  USDC.transfer(sponsor → escrow)", color: "text-[var(--teal)]" },
              { cmd: "release_impact()", args: "oracle.sign(report_hash) → verifica oracle autorizado", color: "text-[var(--green)]" },
              { cmd: "  ↳ deduplicación", args: "report_hash already in storage? → reject", color: "text-[var(--warn)]" },
              { cmd: "  ↳ price match", args: "amount == oracle.price? → reject si desync", color: "text-[var(--warn)]" },
              { cmd: "  ↳ transfer", args: "USDC.transfer(escrow → platform_wallet) + emit ImpactReleasedEvent", color: "text-[var(--green)]" },
            ].map((line, i) => (
              <div key={i} className="flex gap-2 items-start">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className={line.color}>
                  <strong>{line.cmd}</strong> <span className="text-[var(--muted)]">{line.args}</span>
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-[var(--muted)] italic">
            Compilado con <code className="font-mono">wasm32v1-none</code> para compatibilidad Soroban ·
            Storage persistente con TTL de ~30 días · Time-lock de 1 año para ajustes de tarifa.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="glass-card p-3 rounded-xl">
              <Lock className="h-4 w-4 text-[var(--warn)] mb-1" />
              <strong className="text-[var(--foreground)] block">Time-Lock 1 año</strong>
              <span className="text-[var(--muted)]">Ajustes de tarifa bloqueados 360 días para proteger sponsors</span>
            </div>
            <div className="glass-card p-3 rounded-xl">
              <ShieldCheck className="h-4 w-4 text-[var(--green)] mb-1" />
              <strong className="text-[var(--foreground)] block">Anti-Double Spend</strong>
              <span className="text-[var(--muted)]">Hash del reporte persistente — imposible cobrar 2 veces el mismo hito</span>
            </div>
            <div className="glass-card p-3 rounded-xl">
              <Users className="h-4 w-4 text-[var(--teal)] mb-1" />
              <strong className="text-[var(--foreground)] block">Registro de Oráculos</strong>
              <span className="text-[var(--muted)]">Admin autoriza apps de impacto on-chain · revocable en cualquier momento</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 5,
      label: "Multivertical",
      title: (
        <>
          No es solo salud. <span className="text-gradient">Es infraestructura.</span>
          <br />
          Cualquier verticalidad de impacto puede conectar.
        </>
      ),
      subtitle: "Plataforma agnóstica — Salud activo hoy, Ambiental/Educación/Social en roadmap",
      icon: Globe,
      accent: "text-[var(--teal)]",
      bgGradient: "from-[var(--teal-light)] via-[var(--green-light)] to-[var(--gold-light)]",
      content: (
        <div className="space-y-5 max-w-3xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-card p-5 rounded-2xl border-l-4 border-[var(--teal)]">
              <div className="flex items-center gap-2 mb-3">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-ping" />
                <span className="text-xs font-bold text-green-500 uppercase tracking-wider">Live · Testnet</span>
              </div>
              <h3 className="text-base font-bold text-[var(--foreground)] mb-1">Salud — MIRA AI</h3>
              <p className="text-xs text-[var(--muted)]">Screening de neurodesarrollo · contrato operativo en Testnet · 40 USDC/hito configurado</p>
              <a
                href="https://stellar.expert/explorer/testnet/contract/CBLKDMO6M5GJZVNPKD2QRCAKGDFUHJCF27EG7MOFRAEHSNWMXAOOG6HA"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[var(--teal)] hover:underline mt-2 inline-flex items-center gap-1"
              >
                Auditar en stellar.expert <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="glass-card p-5 rounded-2xl border-l-4 border-zinc-500">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Demo conceptual</span>
              </div>
              <h3 className="text-base font-bold text-[var(--foreground)] mb-1">Ambiental — EcoForest</h3>
              <p className="text-xs text-[var(--muted)]">Reforestación nativa con verificación satelital · 5 USDC/árbol</p>
              <p className="text-xs text-[var(--muted)] italic mt-2">Contrato仍未 desplegado · mock data en sandbox</p>
            </div>
          </div>
          <div className="glass-card p-4 rounded-xl">
            <p className="text-xs text-[var(--foreground)] leading-relaxed">
              <strong className="text-[var(--teal)]">El insight:</strong> Lumina es una <strong>capa de protocolo</strong>, no una app vertical. Cada nueva verticalidad agrega un oráculo autorizado y una tarifa configurada — sin modificar el contrato. El mismo escrow que financia un screening puede financiar un árbol o una beca.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 6,
      label: "Sustentabilidad",
      title: (
        <>
          97.5% al impacto. <span className="text-gradient">2.5%</span> al protocolo.
          <br />
          Modelos de gobernanza que se autofinancian.
        </>
      ),
      subtitle: "Fee de protocolo que financia desarrollo abierto, captación e infraestructura",
      icon: TrendingUp,
      accent: "text-[var(--gold)]",
      bgGradient: "from-[var(--gold-light)] via-transparent to-[var(--teal-light)]",
      content: (
        <div className="space-y-5 max-w-3xl">
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card p-6 rounded-2xl text-center border border-[var(--green)]">
              <div className="text-5xl font-extrabold text-[var(--green)] mb-1">97.5%</div>
              <div className="text-sm font-bold text-[var(--foreground)] mb-1">Impacto directo</div>
              <p className="text-xs text-[var(--muted)]">Transferido al ejecutor del hito (plataforma de impacto) en cada liberación atómica</p>
            </div>
            <div className="glass-card p-6 rounded-2xl text-center border border-[var(--gold)]">
              <div className="text-5xl font-extrabold text-[var(--gold)] mb-1">2.5%</div>
              <div className="text-sm font-bold text-[var(--foreground)] mb-1">Sostenimiento protocolo</div>
              <p className="text-xs text-[var(--muted)]">Distribuido automáticamente en cada release_impact</p>
            </div>
          </div>
          <div className="glass-card p-5 rounded-xl space-y-3">
            <div className="flex items-center gap-3">
              <Coins className="h-5 w-5 text-[var(--gold)] flex-shrink-0" />
              <div>
                <span className="text-xs font-bold text-[var(--foreground)] block">1.0% · Desarrollo Abierto</span>
                <span className="text-xs text-[var(--muted)]">Bounties directos a programadores que conecten nuevas apps</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-[var(--teal)] flex-shrink-0" />
              <div>
                <span className="text-xs font-bold text-[var(--foreground)] block">1.0% · Difusión y captación</span>
                <span className="text-xs text-[var(--muted)]">Marketing para atraer sponsors corporativos tradicionales</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Cpu className="h-5 w-5 text-[var(--green)] flex-shrink-0" />
              <div>
                <span className="text-xs font-bold text-[var(--foreground)] block">0.5% · Infraestructura</span>
                <span className="text-xs text-[var(--muted)]">Nodos RPC, hosting, auditorías de seguridad</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 7,
      label: "Roadmap",
      title: (
        <>
          De screening a <span className="text-gradient">infraestructura regional</span>:
          <br />
          roadmap escalado en fases
        </>
      ),
      subtitle: "Validación en Testnet → expansión vertical → mainnet LATAM",
      icon: Milestone,
      accent: "text-[var(--teal)]",
      bgGradient: "from-transparent via-[var(--teal-light)] to-[var(--green-light)]",
      content: (
        <div className="space-y-4 max-w-3xl">
          {[
            { phase: "Fase 1 · Actual", title: "Validación de Piloto e Integración (MIRA AI)", desc: "Contrato de custodia en Testnet · firma criptográfica del primer oráculo (MIRA) · deduplicación de reportes", status: "live" },
            { phase: "Fase 2", title: "Lanzamiento de Lumina SDK (Onboarding Abierto)", desc: "Estandarización de APIs y smart contracts para que cualquier app (clima, social, deporte) se conecte autónomamente", status: "design" },
            { phase: "Fase 3", title: "Registro Descentralizado y Gobernanza", desc: "Mecanismo para que patrocinadores y la comunidad voten e incorporen nuevos oráculos verificadores autorizados", status: "future" },
            { phase: "Fase 4", title: "Escrows DeFi con Rendimiento Optimizado", desc: "Integración con pools de liquidez en Soroban para generar rendimiento en USDC mientras se verifican los hitos", status: "future" },
          ].map((r, i) => (
            <div key={i} className={`glass-card p-4 rounded-xl flex items-center gap-4 ${r.status === "live" ? "border-l-4 border-[var(--teal)]" : ""}`}>
              <div className={`flex-shrink-0 text-center w-20`}>
                <div className={`text-xs font-bold uppercase tracking-wider ${r.status === "live" ? "text-[var(--teal)]" : "text-[var(--muted)]"}`}>{r.phase}</div>
                {r.status === "live" && <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-ping inline-block mt-1" />}
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--foreground)]">{r.title}</h3>
                <p className="text-xs text-[var(--muted)]">{r.desc}</p>
              </div>
            </div>
          ))}
        </div>
      ),
    },
  ];

  const handleNext = () => setCurrent((prev) => (prev + 1) % slides.length);
  const handlePrev = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const ActiveIcon = slides[current].icon;

  return (
    <div className="fixed inset-0 flex flex-col bg-[var(--background)] z-40">
      {/* Background gradient per slide */}
      <div className={`absolute inset-0 bg-gradient-to-br ${slides[current].bgGradient} transition-all duration-700 pointer-events-none`} />

      {/* Top bar — slide indicators */}
      <div className="relative z-10 flex h-16 items-center justify-between px-6 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-teal-600 to-green-600">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="font-serif text-lg font-bold text-[var(--foreground)]">Lumina</span>
          <span className="text-xs text-[var(--muted)] ml-2 hidden sm:block">Pitch Deck · PULSO 2026</span>
        </div>
        <div className="flex gap-1.5">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                i === current ? "w-8 bg-[var(--teal)]" : "w-1.5 bg-[var(--border)] hover:bg-[var(--teal-light)]"
              }`}
              title={s.label}
            />
          ))}
        </div>
        <div className="text-xs font-mono text-[var(--muted)]">
          {String(current + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
        </div>
      </div>

      {/* Slide content — full viewport */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-8 overflow-y-auto">
        <div className="max-w-5xl w-full mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <div className={`h-14 w-14 flex items-center justify-center rounded-2xl bg-[var(--teal-light)] ${slides[current].accent} flex-shrink-0`}>
              <ActiveIcon className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-xs font-bold text-[var(--teal)] uppercase tracking-widest">{slides[current].label}</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--foreground)] leading-[1.15]">
                {slides[current].title}
              </h1>
              <p className="text-base sm:text-lg text-[var(--muted)] mt-2 font-medium">{slides[current].subtitle}</p>
            </div>
          </div>
          <div className="border-t border-[var(--border)] pt-6">
            {slides[current].content}
          </div>
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="relative z-10 flex h-16 items-center justify-between px-6 border-t border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md flex-shrink-0">
        <div className="flex items-center gap-3 w-full">
          <button
            onClick={handlePrev}
            disabled={current === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--teal-light)] transition-all active:scale-95 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" /> Anterior
          </button>
          <div className="flex-1 text-center text-xs text-[var(--muted)] hidden sm:block">
            {current === slides.length - 1 ? "Fin de la presentación · Pulsá ← para volver" : "Usá ← → o los botones para navegar"}
          </div>
          {current < slides.length - 1 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-green-600 text-sm font-semibold text-white shadow-md hover:scale-105 transition-all active:scale-95 cursor-pointer"
            >
              Siguiente <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <a
              href="https://stellar.expert/explorer/testnet/contract/CBLKDMO6M5GJZVNPKD2QRCAKGDFUHJCF27EG7MOFRAEHSNWMXAOOG6HA"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-green-600 text-sm font-semibold text-white shadow-md hover:scale-105 transition-all active:scale-95 cursor-pointer"
            >
              Auditar on-chain <ArrowRight className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}