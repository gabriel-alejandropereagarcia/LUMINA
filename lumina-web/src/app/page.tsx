"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCountUp } from "@/hooks/useCountUp";
import { 
  ShieldCheck, Heart, Users, Coins, ArrowRight, Cpu, Sparkles, 
  Scale, Landmark, BarChart3, Lock, Globe, Trophy, MapPin,
  Activity, AlertTriangle, GraduationCap, Plug
} from "lucide-react";
import { IMPACT_APPS } from "@/lib/impact-apps";

export default function Home() {
  const [mapHoverDot, setMapHoverDot] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");

  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const [feeCount, feeRef] = useCountUp(25);
  const [lockCount, lockRef] = useCountUp(12);
  const [appsCount, appsRef] = useCountUp(IMPACT_APPS.length);
  const [payoutCount, payoutRef] = useCountUp(975);

  const [familiasCount, familiasRef] = useCountUp(IMPACT_APPS.length);
  const [mchatCount, mchatRef] = useCountUp(0);
  const [fondosCount, fondosRef] = useCountUp(97);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-16 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-24">
      {/* Background Decorative */}
      <div className="fixed top-20 left-10 w-72 h-72 rounded-full bg-[var(--glow-primary)] blur-3xl pointer-events-none" />
      <div className="fixed bottom-10 right-10 w-96 h-96 rounded-full bg-[var(--glow-secondary)] blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <div className={`max-w-4xl text-center space-y-8 z-10 pt-8 fade-in-up ${isVisible ? 'visible' : ''}`}>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--teal-light)] bg-[var(--teal-light)] text-[var(--teal)] text-xs font-semibold tracking-wide uppercase">
          <Sparkles className="h-3.5 w-3.5" /> Lumina · Impacto sin fricción
        </div>
        
        <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-[var(--foreground)] leading-tight">
          Impacto <span className="text-gradient">sin fricción</span>
        </h1>

        
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-[var(--muted)] leading-relaxed">
          Hoy una empresa quiere financiar salud, educación o asistencia. Una familia lo
          necesita. El capital se pierde en informes y meses de espera. Lumina lo resuelve:
          una factura, el 97,5% a la app, el usuario final nunca paga.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/empresa"
            id="btn-hero-empresa"
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-green-600 px-8 py-4 text-base font-semibold text-white shadow-lg hover:from-teal-700 hover:to-green-700 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            Soy empresa
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="/connect"
            id="btn-hero-connect"
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] px-8 py-4 text-base font-semibold text-[var(--foreground)] hover:bg-[var(--teal-light)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            Tengo una app
          </Link>
        </div>
        <p className="text-xs text-[var(--muted)]">
          <Link href="/connect#registro" className="text-teal-600 underline">
            Sumá tu app
          </Link>
          {" · "}
          <Link href="/jury" className="text-teal-600 underline">
            Ver comprobantes
          </Link>
        </p>
      </div>

      {/* Trust Bar */}
      <div className={`w-full py-6 border-y border-[var(--border)] bg-gradient-to-r from-transparent via-[var(--card-bg)] to-transparent flex flex-wrap items-center justify-center gap-12 sm:gap-24 opacity-80 z-10 fade-in-up ${isVisible ? 'visible' : ''}`}>
        <div className="flex items-center gap-2 group cursor-pointer hover:opacity-100 transition-opacity">
          <svg className="h-6 w-6 text-[var(--muted)] group-hover:text-[var(--foreground)] transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--muted)] group-hover:text-[var(--foreground)] transition-colors">
            Recibo público
          </span>
        </div>

        <div className="flex items-center gap-2 group cursor-pointer hover:opacity-100 transition-opacity">
          <svg className="h-6 w-6 text-[var(--muted)] group-hover:text-[var(--foreground)] transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--muted)] group-hover:text-[var(--foreground)] transition-colors">
            Pago automático
          </span>
        </div>

        <div className="flex items-center gap-2 group cursor-pointer hover:opacity-100 transition-opacity">
          <div className="h-6 w-6 rounded-full bg-[var(--muted)] group-hover:bg-emerald-500 text-[var(--background)] flex items-center justify-center font-bold text-xs transition-all font-mono">
            $
          </div>
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--muted)] group-hover:text-[var(--foreground)] transition-colors">
            Familia no paga
          </span>
        </div>
      </div>

      {/* Protocol Stats Board */}
      <div className={`w-full grid grid-cols-2 md:grid-cols-4 gap-4 z-10 stagger ${isVisible ? 'visible' : ''}`}>
        {[
          { label: "A la app", value: `${(payoutCount / 10).toFixed(1)}%`, icon: ShieldCheck, color: "text-green-500", ref: payoutRef },
          { label: "Si no ocurre, se devuelve", value: `${lockCount} meses`, icon: Heart, color: "text-[var(--danger)]", ref: lockRef },
          { label: "Apps", value: `${appsCount}`, icon: Users, color: "text-teal-500", ref: appsRef },
          { label: "Fee de Lumina", value: `${(feeCount / 10).toFixed(1)}%`, icon: Coins, color: "text-[var(--warn)]", ref: feeRef },
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
            <span className="text-xs font-bold text-teal-600 uppercase tracking-widest block">Tres partes</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[var(--foreground)] tracking-tight">
              Empresa, app y familia. Nadie más en el medio.
            </h2>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              La empresa cubre. Quien necesita no paga. La app cobra cuando el trabajo se hizo.
            </p>
            <div className="grid grid-cols-3 gap-4 pt-4">
              {[
                { value: `${IMPACT_APPS.length}`, label: "App en catálogo", ref: familiasRef },
                { value: `${mchatCount}`, label: "Trabajos cobrados", ref: mchatRef },
                { value: `${fondosCount}.5%`, label: "Llega a la app", ref: fondosRef },
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
          <span className="text-xs font-bold text-teal-600 uppercase tracking-widest block">Un ciclo</span>
          <h2 className="font-serif text-3xl font-bold text-[var(--foreground)] tracking-tight">Cómo funciona</h2>
          <p className="text-xs text-[var(--muted)] max-w-md mx-auto">
            Paga → trabaja → confirma → cobra. Si no ocurrió, la empresa recupera y Lumina cobra 0%.
          </p>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-4 gap-6 relative stagger ${isVisible ? 'visible' : ''}`}>
          {/* Connector Line on desktop */}
          <div className="hidden md:block absolute top-1/2 left-4 right-4 h-0.5 bg-gradient-to-r from-teal-600/30 to-green-600/30 -translate-y-1/2 z-0" />
          
          {[
            {
              step: "01",
              title: "La empresa paga",
              desc: "Una factura, como cualquier proveedor. No abre una cuenta cripto.",
              icon: Coins,
              color: "text-teal-500",
              bgColor: "bg-teal-500/10",
            },
            {
              step: "02",
              title: "La app trabaja",
              desc: "Hace el cribado, el mes de apoyo, lo que sea. Quien lo recibe no paga.",
              icon: Activity,
              color: "text-emerald-500",
              bgColor: "bg-emerald-500/10",
            },
            {
              step: "03",
              title: "Confirma que ocurrió",
              desc: "Unidad y cantidad. Sin DNI. Sin papeles de meses.",
              icon: ShieldCheck,
              color: "text-[var(--gold)]",
              bgColor: "bg-[var(--gold-light)]",
            },
            {
              step: "04",
              title: "Cobra el 97,5%",
              desc: "El mismo día. Lumina se queda 2,5% solo si hubo impacto. La empresa recibe un PDF.",
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
          <span className="text-xs font-bold text-teal-600 uppercase tracking-widest block">Apps de impacto</span>
          <h2 className="font-serif text-3xl font-bold text-[var(--foreground)] tracking-tight">Dos apps. El mismo camino.</h2>
          <p className="text-xs text-[var(--muted)] max-w-lg mx-auto">
            Lumina no es la clínica ni la escuela. Es el medio de pago. Otras apps entran igual.
          </p>
        </div>

        <div className="max-w-3xl mx-auto p-6 rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] text-center text-xs text-[var(--muted)] space-y-2">
          <strong className="text-[var(--foreground)] block text-sm">Sumá tu app</strong>
          <p className="leading-relaxed">
            MIRA hace cribados. PuenteMAE ayuda a docentes. Las dos cobran cuando el trabajo se hizo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {IMPACT_APPS.map((app) => {
            const Icon =
              app.category === "salud"
                ? Cpu
                : app.category === "educacion"
                  ? GraduationCap
                  : app.category === "ambiental"
                    ? Globe
                    : Activity;
            const isLive = app.status === "live";
            return (
              <div
                key={app.id}
                className={`glass-card rounded-2xl border border-[var(--card-border)] overflow-hidden flex flex-col ${
                  isLive ? "" : "grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                }`}
              >
                <div className="h-40 bg-gradient-to-br from-teal-600/20 to-teal-800/20 relative overflow-hidden">
                  <img
                    src={app.image}
                    alt={app.imageAlt}
                    className="w-full h-full object-cover opacity-70"
                    loading="lazy"
                  />
                  <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-2 py-0.5 rounded-full backdrop-blur-sm ${
                    isLive
                      ? "bg-teal-900/80 border border-teal-500/30"
                      : "bg-zinc-900/80 border border-zinc-700/50"
                  }`}>
                    {isLive && (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                    )}
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isLive ? "text-emerald-400" : "text-zinc-400"}`}>
                      {app.statusLabel}
                    </span>
                  </div>
                </div>
                <div className="p-8 flex flex-col justify-between flex-grow space-y-6">
                  <div className="space-y-3">
                    <span className={`p-3 rounded-xl block w-fit ${isLive ? "bg-[var(--teal-light)] text-teal-600" : "bg-zinc-800 text-zinc-400"}`}>
                      <Icon className="h-6 w-6" />
                    </span>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-teal-600">{app.categoryLabel}</p>
                    <h3 className="text-lg font-bold text-[var(--foreground)]">{app.name}</h3>
                    <p className="text-xs text-teal-500 font-semibold">{app.milestone}</p>
                    <p className="text-xs text-[var(--muted)] leading-relaxed">{app.description}</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-t border-[var(--border)] pt-4">
                      <span className="text-xs text-[var(--muted)]">USDC por trabajo</span>
                      <strong className="text-[var(--foreground)] font-mono text-base">{app.priceUsdc.toFixed(2)} USDC</strong>
                    </div>
                    {app.status === "wip" ? (
                      <div className="grid grid-cols-2 gap-2">
                        <Link
                          href={`/invest?app=${app.id}`}
                          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-green-600 py-3 text-xs font-bold text-white shadow-md hover:from-teal-700 hover:to-green-700 transition-all"
                        >
                          Probar un pago
                        </Link>
                        <Link
                          href="/connect"
                          className="flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] py-3 text-xs font-bold text-[var(--foreground)] hover:bg-[var(--teal-light)] transition-all"
                        >
                          Ver la app
                        </Link>
                      </div>
                    ) : isLive ? (
                      <Link
                        href={`/invest?app=${app.id}`}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-green-600 py-3 text-xs font-bold text-white shadow-md hover:from-teal-700 hover:to-green-700 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                      >
                        Pagar este trabajo
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    ) : (
                      <button
                        onClick={() => {
                          setModalTitle(`${app.name} — ${app.categoryLabel}`);
                          setModalOpen(true);
                        }}
                        className="w-full flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] py-3 text-xs font-bold text-[var(--foreground)] hover:bg-[var(--teal-light)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
                      >
                        Cómo se suma
                      </button>
                    )}
                  </div>
                </div>
              </div>
              );
            })}
            <div className="glass-card rounded-2xl border border-dashed border-teal-500/40 p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <span className="p-3 rounded-xl block w-fit bg-[var(--teal-light)] text-teal-600">
                  <Plug className="h-6 w-6" />
                </span>
                <p className="text-[10px] font-bold uppercase tracking-widest text-teal-600">Para apps</p>
                <h3 className="text-lg font-bold text-[var(--foreground)]">Tu app acá</h3>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  Completá una ficha. Cuando el trabajo se hizo, cobrás el 97,5%.
                </p>
              </div>
              <Link
                href="/connect"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 text-xs font-bold text-white"
              >
                Sumarme
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

      {/* DEMO POOL — sin sponsors inventados */}
      <div className="w-full space-y-8 z-10 pt-12 border-t border-[var(--border)]">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold text-teal-600 uppercase tracking-widest block">Recorrido</span>
          <h2 className="font-serif text-3xl font-bold text-[var(--foreground)] tracking-tight">Tres minutos. Un camino.</h2>
          <p className="text-xs text-[var(--muted)] max-w-lg mx-auto">
            Empresa paga la factura. App hace el trabajo. Se ve el comprobante. Nació en Salta.
          </p>
        </div>
        <div className="glass-card p-8 rounded-2xl max-w-2xl mx-auto space-y-4 text-sm text-[var(--muted)]">
          <p>
            Empezá por el portal si pagás el impacto. Por Probar si querés ver el pago en la red.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/empresa" className="rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white">
              Portal Empresa
            </Link>
            <Link href="/invest" className="rounded-xl border border-[var(--border)] px-4 py-2 text-xs font-bold text-[var(--foreground)]">
              Probar un pago
            </Link>
            <Link href="/jury" className="rounded-xl border border-[var(--border)] px-4 py-2 text-xs font-bold text-[var(--foreground)]">
              Comprobantes
            </Link>
          </div>
        </div>
      </div>

      {/* MAPA DE IMPACTO Y LEADERBOARD */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8 z-10 pt-12 border-t border-[var(--border)]">
        
        {/* Mapa de Argentina */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
              <MapPin className="h-5 w-5 text-teal-600" /> Dónde nació
            </h3>
            <p className="text-xs text-[var(--muted)] mt-1">
              Nació en Salta. Los puntos se llenan cuando hay un trabajo cobrado, no con un mapa de marketing.
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
              {/* Salta */}
              <circle cx="155" cy="58" r="6" fill="#2B9C76" className="cursor-pointer hover:fill-green-400 transition-colors" stroke="white" strokeWidth="2"
                onMouseEnter={() => setMapHoverDot("salta")} onMouseLeave={() => setMapHoverDot(null)} />

              {/* Floating labels */}
              <text x="215" y="108" className="text-[10px] fill-teal-700 dark:fill-teal-400 font-medium" textAnchor="middle">CABA</text>
              <text x="180" y="93" className="text-[10px] fill-teal-700 dark:fill-teal-400 font-medium" textAnchor="middle">CBA</text>
              <text x="155" y="50" className="text-[10px] fill-green-700 dark:fill-green-400 font-medium" textAnchor="middle">SALTA</text>
            </svg>

            {mapHoverDot && (
              <div className="absolute bottom-3 left-3 right-3 bg-[var(--card-bg)] backdrop-blur-xl border border-[var(--border)] rounded-lg p-2.5 text-xs shadow-2xl">
                {mapHoverDot === "ba" && <p className="text-[var(--foreground)]"><strong>CABA:</strong> acá se prueba el pago.</p>}
                {mapHoverDot === "cba" && <p className="text-[var(--foreground)]"><strong>Córdoba:</strong> próximamente. El mapa no inventa trabajo.</p>}
                {mapHoverDot === "salta" && <p className="text-[var(--foreground)]"><strong>Salta:</strong> acá nació Lumina. Hub del equipo.</p>}
              </div>
            )}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="lg:col-span-1 glass-card p-6 rounded-2xl space-y-4">
          <div>
            <h3 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
              <Trophy className="h-4 w-4 text-teal-600" /> Trabajos cobrados
            </h3>
            <p className="text-xs text-[var(--muted)]">
              Acá aparecen cuando hay un pago o un cobro. Sin marcas de relleno.
            </p>
          </div>

          <div className="rounded-xl border border-dashed border-[var(--border)] p-6 text-xs text-[var(--muted)] text-center space-y-2">
            <p>El directorio se llena con el primer cobro. Podés ser ese pago.</p>
            <Link href="/invest" className="text-teal-500 underline">Probar un pago</Link>
          </div>
        </div>
      </div>

      {/* NOTA DE DESARROLLO / TRANSPARENCIA */}
      <p className="w-full text-center text-[10px] text-[var(--muted)]/60 font-mono tracking-wide z-10 -mt-4">
        Testnet: USDC Circle. USDT0 oficial: próximamente (solo mainnet).
      </p>

      {/* Dual Audience Value Propositions */}
      <div className="w-full space-y-12 z-10 pt-12 border-t border-[var(--border)]">
        <div className="text-center space-y-4">
          <h2 className="font-serif text-3xl font-bold text-[var(--foreground)] tracking-tight">
            Dos puertas
          </h2>
          <p className="max-w-xl mx-auto text-sm text-[var(--muted)]">
            La empresa entra con una factura. La app cobra cuando el trabajo se hizo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-card p-8 rounded-2xl border border-[var(--card-border)] space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-[var(--teal-light)] text-teal-600">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-[var(--foreground)]">Si sos empresa</h3>
            </div>
            <ul className="space-y-4 text-sm text-[var(--muted)]">
              <li className="flex items-start gap-2">
                <ShieldCheck className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span><strong className="text-[var(--foreground)]">Sabés qué se pagó:</strong> unidades reales y un PDF. El 97,5% llega a la app.</span>
              </li>
              <li className="flex items-start gap-2">
                <Lock className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span><strong className="text-[var(--foreground)]">Privacidad:</strong> no viaja DNI ni clínica.</span>
              </li>
              <li className="flex items-start gap-2">
                <Coins className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span><strong className="text-[var(--foreground)]">Una factura:</strong> pagás como a cualquier proveedor. Fee solo si hubo impacto.</span>
              </li>
            </ul>
          </div>

          <div className="glass-card p-8 rounded-2xl border border-[var(--card-border)] space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-[var(--green-light)] text-green-600">
                <Scale className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-[var(--foreground)]">Si tenés una app</h3>
            </div>
            <ul className="space-y-4 text-sm text-[var(--muted)]">
              <li className="flex items-start gap-2">
                <Cpu className="h-5 w-5 text-teal-500 flex-shrink-0 mt-0.5" />
                <span><strong className="text-[var(--foreground)]">Te sumás:</strong> una ficha. Vos cobrás el 97,5%.</span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="h-5 w-5 text-teal-500 flex-shrink-0 mt-0.5" />
                <span><strong className="text-[var(--foreground)]">Solo tu app:</strong> nadie más cobra ese trabajo.</span>
              </li>
              <li className="flex items-start gap-2">
                <Coins className="h-5 w-5 text-teal-500 flex-shrink-0 mt-0.5" />
                <span><strong className="text-[var(--foreground)]">Sin doble cobro:</strong> el mismo hecho no se paga dos veces.</span>
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
            2,5% solo si hubo impacto
          </h2>
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            A los 12 meses sin trabajo hecho, la empresa retira y Lumina cobra 0%.
            El 2,5% es de Lumina, una sola vez, solo si se pagó el impacto.
          </p>
          <ul className="space-y-2 text-xs text-[var(--muted)] leading-relaxed pl-4 list-disc">
            <li><strong className="text-[var(--foreground)]">1% apps</strong> — para sumar más equipos</li>
            <li><strong className="text-[var(--foreground)]">1% empresas</strong> — para que más tesorerías paguen impacto</li>
            <li><strong className="text-[var(--foreground)]">0,5% sistema</strong> — para que el cobro llegue</li>
          </ul>
        </div>

        <div className="w-full lg:w-auto flex-shrink-0 grid grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)] text-center">
            <span className="block text-3xl font-extrabold text-[var(--foreground)]">97.5%</span>
            <span className="text-xs text-[var(--muted)] font-bold uppercase tracking-wider block mt-1">A la app</span>
          </div>
          <div className="p-5 rounded-2xl bg-[var(--teal-light)] border border-teal-500/20 text-center">
            <span className="block text-3xl font-extrabold text-teal-600">2.5%</span>
            <span className="text-xs text-teal-600 font-bold uppercase tracking-wider block mt-1">Fee de Lumina</span>
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
                Se suma con una ficha. Define el precio del trabajo. Cobra el 97,5% cuando ese trabajo se hizo.
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
