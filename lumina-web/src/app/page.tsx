"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCountUp } from "@/hooks/useCountUp";
import { 
  ShieldCheck, Heart, Users, Coins, ArrowRight, Cpu, Sparkles, 
  Scale, Landmark, BarChart3, Lock, Search, Globe, Trophy, MapPin,
  Activity, AlertTriangle
} from "lucide-react";


interface SponsorProfile {
  name: string;
  logo: string;
  totalUSDC: number;
  completedImpact: number;
  badgeLevel: string;
  category: string;
  verifiedReports: { id: string; app: string; hash: string; date: string }[];
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string | null>("sponsor-b");
  const [mapHoverDot, setMapHoverDot] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");

  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const [custodiaCount, custodiaRef] = useCountUp(300); // 3 sponsors * 100 USDC = 300 USDC total
  const [impactosCount, impactosRef] = useCountUp(6); // 3 + 2 + 1 = 6 hitos reales/simulados
  const [sponsorsCount, sponsorsRef] = useCountUp(3); // 3 sponsors demo activos
  const [reputacionCount, reputacionRef] = useCountUp(6);

  const [familiasCount, familiasRef] = useCountUp(0);
  const [mchatCount, mchatRef] = useCountUp(83); // Sensibilidad clínica M-CHAT (validado científicamente)
  const [fondosCount, fondosRef] = useCountUp(97); // 97.5% al impacto (modelo de fee, no métrica real)


  const brandsData: Record<string, SponsorProfile> = {
    "sponsor-a": {
      name: "Alimentos Australes S.A.",
      logo: "🌾",
      totalUSDC: 100,
      completedImpact: 3,
      badgeLevel: "Oro Soulbound",
      category: "Salud y Ecología",
      verifiedReports: [
        { id: "101", app: "MIRA AI", hash: "a3f5b8e901a23b456c7d8e90fa123b456c7d8e90fa123b456c7d8e90fa123b45", date: "Hace 1 día" },
        { id: "102", app: "EcoForest", hash: "ecoforest-mock-hash", date: "Hace 3 días" },
        { id: "103", app: "FitSteps", hash: "fitsteps-mock-hash", date: "Hace 5 días" },
      ],
    },
    "sponsor-b": {
      name: "Pampa Banco Digital",
      logo: "💳",
      totalUSDC: 100,
      completedImpact: 2,
      badgeLevel: "Platino Soulbound",
      category: "Causas Sociales",
      verifiedReports: [
        { id: "201", app: "MIRA AI", hash: "f5b8e901a23b456c7d8e90fa123b456c7d8e90fa123b456c7d8e90fa123b45c3", date: "Hace 4 horas" },
        { id: "202", app: "MIRA AI", hash: "c7d8e90fa123b456c7d8e90fa123b456c7d8e90fa123b456c7d8e90fa123b456", date: "Hace 2 días" },
      ],
    },
    "sponsor-c": {
      name: "Andes Energy",
      logo: "⚡",
      totalUSDC: 100,
      completedImpact: 1,
      badgeLevel: "Plata Soulbound",
      category: "Salud Infantil",
      verifiedReports: [
        { id: "301", app: "MIRA AI", hash: "f5b8e901a23b456c7d8e90fa123b456c7d8e90fa123b456c7d8e90fa123b45c3", date: "Hace 1 hora" },
      ],
    },
  };

  const activeSponsors = Object.values(brandsData).filter(
    (b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-16 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-24">
      {/* Background Decorative */}
      <div className="fixed top-20 left-10 w-72 h-72 rounded-full bg-[var(--glow-primary)] blur-3xl pointer-events-none" />
      <div className="fixed bottom-10 right-10 w-96 h-96 rounded-full bg-[var(--glow-secondary)] blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <div className={`max-w-4xl text-center space-y-8 z-10 pt-8 fade-in-up ${isVisible ? 'visible' : ''}`}>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--teal-light)] bg-[var(--teal-light)] text-[var(--teal)] text-xs font-semibold tracking-wide uppercase">
          <Sparkles className="h-3.5 w-3.5" /> Infraestructura ReFi Universal · Stellar Soroban
        </div>
        
        <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-[var(--foreground)] leading-tight">
          Capa de Infraestructura ReFi para el <span className="text-gradient">Financiamiento de Hitos de Impacto</span>
        </h1>

        
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-[var(--muted)] leading-relaxed">
          Infraestructura universal y agnóstica de Economía Regenerativa (ReFi) para el financiamiento programable de hitos de impacto — Ambiental, Social, Educación y Salud — con trazabilidad criptográfica en Stellar.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/invest"
            id="btn-hero-invest"
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-green-600 px-8 py-4 text-base font-semibold text-white shadow-lg hover:from-teal-700 hover:to-green-700 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            Invertir en Impacto
            <ArrowRight className="h-5 w-5" />
          </Link>
          <a
            href="#marketplace"
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] px-8 py-4 text-base font-semibold text-[var(--foreground)] hover:bg-[var(--teal-light)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            Explorar Marketplace
          </a>
        </div>
      </div>

      {/* Trust Bar */}
      <div className={`w-full py-6 border-y border-[var(--border)] bg-gradient-to-r from-transparent via-[var(--card-bg)] to-transparent flex flex-wrap items-center justify-center gap-12 sm:gap-24 opacity-80 z-10 fade-in-up ${isVisible ? 'visible' : ''}`}>
        <div className="flex items-center gap-2 group cursor-pointer hover:opacity-100 transition-opacity">
          <svg className="h-6 w-6 text-[var(--muted)] group-hover:text-[var(--foreground)] transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--muted)] group-hover:text-[var(--foreground)] transition-colors">
            Stellar Network
          </span>
        </div>

        <div className="flex items-center gap-2 group cursor-pointer hover:opacity-100 transition-opacity">
          <svg className="h-6 w-6 text-[var(--muted)] group-hover:text-[var(--foreground)] transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--muted)] group-hover:text-[var(--foreground)] transition-colors">
            Soroban Smart Contracts
          </span>
        </div>

        <div className="flex items-center gap-2 group cursor-pointer hover:opacity-100 transition-opacity">
          <div className="h-6 w-6 rounded-full bg-[var(--muted)] group-hover:bg-emerald-500 text-[var(--background)] flex items-center justify-center font-bold text-xs transition-all font-mono">
            $
          </div>
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--muted)] group-hover:text-[var(--foreground)] transition-colors">
            USDC Collateralized
          </span>
        </div>
      </div>

      {/* Protocol Stats Board */}
      <div className={`w-full grid grid-cols-2 md:grid-cols-4 gap-4 z-10 stagger ${isVisible ? 'visible' : ''}`}>
        {[
          { label: "Garantías en Custodia", value: `${custodiaCount.toLocaleString()} USDC`, icon: ShieldCheck, color: "text-green-500", ref: custodiaRef },
          { label: "Impactos Financiados", value: `${impactosCount} Casos`, icon: Heart, color: "text-[var(--danger)]", ref: impactosRef },
          { label: "Patrocinadores Activos", value: `${sponsorsCount} Corporativos`, icon: Users, color: "text-teal-500", ref: sponsorsRef },
          { label: "Reputación Acumulada", value: `${reputacionCount} LUMINA`, icon: Coins, color: "text-[var(--warn)]", ref: reputacionRef },
        ].map((stat, i) => (
          <div key={i} ref={stat.ref} className="glass-card p-6 rounded-2xl flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">{stat.label}</span>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <span className="text-2xl font-bold tracking-tight text-[var(--foreground)] font-mono">{stat.value}</span>
          </div>
        ))}
      </div>


      {/* IMPACTO HUMANO — imagery section */}
      <div className="w-full z-10">
        <div className="glass-card p-8 sm:p-12 rounded-3xl border border-[var(--card-border)] bg-gradient-to-br from-[var(--teal-light)] via-transparent to-[var(--green-light)] flex flex-col lg:flex-row items-center gap-8 lg:gap-16 relative overflow-hidden">
          <div className="flex-shrink-0 w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-hidden ring-4 ring-[var(--teal-light)] shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&crop=face"
              alt="Familia con niño - detección temprana"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="space-y-4 max-w-xl text-center lg:text-left">
            <span className="text-xs font-bold text-teal-600 uppercase tracking-widest block">El Impacto Real</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[var(--foreground)] tracking-tight">
              Detrás de Cada Hito Hay una Familia
            </h2>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              Cada screening de neurodesarrollo financiado a través de Lumina significa una familia que recibe 
              orientación temprana. Cada hito verificado on-chain representa un niño o niña que puede acceder 
              a intervención temprana — el factor más determinante para el pronóstico del TEA.
            </p>
            <div className="grid grid-cols-3 gap-4 pt-4">
              {[
                { value: `${familiasCount}`, label: "Familias alcanzadas", ref: familiasRef },
                { value: `${mchatCount}%`, label: "Sensibilidad M-CHAT", ref: mchatRef },
                { value: `${fondosCount}.5%`, label: "Fondos a impacto", ref: fondosRef },
              ].map((m, i) => (
                <div key={i} ref={m.ref} className="text-center">
                  <div className="font-serif text-2xl font-bold text-teal-600 font-mono">{m.value}</div>
                  <div className="text-xs text-[var(--muted)]">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CÓMO FUNCIONA */}
      <div className="w-full space-y-12 z-10 pt-12 border-t border-[var(--border)]">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold text-teal-600 uppercase tracking-widest block">Paso a Paso</span>
          <h2 className="font-serif text-3xl font-bold text-[var(--foreground)] tracking-tight">Cómo Funciona Lumina</h2>
          <p className="text-xs text-[var(--muted)] max-w-md mx-auto">
            El ciclo de confianza trazable on-chain en Stellar, desde el depósito de fondos hasta la prueba de impacto.
          </p>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-4 gap-6 relative stagger ${isVisible ? 'visible' : ''}`}>
          {/* Connector Line on desktop */}
          <div className="hidden md:block absolute top-1/2 left-4 right-4 h-0.5 bg-gradient-to-r from-teal-600/30 to-green-600/30 -translate-y-1/2 z-0" />
          
          {[
            {
              step: "01",
              title: "Depósito de RSE",
              desc: "El sponsor deposita USDC en el Lumina Escrow on-chain fijando las reglas de liberación.",
              icon: Coins,
              color: "text-teal-500",
              bgColor: "bg-teal-500/10",
            },
            {
              step: "02",
              title: "Ejecución de Impacto",
              desc: "La app autorizada (como MIRA AI) ejecuta las evaluaciones y genera reportes médicos.",
              icon: Activity,
              color: "text-emerald-500",
              bgColor: "bg-emerald-500/10",
            },
            {
              step: "03",
              title: "Prueba de Hito",
              desc: "Se notariza el hash del reporte PDF en la blockchain de Stellar para certificar su validez.",
              icon: ShieldCheck,
              color: "text-[var(--gold)]",
              bgColor: "bg-[var(--gold-light)]",
            },
            {
              step: "04",
              title: "Pago & Reputación",
              desc: "El escrow de Soroban paga a la app y acuña reputación $LUMINA Soulbound al sponsor.",
              icon: Trophy,
              color: "text-indigo-400",
              bgColor: "bg-indigo-500/10",
            },
          ].map((item, index) => (
            <div key={index} className="glass-card p-6 rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] flex flex-col justify-between space-y-6 relative z-10 hover:border-teal-500/50 hover:scale-105 transition-all duration-300 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-extrabold text-[var(--muted)]/20 font-serif">{item.step}</span>
                <span className={`p-2.5 rounded-xl ${item.bgColor} ${item.color}`}>
                  <item.icon className="h-5 w-5" />
                </span>
              </div>
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">{item.title}</h3>
                <p className="text-xs text-[var(--muted)] leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>


      {/* MARKETPLACE DE PROYECTOS DE IMPACTO */}
      <div id="marketplace" className="w-full space-y-8 z-10 pt-12 border-t border-[var(--border)]">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold text-teal-600 uppercase tracking-widest block">Proyectos Disponibles</span>
          <h2 className="font-serif text-3xl font-bold text-[var(--foreground)] tracking-tight">Marketplace de Impacto</h2>
          <p className="text-xs text-[var(--muted)] max-w-md mx-auto">
            Seleccioná la causa en la que querés delegar tus garantías. El pago solo se libera al verificar el hito.
          </p>
        </div>

        {/* Explicación de App Verificadora */}
        <div className="max-w-3xl mx-auto p-6 rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] text-center text-xs text-[var(--muted)] space-y-2">
          <strong className="text-[var(--foreground)] block text-sm">¿Qué es una App Verificadora?</strong>
          <p className="leading-relaxed">
            ¿Qué es una App Verificadora? Es cualquier aplicación (como un test médico digital, una app de deporte, o análisis satelital) que certifica un hito real. Al confirmarse la acción, la app firma criptográficamente y el contrato en Stellar libera los fondos automáticamente.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* MIRA AI */}
          <div className="glass-card rounded-2xl border border-[var(--card-border)] overflow-hidden flex flex-col">
            <div className="h-40 bg-gradient-to-br from-teal-600/20 to-teal-800/20 relative overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=300&fit=crop"
                alt="MIRA AI - Screening de Neurodesarrollo"
                className="w-full h-full object-cover opacity-70"
                loading="lazy"
              />
              <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-teal-900/80 border border-teal-500/30 px-2 py-0.5 rounded-full backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  PROBAR EN VIVO - STELLAR TESTNET
                </span>
              </div>
            </div>
            <div className="p-8 flex flex-col justify-between flex-grow space-y-6">
              <div className="space-y-4">
                <span className="p-3 rounded-xl bg-[var(--teal-light)] text-teal-600 block w-fit">
                  <Cpu className="h-6 w-6" />
                </span>
                <h3 className="text-lg font-bold text-[var(--foreground)]">MIRA AI — Cribado de Neurodesarrollo</h3>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  Cuestionario de cribado completado por los padres y su informe PDF resultante para llevar al pediatra. La aplicación MIRA firma digitalmente el hash de este informe para certificar que el screening se realizó con éxito sin revelar datos personales.
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-t border-[var(--border)] pt-4">
                  <span className="text-xs text-[var(--muted)]">Tarifa fija por Hito:</span>
                  <strong className="text-[var(--foreground)] font-mono text-base">40.00 USDC</strong>
                </div>
                <Link
                  href="/invest"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-green-600 py-3 text-xs font-bold text-white shadow-md hover:from-teal-700 hover:to-green-700 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  Verificar en Vivo
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* FitSteps */}
          <div className="glass-card rounded-2xl border border-[var(--card-border)] overflow-hidden flex flex-col grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
            <div className="h-40 bg-gradient-to-br from-zinc-700/20 to-zinc-900/20 relative overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&h=300&fit=crop"
                alt="FitSteps - Hábitos Saludables"
                className="w-full h-full object-cover opacity-70"
                loading="lazy"
              />
              <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-zinc-900/80 border border-zinc-700/50 px-2 py-0.5 rounded-full backdrop-blur-sm">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  DEMO CONCEPTUAL
                </span>
              </div>
            </div>
            <div className="p-8 flex flex-col justify-between flex-grow space-y-6">
              <div className="space-y-4">
                <span className="p-3 rounded-xl bg-zinc-800 text-zinc-400 block w-fit">
                  <Activity className="h-6 w-6" />
                </span>
                <h3 className="text-lg font-bold text-[var(--foreground)]">FitSteps — Hábitos Saludables</h3>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  Financiamiento de hábitos de movimiento saludable. 20 adultos mayores completan 1 hora de caminata diaria, verificado por smartwatch o sensores móviles.
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-t border-[var(--border)] pt-4">
                  <span className="text-xs text-[var(--muted)]">Tarifa fija por Hito:</span>
                  <strong className="text-[var(--foreground)] font-mono text-base">1.50 USDC</strong>
                </div>
                <button
                  onClick={() => {
                    setModalTitle("FitSteps — Hábitos Saludables");
                    setModalOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] py-3 text-xs font-bold text-[var(--foreground)] hover:bg-[var(--teal-light)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  Ver Demo
                </button>
              </div>
            </div>
          </div>

          {/* EcoForest */}
          <div className="glass-card rounded-2xl border border-[var(--card-border)] overflow-hidden flex flex-col grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
            <div className="h-40 bg-gradient-to-br from-zinc-700/20 to-zinc-900/20 relative overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&h=300&fit=crop"
                alt="EcoForest - Reforestación Nativa"
                className="w-full h-full object-cover opacity-70"
                loading="lazy"
              />
              <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-zinc-900/80 border border-zinc-700/50 px-2 py-0.5 rounded-full backdrop-blur-sm">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  DEMO CONCEPTUAL
                </span>
              </div>
            </div>
            <div className="p-8 flex flex-col justify-between flex-grow space-y-6">
              <div className="space-y-4">
                <span className="p-3 rounded-xl bg-zinc-800 text-zinc-400 block w-fit">
                  <Globe className="h-6 w-6" />
                </span>
                <h3 className="text-lg font-bold text-[var(--foreground)]">EcoForest — Reforestación Nativa</h3>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  Siembra y cuidado auditado de árboles nativos en zonas degradadas, verificado on-chain por imágenes satelitales.
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-t border-[var(--border)] pt-4">
                  <span className="text-xs text-[var(--muted)]">Tarifa fija por Hito:</span>
                  <strong className="text-[var(--foreground)] font-mono text-base">5.00 USDC</strong>
                </div>
                <button
                  onClick={() => {
                    setModalTitle("EcoForest — Reforestación Nativa");
                    setModalOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] py-3 text-xs font-bold text-[var(--foreground)] hover:bg-[var(--teal-light)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  Ver Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DIRECTORIO PÚBLICO DE SPONSORS */}
      <div className="w-full space-y-8 z-10 pt-12 border-t border-[var(--border)]">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold text-teal-600 uppercase tracking-widest block">Transparencia ESG</span>
          <h2 className="font-serif text-3xl font-bold text-[var(--foreground)] tracking-tight">Directorio Público de Sponsors</h2>
          <p className="text-xs text-[var(--muted)] max-w-md mx-auto">
            Auditá los reportes y badges reputacionales de las marcas que financian causas de impacto a través de Lumina.
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--muted)]" />
          <input
            type="text"
            placeholder="Buscar marcas comprometidas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--card-bg)] border border-[var(--border)] rounded-xl pl-12 pr-4 py-3.5 text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-teal-500 text-xs"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-3">
            {activeSponsors.map((b) => (
              <button
                key={b.name}
                onClick={() => setSelectedBrand(b.name.toLowerCase().includes("a") ? "sponsor-a" : b.name.toLowerCase().includes("b") ? "sponsor-b" : "sponsor-c")}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                  selectedBrand === (b.name.toLowerCase().includes("a") ? "sponsor-a" : b.name.toLowerCase().includes("b") ? "sponsor-b" : "sponsor-c")
                    ? "border-teal-500 bg-[var(--teal-light)] text-[var(--foreground)]"
                    : "border-[var(--border)] bg-transparent hover:border-[var(--teal-light)] text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{b.logo}</span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-[var(--foreground)]">{b.name}</h4>
                      <span className="px-1 py-0.2 bg-zinc-500/10 text-zinc-500 text-[8px] font-bold uppercase rounded border border-zinc-500/15">Simulado</span>
                    </div>
                    <span className="text-xs block text-[var(--muted)]">{b.category}</span>
                  </div>
                </div>
                <span className="text-xs font-bold font-mono text-teal-600">{b.completedImpact} hitos</span>
              </button>
            ))}
          </div>

          <div className="lg:col-span-2">
            {selectedBrand && brandsData[selectedBrand] && (
              <div className="glass-card p-6 rounded-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{brandsData[selectedBrand].logo}</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold text-[var(--foreground)]">{brandsData[selectedBrand].name}</h3>
                        <span className="px-1.5 py-0.5 bg-zinc-500/10 text-zinc-500 text-[9px] font-bold uppercase rounded border border-zinc-500/15">Simulado</span>
                      </div>
                      <span className="text-xs text-teal-600">{brandsData[selectedBrand].category}</span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[var(--teal-light)] text-teal-600 border border-[var(--teal-light)]">
                    <ShieldCheck className="h-3 w-3" /> {brandsData[selectedBrand].badgeLevel}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[var(--muted-bg)] p-3 rounded-xl border border-[var(--border)]">
                    <span className="text-xs font-bold text-[var(--muted)] uppercase block mb-0.5">Volumen Total Custodiado</span>
                    <strong className="text-sm text-[var(--foreground)] font-mono">{brandsData[selectedBrand].totalUSDC.toLocaleString()} USDC</strong>
                  </div>
                  <div className="bg-[var(--muted-bg)] p-3 rounded-xl border border-[var(--border)]">
                    <span className="text-xs font-bold text-[var(--muted)] uppercase block mb-0.5">Hitos Financiados</span>
                    <strong className="text-sm text-[var(--foreground)] font-mono">{brandsData[selectedBrand].completedImpact} Evaluaciones</strong>
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest block">Historial de Impacto Auditado</span>
                  
                  <div className="border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--muted-bg)] text-xs">
                    <div className="bg-[var(--teal-light)] p-2.5 font-bold text-[var(--teal)] grid grid-cols-3 border-b border-[var(--border)] text-xs">
                      <span>APLICACIÓN</span>
                      <span>HASH DE REPORTE</span>
                      <span className="text-right">AUDITORÍA</span>
                    </div>
                    <div className="divide-y divide-[var(--border)] max-h-[140px] overflow-y-auto custom-scrollbar">
                      {brandsData[selectedBrand].verifiedReports.map((r) => {
                        const isSimulated = r.app === "EcoForest" || r.app === "FitSteps";
                        return (
                          <div key={r.id} className="p-2.5 grid grid-cols-3 items-center text-xs text-[var(--muted)] hover:text-[var(--foreground)]">
                            <span className="font-semibold">{r.app}</span>
                            <span className="font-mono text-xs break-all pr-2">
                              {isSimulated ? `[Simulación - ${r.app} Demo]` : `${r.hash.slice(0, 16)}...`}
                            </span>
                            {isSimulated ? (
                              <span className="text-zinc-500 text-right font-semibold italic">
                                Mock Data
                              </span>
                            ) : (
                              <a 
                                href={`https://stellar.expert/explorer/testnet/tx/${r.hash}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-teal-600 hover:underline text-right font-semibold"
                              >
                                Ver Bloque →
                              </a>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MAPA DE IMPACTO Y LEADERBOARD */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8 z-10 pt-12 border-t border-[var(--border)]">
        
        {/* Mapa de Argentina */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
              <MapPin className="h-5 w-5 text-teal-600" /> Geografía de Impacto
            </h3>
            <p className="text-xs text-[var(--muted)] mt-1">
              Hitos concretados on-chain por provincia. Los datos se actualizan con cada verificación de impacto.
            </p>
          </div>

          <div className="relative w-full h-[300px] bg-[var(--muted-bg)] rounded-xl border border-[var(--border)] flex items-center justify-center overflow-hidden">
            <svg className="w-full h-full" viewBox="0 0 400 350" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Argentina simplified outline */}
              <path
                d="M135,45 L200,42 L222,55 L228,70 L218,85 L213,95 L225,105 
                   L230,125 L218,140 L208,155 L198,175 L193,195 L188,215 
                   L183,235 L178,252 L172,265 L168,275 L158,280 L148,275 
                   L150,262 L155,250 L162,238 L168,220 L163,198 L155,178 
                   L145,160 L135,142 L128,120 L125,100 L125,80 L128,60 Z"
                fill="currentColor"
                className="text-teal-600/10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeOpacity="0.3"
              />

              {/* Buenos Aires */}
              <circle cx="215" cy="115" r="6" fill="#0D5E6A" className="cursor-pointer hover:fill-teal-500 transition-colors" stroke="white" strokeWidth="2"
                onMouseEnter={() => setMapHoverDot("ba")} onMouseLeave={() => setMapHoverDot(null)} />
              {/* Córdoba */}
              <circle cx="180" cy="100" r="5" fill="#0D5E6A" className="cursor-pointer hover:fill-teal-500 transition-colors" stroke="white" strokeWidth="2"
                onMouseEnter={() => setMapHoverDot("cba")} onMouseLeave={() => setMapHoverDot(null)} />
              {/* Misiones */}
              <circle cx="225" cy="62" r="5" fill="#2B9C76" className="cursor-pointer hover:fill-green-400 transition-colors" stroke="white" strokeWidth="2"
                onMouseEnter={() => setMapHoverDot("ms")} onMouseLeave={() => setMapHoverDot(null)} />

              {/* Floating labels */}
              <text x="215" y="108" className="text-[10px] fill-teal-700 dark:fill-teal-400 font-medium" textAnchor="middle">BS AS</text>
              <text x="180" y="93" className="text-[10px] fill-teal-700 dark:fill-teal-400 font-medium" textAnchor="middle">CBA</text>
              <text x="225" y="55" className="text-[10px] fill-green-700 dark:fill-green-400 font-medium" textAnchor="middle">MIS</text>
            </svg>

            {mapHoverDot && (
              <div className="absolute bottom-3 left-3 right-3 bg-[var(--card-bg)] backdrop-blur-xl border border-[var(--border)] rounded-lg p-2.5 text-xs shadow-2xl">
                {mapHoverDot === "ba" && <p className="text-[var(--foreground)]"><strong>Buenos Aires:</strong> 54 evaluaciones MIRA completadas.</p>}
                {mapHoverDot === "cba" && <p className="text-[var(--foreground)]"><strong>Córdoba:</strong> 32 evaluaciones MIRA completadas.</p>}
                {mapHoverDot === "ms" && <p className="text-green-600"><strong>Misiones:</strong> 150 árboles plantados por EcoForest.</p>}
              </div>
            )}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="lg:col-span-1 glass-card p-6 rounded-2xl space-y-4">
          <div>
            <h3 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
              <Trophy className="h-4 w-4 text-teal-600" /> Leaderboard de RSE
            </h3>
            <p className="text-xs text-[var(--muted)]">
              Ranking regional de patrocinadores según el volumen de impacto verificado.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { rank: "#1", emoji: "💳", name: "Pampa Banco Digital", badge: "Platino", amount: "Testnet" },
              { rank: "#2", emoji: "🌾", name: "Alimentos Australes S.A.", badge: "Oro", amount: "Testnet" },
              { rank: "#3", emoji: "⚡", name: "Andes Energy", badge: "Plata", amount: "Testnet" }
            ].map((lead, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-[var(--border)] bg-[var(--muted-bg)]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[var(--muted)]">{lead.rank}</span>
                  <span className="text-sm">{lead.emoji}</span>
                  <div>
                    <h4 className="text-xs font-bold text-[var(--foreground)]">{lead.name}</h4>
                    <span className="text-xs text-teal-600">{lead.badge}</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-[var(--foreground)] font-mono">{lead.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* NOTA DE DESARROLLO / TRANSPARENCIA */}
      <p className="w-full text-center text-[10px] text-[var(--muted)]/60 font-mono tracking-wide z-10 -mt-4">
        * Nota: Los perfiles corporativos, balances e hitos históricos de este directorio corresponden a datos simulados con fines de demostración durante la etapa de desarrollo y evaluación del protocolo.
      </p>

      {/* Dual Audience Value Propositions */}
      <div className="w-full space-y-12 z-10 pt-12 border-t border-[var(--border)]">
        <div className="text-center space-y-4">
          <h2 className="font-serif text-3xl font-bold text-[var(--foreground)] tracking-tight">
            Diseñado para Finanzas Tradicionales e Innovación Web3
          </h2>
          <p className="max-w-xl mx-auto text-sm text-[var(--muted)]">
            Unimos las exigencias de cumplimiento corporativo y ESG con la seguridad criptográfica del ecosistema DeFi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-card p-8 rounded-2xl border border-[var(--card-border)] space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-[var(--teal-light)] text-teal-600">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-[var(--foreground)]">Para Directores de RSE y Fondos ESG</h3>
            </div>
            <ul className="space-y-4 text-sm text-[var(--muted)]">
              <li className="flex items-start gap-2">
                <ShieldCheck className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span><strong className="text-[var(--foreground)]">Trazabilidad de Auditoría:</strong> Cada centavo de RSE liberado cuenta con una prueba criptográfica incuestionable en la blockchain de Stellar, visible en tiempo real.</span>
              </li>
              <li className="flex items-start gap-2">
                <Lock className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span><strong className="text-[var(--foreground)]">Privacidad por Diseño (Compliance):</strong> Cumplimos estrictamente con HIPAA y GDPR. No se almacenan datos médicos personales on-chain; solo hashes ciegos (SHA-256) de los reportes.</span>
              </li>
              <li className="flex items-start gap-2">
                <Coins className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span><strong className="text-[var(--foreground)]">Eficiencia de Costos:</strong> Eliminamos los intermediarios administrativos y gestores de donaciones, canalizando el 97.5% de los fondos directo a financiar las evaluaciones.</span>
              </li>
            </ul>
          </div>

          <div className="glass-card p-8 rounded-2xl border border-[var(--card-border)] space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-[var(--green-light)] text-green-600">
                <Scale className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-[var(--foreground)]">Para Inversores y Constructores Web3</h3>
            </div>
            <ul className="space-y-4 text-sm text-[var(--muted)]">
              <li className="flex items-start gap-2">
                <Cpu className="h-5 w-5 text-teal-500 flex-shrink-0 mt-0.5" />
                <span><strong className="text-[var(--foreground)]">Oráculos de Impacto Descentralizados:</strong> El contrato de Soroban cuenta con un registro de oráculos autorizados administrado por el Admin, listo para soportar múltiples aplicaciones.</span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="h-5 w-5 text-teal-500 flex-shrink-0 mt-0.5" />
                <span><strong className="text-[var(--foreground)]">Escrow Fideicomisario No Custodio:</strong> Los USDC de garantía quedan custodiados en el smart contract y solo son liberados cuando la app de impacto firma y valida el hash.</span>
              </li>
              <li className="flex items-start gap-2">
                <Coins className="h-5 w-5 text-teal-500 flex-shrink-0 mt-0.5" />
                <span><strong className="text-[var(--foreground)]">Deduplicación On-Chain:</strong> Prevención nativa contra el doble cobro mediante almacenamiento persistente eficiente del hash criptográfico del reporte en Soroban.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Sustainable Funding Section */}
      <div className="w-full glass-card p-8 sm:p-12 rounded-3xl border border-[var(--card-border)] bg-gradient-to-br from-[var(--teal-light)] via-transparent to-[var(--green-light)] flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 z-10 relative overflow-hidden">
        <div className="space-y-4 max-w-xl">
          <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-[var(--gold-light)] text-[var(--gold)]">
            <Landmark className="h-6 w-6" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--foreground)] tracking-tight">
            Sustentabilidad: Riel de Incentivos del Protocolo
          </h2>
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            Lumina implementa una comisión del <strong className="text-[var(--foreground)]">2.5%</strong> sobre cada liberación de impacto completada con éxito. Este fee autofinancia la expansión del ecosistema:
          </p>
          <ul className="space-y-2 text-xs text-[var(--muted)] leading-relaxed pl-4 list-disc">
            <li><strong className="text-[var(--foreground)]">1.0% para Desarrollo Abierto:</strong> Incentivos directos para programadores independientes que conecten nuevas aplicaciones.</li>
            <li><strong className="text-[var(--foreground)]">1.0% para Difusión:</strong> Campañas de marketing corporativo para captar patrocinadores del mundo tradicional.</li>
            <li><strong className="text-[var(--foreground)]">0.5% para Infraestructura:</strong> Mantenimiento de nodos RPC, hosting y soporte técnico.</li>
          </ul>
        </div>

        <div className="w-full lg:w-auto flex-shrink-0 grid grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)] text-center">
            <span className="block text-3xl font-extrabold text-[var(--foreground)]">97.5%</span>
            <span className="text-xs text-[var(--muted)] font-bold uppercase tracking-wider block mt-1">Impacto Directo</span>
          </div>
          <div className="p-5 rounded-2xl bg-[var(--teal-light)] border border-teal-500/20 text-center">
            <span className="block text-3xl font-extrabold text-teal-600">2.5%</span>
            <span className="text-xs text-teal-600 font-bold uppercase tracking-wider block mt-1">Soporte, Devs y Difusión</span>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-card max-w-md w-full p-6 rounded-2xl space-y-4 border border-[var(--border)] relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-[var(--muted)] hover:text-[var(--foreground)] font-bold text-lg cursor-pointer"
            >
              ✕
            </button>
            <div className="space-y-3">
              <h3 className="text-lg font-bold font-serif text-[var(--foreground)] flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-teal-500" />
                {modalTitle}
              </h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Esta es una simulación visual del potencial de Lumina para múltiples verticales de impacto. La lógica on-chain definitiva compartirá la arquitectura de nuestra integración viva con MIRA.
              </p>
            </div>
            <button
              onClick={() => setModalOpen(false)}
              className="w-full bg-teal-600 hover:bg-teal-500 py-3 text-xs font-bold text-white rounded-xl shadow-lg transition-all cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
