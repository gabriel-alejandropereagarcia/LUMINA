"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ShieldCheck, Heart, Users, Coins, ArrowRight, Cpu, Sparkles, 
  Scale, Landmark, BarChart3, Lock, Search, Globe, Trophy, MapPin,
  TreePine, GraduationCap, Leaf, Activity, CheckCircle2, ExternalLink,
  Zap, Target
} from "lucide-react";

type ImpactCategory = "salud" | "ambiental" | "educativa";

interface ImpactProject {
  id: ImpactCategory;
  name: string;
  tagline: string;
  description: string;
  icon: any;
  hitoPrice: number;
  badge: "live" | "simulated";
  badgeLabel: string;
  milestones: number;
  usdcFunded: number;
  category: string;
  realTxs?: { hash: string; date: string; block: string }[];
  simTxs?: { label: string; date: string; status: string }[];
}

export default function SandboxLumina() {
  const [activeCategory, setActiveCategory] = useState<ImpactCategory>("salud");
  const [searchQuery, setSearchQuery] = useState("");

  const projects: ImpactProject[] = [
    {
      id: "salud",
      name: "MIRA AI",
      tagline: "Screening de Neurodesarrollo Infantil",
      description: "Evaluaciones clínicas automatizadas para la detección temprana de TEA y riesgos de neurodesarrollo. Contrato y oráculo operativos en Stellar Testnet.",
      icon: Cpu,
      hitoPrice: 40,
      badge: "live",
      badgeLabel: "CONEXIÓN REAL — STELLAR TESTNET",
      milestones: 0,
      usdcFunded: 0,
      category: "Salud",
      realTxs: [
        { hash: "[VER EN STELLAR EXPERT — TX DE PRUEBA]", date: "Auditar", block: "Testnet" },
      ],
    },
    {
      id: "ambiental",
      name: "EcoForest",
      tagline: "Reforestación Nativa Verificada",
      description: "Siembra y cuidado auditado de árboles nativos en zonas degradadas. Verificación satelital integrada. (Demo conceptual — contrato aún no desplegado).",
      icon: TreePine,
      hitoPrice: 5,
      badge: "simulated",
      badgeLabel: "EJEMPLO SIMULADO — DEMO CONCEPTUAL",
      milestones: 0,
      usdcFunded: 0,
      category: "Ambiental",
      simTxs: [
        { label: "Simulación: 120 árboles plantados — Corrientes", date: "2026-06-20", status: "Mock" },
        { label: "Simulación: Reforestación parque industrial — Buenos Aires", date: "2026-06-18", status: "Mock" },
      ],
    },
    {
      id: "educativa",
      name: "EducaReFi",
      tagline: "Financiamiento Programable de Acceso Educativo",
      description: "Micro-becas on-chain para acceso a educación primaria y capacitación técnica en comunidades rurales argentinas. (Demo conceptual — contrato aún no desplegado).",
      icon: GraduationCap,
      hitoPrice: 25,
      badge: "simulated",
      badgeLabel: "EJEMPLO SIMULADO — DEMO CONCEPTUAL",
      milestones: 0,
      usdcFunded: 0,
      category: "Educación",
      simTxs: [
        { label: "Simulación: 15 becas completadas — Chaco", date: "2026-06-15", status: "Mock" },
      ],
    },
  ];

  const activeProject = projects.find(p => p.id === activeCategory)!;

  const ledgerData = [
    { category: "Salud", pct: 40, color: "bg-[var(--teal)]", count: 0, usdc: 0 },
    { category: "Conservación", pct: 35, color: "bg-[var(--green)]", count: 0, usdc: 0 },
    { category: "Educación", pct: 25, color: "bg-[var(--gold)]", count: 0, usdc: 0 },
  ];

  const sponsorData = [
    { name: "MercadoLibre RSE", badge: "Platino", impact: 0, usdc: 0, cat: "Salud (Testnet)" },
    { name: "Sponsor Demo A (Testnet)", badge: "Oro", impact: 0, usdc: 0, cat: "Demo" },
    { name: "Sponsor Demo B (Testnet)", badge: "Plata", impact: 0, usdc: 0, cat: "Demo" },
  ];

  return (
    <div className="flex flex-col items-center min-h-screen px-4 py-16 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-24">

      {/* Sandbox Badge */}
      <div className="fixed top-4 left-4 z-50">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-[var(--warn-border)] text-[var(--warn)] text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
          <Zap className="h-3 w-3" /> Sandbox — Cambios Preview
        </span>
      </div>

      {/* Hero Section — Copy Reescrito */}
      <div className="max-w-4xl text-center space-y-8 z-10 pt-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--teal-light)] bg-[var(--teal-light)] text-[var(--teal)] text-xs font-semibold tracking-wide uppercase">
          <Sparkles className="h-3.5 w-3.5" /> Infraestructura ReFi Universal
        </div>
        
        <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-[var(--foreground)] leading-tight">
          Capa Abierta de Financiamiento Programable para Hitos de Impacto
        </h1>
        
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-[var(--muted)] leading-relaxed">
          Lumina es una infraestructura universal y agnóstica de Economía Regenerativa (ReFi) para el financiamiento programable de hitos de impacto — Ambiental, Social, Educación y Salud — con trazabilidad criptográfica en Stellar.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/invest"
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-green-600 px-8 py-4 text-base font-semibold text-white shadow-lg hover:from-teal-700 hover:to-green-700 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            Invertir en Impacto
            <ArrowRight className="h-5 w-5" />
          </Link>
          <a
            href="#categories"
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] px-8 py-4 text-base font-semibold text-[var(--foreground)] hover:bg-[var(--teal-light)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            Explorar Categorías
          </a>
        </div>
      </div>

      {/* Stats Globales */}
      <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 z-10">
        {[
          { label: "Garantías en Custodia", value: "1,820 USDC", icon: ShieldCheck, color: "text-[var(--green)]" },
          { label: "Hitos Verificados", value: "46 Casos", icon: Heart, color: "text-[var(--danger)]" },
          { label: "Patrocinadores", value: "3 Corporativos", icon: Users, color: "text-[var(--teal)]" },
          { label: "Categorías Activas", value: "3 Verticalidades", icon: Target, color: "text-[var(--gold)]" },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-6 rounded-2xl flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">{stat.label}</span>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <span className="text-2xl font-bold tracking-tight text-[var(--foreground)]">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* CATEGORÍAS DE IMPACTO — Live vs Simulado */}
      <div id="categories" className="w-full space-y-8 z-10 pt-12 border-t border-[var(--border)]">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold text-[var(--teal)] uppercase tracking-widest block">Categorías de Impacto</span>
          <h2 className="font-serif text-3xl font-bold text-[var(--foreground)] tracking-tight">Verticalidades del Protocolo</h2>
          <p className="text-xs text-[var(--muted)] max-w-md mx-auto">
            Cada verticalidad representa un dominio de impacto social o ambiental que puede financiarse programáticamente a través de Lumina.
          </p>
        </div>

        {/* Category Selector */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => setActiveCategory(project.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeCategory === project.id
                  ? project.badge === "live"
                    ? "bg-[var(--teal-light)] text-[var(--teal)] border border-[var(--teal-light)]"
                    : "bg-[var(--muted-bg)] text-[var(--foreground)] border border-[var(--border)]"
                  : "bg-transparent text-[var(--muted)] border border-[var(--border)] hover:border-[var(--teal-light)] hover:text-[var(--foreground)]"
              }`}
            >
              <project.icon className="h-4 w-4" />
              {project.name}
            </button>
          ))}
        </div>

        {/* Active Project Card */}
        <div className={`glass-card rounded-2xl border overflow-hidden flex flex-col ${
          activeProject.badge === "live" 
            ? "border-[var(--teal-light)]" 
            : "border-[var(--border)]"
        }`}>
          {/* Header with badge */}
          <div className={`px-6 py-4 flex items-center justify-between ${
            activeProject.badge === "live"
              ? "bg-[var(--teal-light)] border-b border-[var(--teal-light)]"
              : "bg-[var(--muted-bg)] border-b border-[var(--border)]"
          }`}>
            <div className="flex items-center gap-3">
              <activeProject.icon className={`h-5 w-5 ${
                activeProject.badge === "live" ? "text-[var(--teal)]" : "text-[var(--muted)]"
              }`} />
              <span className="text-sm font-bold text-[var(--foreground)]">{activeProject.name}</span>
            </div>
            <div className="flex items-center gap-2">
              {activeProject.badge === "live" && (
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              )}
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                activeProject.badge === "live"
                  ? "bg-green-500/10 text-green-600 border border-green-500/20"
                  : "bg-zinc-500/10 text-zinc-500 border border-zinc-500/20"
              }`}>
                {activeProject.badgeLabel}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-[var(--foreground)]">{activeProject.tagline}</h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">{activeProject.description}</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-[var(--muted-bg)] p-4 rounded-xl border border-[var(--border)] text-center">
                <span className="block text-2xl font-bold text-[var(--foreground)] font-mono">
                  {activeProject.milestones}
                </span>
                <span className="text-xs text-[var(--muted)] uppercase tracking-wider block mt-1">
                  {activeProject.badge === "live" ? "Hitos Reales" : "Hitos Simulados"}
                </span>
              </div>
              <div className="bg-[var(--muted-bg)] p-4 rounded-xl border border-[var(--border)] text-center">
                <span className="block text-2xl font-bold text-[var(--foreground)] font-mono">
                  {activeProject.usdcFunded.toLocaleString()} USDC
                </span>
                <span className="text-xs text-[var(--muted)] uppercase tracking-wider block mt-1">
                  Fondos Movilizados
                </span>
              </div>
              <div className="bg-[var(--muted-bg)] p-4 rounded-xl border border-[var(--border)] text-center">
                <span className="block text-2xl font-bold text-[var(--foreground)] font-mono">
                  {activeProject.hitoPrice} USDC
                </span>
                <span className="text-xs text-[var(--muted)] uppercase tracking-wider block mt-1">
                  Tarifa por Hito
                </span>
              </div>
            </div>

            {/* Transaction History */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest block">
                {activeProject.badge === "live" ? "Historial de Transacciones On-Chain" : "Transacciones de Ejemplo"}
              </span>
              <div className="border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--muted-bg)] text-xs">
                <div className="bg-[var(--card-bg)] p-3 font-bold text-[var(--muted)] grid grid-cols-3 border-b border-[var(--border)] text-xs">
                  <span>{activeProject.badge === "live" ? "HASH DE REPORTE" : "DESCRIPCIÓN"}</span>
                  <span>{activeProject.badge === "live" ? "BLOQUE" : "ESTADO"}</span>
                  <span className="text-right">FECHA</span>
                </div>
                <div className="divide-y divide-[var(--border)]">
                  {activeProject.badge === "live" && activeProject.realTxs?.map((tx, i) => (
                    <div key={i} className="p-3 grid grid-cols-3 items-center text-[var(--muted)]">
                      <span className="font-mono text-xs break-all pr-2">{tx.hash.slice(0, 20)}...</span>
                      <span className="font-mono text-xs text-[var(--foreground)]">#{tx.block}</span>
                      <span className="text-right font-mono text-xs text-[var(--teal)]">{tx.date}</span>
                    </div>
                  ))}
                  {activeProject.badge === "simulated" && activeProject.simTxs?.map((tx, i) => (
                    <div key={i} className="p-3 grid grid-cols-3 items-center text-[var(--muted)]">
                      <span className="text-xs">{tx.label}</span>
                      <span className="text-xs text-zinc-500 font-bold uppercase">Transacción de Simulación</span>
                      <span className="text-right font-mono text-xs text-zinc-500">{tx.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LIVE IMPACT LEDGER — Rebalanceado */}
      <div className="w-full space-y-8 z-10 pt-12 border-t border-[var(--border)]">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold text-[var(--teal)] uppercase tracking-widest block">Live Impact Ledger</span>
          <h2 className="font-serif text-3xl font-bold text-[var(--foreground)] tracking-tight">Distribución de Impacto por Categoría</h2>
          <p className="text-xs text-[var(--muted)] max-w-md mx-auto">
            Composición actual del ecosistema Lumina. Los datos reales corresponden a la categoría Salud (MIRA). Las demás categorías representan proyecciones de expansión.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Bar Chart */}
          <div className="lg:col-span-2 glass-card p-6 rounded-2xl space-y-6">
            <h3 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[var(--teal)]" /> Distribución de Hitos
            </h3>
            
            {ledgerData.map((cat, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[var(--foreground)]">{cat.category}</span>
                  <span className="font-mono text-[var(--muted)]">{cat.pct}% — {cat.count} hitos — {cat.usdc.toLocaleString()} USDC</span>
                </div>
                <div className="w-full h-3 rounded-full bg-[var(--muted-bg)] overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${cat.color} transition-all duration-500`}
                    style={{ width: `${cat.pct}%` }}
                  />
                </div>
              </div>
            ))}

            <div className="pt-4 border-t border-[var(--border)] flex items-center gap-2 text-xs text-[var(--muted)]">
              <Activity className="h-4 w-4 text-[var(--teal)]" />
              <span>Datos de Salud (MIRA) actualizados en tiempo real. Las demás categorías serán activadas a medida que se desplieguen sus contratos en Soroban.</span>
            </div>
          </div>

          {/* Sponsor Directory */}
          <div className="lg:col-span-1 glass-card p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
              <Trophy className="h-5 w-5 text-[var(--gold)]" /> Directorio de Sponsors
            </h3>

            <div className="space-y-3">
              {sponsorData.map((s, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-[var(--border)] bg-[var(--muted-bg)]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[var(--muted)]">#{idx + 1}</span>
                    <div>
                      <h4 className="text-xs font-bold text-[var(--foreground)]">{s.name}</h4>
                      <span className="text-xs text-[var(--teal)]">{s.badge} • {s.cat}</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[var(--foreground)] font-mono">{s.impact} hitos</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dual Audience — Copy Reescrito */}
      <div className="w-full space-y-12 z-10 pt-12 border-t border-[var(--border)]">
        <div className="text-center space-y-4">
          <h2 className="font-serif text-3xl font-bold text-[var(--foreground)] tracking-tight">
            Infraestructura para Finanzas Tradicionales e Innovación ReFi
          </h2>
          <p className="max-w-xl mx-auto text-sm text-[var(--muted)]">
            Lumina une las exigencias de cumplimiento corporativo y ESG con la seguridad criptográfica del ecosistema DeFi, funcionando como capa universal de financiamiento de impacto.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-card p-8 rounded-2xl border border-[var(--card-border)] space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-[var(--teal-light)] text-[var(--teal)]">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-[var(--foreground)]">Para Directores de RSE y Fondos ESG</h3>
            </div>
            <ul className="space-y-4 text-sm text-[var(--muted)]">
              <li className="flex items-start gap-2">
                <ShieldCheck className="h-5 w-5 text-[var(--green)] flex-shrink-0 mt-0.5" />
                <span><strong className="text-[var(--foreground)]">Trazabilidad de Auditoría:</strong> Cada centavo de RSE liberado cuenta con una prueba criptográfica incuestionable en la blockchain de Stellar, visible en tiempo real.</span>
              </li>
              <li className="flex items-start gap-2">
                <Lock className="h-5 w-5 text-[var(--green)] flex-shrink-0 mt-0.5" />
                <span><strong className="text-[var(--foreground)]">Privacidad por Diseño:</strong> Cumplimos con HIPAA y GDPR. No se almacenan datos personales on-chain; solo hashes ciegos (SHA-256).</span>
              </li>
              <li className="flex items-start gap-2">
                <Coins className="h-5 w-5 text-[var(--green)] flex-shrink-0 mt-0.5" />
                <span><strong className="text-[var(--foreground)]">Eficiencia de Costos:</strong> Eliminamos intermediarios, canalizando el 97.5% de los fondos directo a financiar hitos de impacto.</span>
              </li>
            </ul>
          </div>

          <div className="glass-card p-8 rounded-2xl border border-[var(--card-border)] space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-[var(--green-light)] text-[var(--green)]">
                <Scale className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-[var(--foreground)]">Para Constructores ReFi y Desarrolladores</h3>
            </div>
            <ul className="space-y-4 text-sm text-[var(--muted)]">
              <li className="flex items-start gap-2">
                <Cpu className="h-5 w-5 text-[var(--teal)] flex-shrink-0 mt-0.5" />
                <span><strong className="text-[var(--foreground)]">Oráculos de Impacto Abiertos:</strong> Cualquier aplicación (MIRA, EcoForest, EducaReFi) puede registrarse como oráculo y certificar hitos de forma descentralizada.</span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="h-5 w-5 text-[var(--teal)] flex-shrink-0 mt-0.5" />
                <span><strong className="text-[var(--foreground)]">Escrow Fideicomisario:</strong> Los fondos quedan custodiados en Soroban y solo se liberan con verificación criptográfica del impacto.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-[var(--teal)] flex-shrink-0 mt-0.5" />
                <span><strong className="text-[var(--foreground)]">Deduplicación On-Chain:</strong> Prevención nativa contra el doble cobro mediante hash persistente en Soroban.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Roadmap de Expansión */}
      <div className="w-full glass-card p-8 sm:p-12 rounded-3xl border border-[var(--card-border)] bg-gradient-to-br from-[var(--teal-light)] via-transparent to-[var(--green-light)] flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 z-10 relative overflow-hidden">
        <div className="space-y-4 max-w-xl">
          <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-[var(--gold-light)] text-[var(--gold)]">
            <Landmark className="h-6 w-6" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--foreground)] tracking-tight">
            Hoja de Ruta de Expansión del Protocolo
          </h2>
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            Lumina comienza con Salud (MIRA) como caso de uso validado on-chain. Las categorías Ambiental y Educativa están preparadas para activarse cuando sus contratos de oráculo se desplieguen en Soroban.
          </p>
          <ul className="space-y-2 text-xs text-[var(--muted)] leading-relaxed pl-4 list-disc">
            <li><strong className="text-[var(--foreground)]">Fase 2 — Ambiental:</strong> EcoForest con verificación satelital on-chain para reforestación nativa.</li>
            <li><strong className="text-[var(--foreground)]">Fase 3 — Educación:</strong> EducaReFi con micro-becas programables para comunidades rurales.</li>
            <li><strong className="text-[var(--foreground)]">Fase 4 — Social:</strong> Aperturas a verticalidades de vivienda, agua y seguridad alimentaria.</li>
          </ul>
        </div>

        <div className="w-full lg:w-auto flex-shrink-0 grid grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)] text-center">
            <span className="block text-3xl font-extrabold text-[var(--foreground)]">97.5%</span>
            <span className="text-xs text-[var(--muted)] font-bold uppercase tracking-wider block mt-1">Impacto Directo</span>
          </div>
          <div className="p-5 rounded-2xl bg-[var(--teal-light)] border border-teal-500/20 text-center">
            <span className="block text-3xl font-extrabold text-[var(--teal)]">2.5%</span>
            <span className="text-xs text-[var(--teal)] font-bold uppercase tracking-wider block mt-1">Soporte y Expansión</span>
          </div>
        </div>
      </div>

    </div>
  );
}
