"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  BookOpen, ShieldCheck, Cpu, Milestone, Lock, Coins, 
  ArrowRight, Users, Activity, HelpCircle, FileText, CheckCircle
} from "lucide-react";

export default function WhitepaperAndRoadmap() {
  const [activeSection, setActiveSection] = useState<string>("intro");

  const sections = [
    { id: "intro", title: "1. El problema", icon: BookOpen },
    { id: "contract", title: "2. El dinero queda reservado", icon: Lock },
    { id: "security", title: "3. Solo esa app cobra", icon: ShieldCheck },
    { id: "economics", title: "4. 2,5% solo si hubo impacto", icon: Coins },
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
            Lumina ilumina el camino. Conecta a quien quiere ayudar.
            Una factura. El trabajo se hizo. El 97,5% llega. La familia no paga.
          </p>
          <p className="mt-3 text-sm">
            <Link href="/?vista=horizonte#camino" className="text-teal-500 underline font-semibold">
              Abrí el camino
            </Link>
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
                  <h4 className="text-xs font-bold text-teal-400">Lumina ilumina el camino</h4>
                  <p className="text-xs leading-relaxed text-[var(--muted)]">
                    Conecta a quien quiere ayudar. Una factura.
                    La app confirma el trabajo. Si ocurrió, 97,5% a la app. Si no, el
                    capital vuelve. La familia no paga.
                  </p>
                </div>
                <p className="text-sm leading-relaxed text-[var(--muted)]">
                  El capital de impacto necesita velocidad y un recibo que se pueda mostrar.
                  Lumina convierte burocracia en cobro el mismo día. Nacimos en Salta. Visión: escalar desde
                  Argentina al mundo.
                </p>
              </div>
            )}

            {activeSection === "contract" && (
              <div className="space-y-6 animate-fadeIn">
                <h2 className="text-2xl font-serif font-bold text-[var(--foreground)] flex items-center gap-2 border-b border-[var(--border)] pb-3">
                  <Lock className="h-6 w-6 text-teal-400" />
                  2. El dinero queda reservado 12 meses
                </h2>
                <p className="text-sm leading-relaxed text-[var(--muted)]">
                  La empresa paga un servicio. El dinero queda reservado.
                  Solo la app elegida cobra. Si en 12 meses el trabajo no ocurrió, la empresa recupera todo.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--background)]">
                    <h4 className="text-xs font-bold text-[var(--foreground)] flex items-center gap-2 mb-2">
                      <Lock className="h-4 w-4 text-amber-500" />
                      12 meses, o vuelve
                    </h4>
                    <p className="text-[11px] leading-relaxed text-[var(--muted)]">
                      Si la app no confirma el trabajo en 12 meses, la empresa recupera el dinero. Lumina cobra 0%.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--background)]">
                    <h4 className="text-xs font-bold text-[var(--foreground)] flex items-center gap-2 mb-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      El mismo trabajo no se cobra dos veces
                    </h4>
                    <p className="text-[11px] leading-relaxed text-[var(--muted)]">
                      Cada trabajo deja un código único. Si se intenta cobrar el mismo hecho otra vez, el pago se rechaza.
                    </p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-[var(--muted)]">
                  Si una app firma mal, Lumina puede sacarla del camino de inmediato.
                </p>
              </div>
            )}

            {activeSection === "security" && (
              <div className="space-y-6 animate-fadeIn">
                <h2 className="text-2xl font-serif font-bold text-[var(--foreground)] flex items-center gap-2 border-b border-[var(--border)] pb-3">
                  <ShieldCheck className="h-6 w-6 text-teal-400" />
                  3. Solo esa app cobra
                </h2>
                <p className="text-sm leading-relaxed text-[var(--muted)]">
                  La app confirma el trabajo. Nadie más puede cobrar ese pago.
                </p>
                <div className="p-4 rounded-xl bg-slate-950 font-mono text-[11px] text-teal-400 space-y-2 border border-slate-800">
                  <p className="text-slate-500">// Cómo se parte el pago</p>
                  <p>fee de Lumina = 2,5%</p>
                  <p>a la app       = 97,5%</p>
                </div>
                <ul className="list-disc pl-5 space-y-2 text-xs text-[var(--muted)]">
                  <li><strong>App elegida:</strong> otra app no puede vaciar ese pago.</li>
                  <li><strong>Código único:</strong> el mismo trabajo no se cobra dos veces.</li>
                </ul>
              </div>
            )}

            {activeSection === "economics" && (
              <div className="space-y-6 animate-fadeIn">
                <h2 className="text-2xl font-serif font-bold text-[var(--foreground)] flex items-center gap-2 border-b border-[var(--border)] pb-3">
                  <Coins className="h-6 w-6 text-teal-400" />
                  4. 2,5% — solo si hubo impacto
                </h2>
                <p className="text-sm leading-relaxed text-[var(--muted)]">
                  Si no hay trabajo, Lumina cobra 0%. El 2,5% es de Lumina, una sola vez.
                  Adentro lo usamos así: 1% apps, 1% empresas, 0,5% sistema.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--background)]">
                    <span className="text-lg font-bold text-teal-400 font-mono block">1.0%</span>
                    <span className="text-xs font-bold text-[var(--foreground)] block mt-1">Más apps</span>
                    <p className="text-[10px] text-[var(--muted)] mt-1">Para que más equipos se sumen y cobren cuando el trabajo se hizo.</p>
                  </div>
                  <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--background)]">
                    <span className="text-lg font-bold text-green-400 font-mono block">1.0%</span>
                    <span className="text-xs font-bold text-[var(--foreground)] block mt-1">Más empresas</span>
                    <p className="text-[10px] text-[var(--muted)] mt-1">Para que más tesorerías paguen impacto con una factura.</p>
                  </div>
                  <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--background)]">
                    <span className="text-lg font-bold text-emerald-400 font-mono block">0.5%</span>
                    <span className="text-xs font-bold text-[var(--foreground)] block mt-1">Sistema</span>
                    <p className="text-[10px] text-[var(--muted)] mt-1">Para que el cobro llegue y el recibo se vea.</p>
                  </div>
                </div>
                <p className="text-xs text-[var(--muted)] leading-relaxed italic">
                  En montos chicos, Lumina nunca cobra más de lo que se pagó.
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
                  El camino ya existe. Lo que escala es más empresas, más apps y el mismo cobro:
                </p>

                <div className="space-y-4">
                  {[
                    {
                      fase: "En curso",
                      title: "El cobro ya corre",
                      desc: "La empresa paga. La app cobra el 97,5% cuando el trabajo se hizo. USDC de prueba hoy. USDT0 oficial: próximamente."
                    },
                    {
                      fase: "En trabajo",
                      title: "Más de una voz si hay disputa",
                      desc: "Si hay duda sobre un trabajo, instituciones del tercer sector pueden resolverlo. En trabajo."
                    },
                    {
                      fase: "En trabajo",
                      title: "Factura en pesos, de verdad",
                      desc: "Las tesorerías pagan con una factura. El cobro no cambia. En trabajo."
                    },
                    {
                      fase: "Próximamente",
                      title: "Más apps en el mismo camino",
                      desc: "MIRA u otras confirman el trabajo igual. Sumarse es una ficha, no otro producto."
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
                  Impacto sin fricción. Una factura. Un trabajo hecho. El 97,5% a la app.{" "}
                  <Link href="/?vista=horizonte#camino" className="text-teal-400 underline font-semibold">
                    Abrí el camino interactivo
                  </Link>
                  : elegí un nodo y se ilumina lo que se conecta.
                </p>
                <ol className="text-sm text-[var(--muted)] space-y-3 list-decimal pl-5">
                  <li>
                    <strong className="text-[var(--foreground)]">Inicio.</strong> Lumina ilumina el
                    camino. Conecta a quien quiere ayudar. La familia no paga. Hoy hay una luz;
                    el horizonte muestra el riel lleno.
                  </li>
                  <li>
                    <strong className="text-[var(--foreground)]">Empresas en Lumina.</strong>{" "}
                    Factura. Panel: 10 niño-mes. PDF.
                  </li>
                  <li>
                    <strong className="text-[var(--foreground)]">Probar Lumina.</strong> Un pago de
                    prueba y elegís qué financiar.
                  </li>
                  <li>
                    <strong className="text-[var(--foreground)]">Confirmar.</strong> La app
                    dice que el trabajo se hizo. 97,5% a la app. Recibo Lumina.
                  </li>
                  <li>
                    <strong className="text-[var(--foreground)]">Recibos Lumina.</strong> Se ve
                    el pago. USDT0: próximamente.
                  </li>
                  <li>
                    <strong className="text-[var(--foreground)]">Cierre.</strong> Apps en Lumina.
                    PuenteMAE es ayuda a docentes. Lumina cobra 0% si no hubo trabajo.
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