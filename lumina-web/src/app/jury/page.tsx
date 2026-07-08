"use client";

import { 
  ShieldAlert, Scale, HelpCircle, AlertTriangle, 
  Clock, CheckCircle, FileText, ArrowLeft, Ban
} from "lucide-react";
import Link from "next/link";

export default function DisputeResolutionPortal() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-semibold tracking-wide uppercase">
            <Clock className="h-3.5 w-3.5 animate-pulse" />
            Módulo En Desarrollo · Fase 2 de la Hoja de Ruta
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-teal-400 to-green-400 bg-clip-text text-transparent">
            Portal de Arbitraje y Resolución de Disputas
          </h1>
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            Mecanismo descentralizado para auditar reclamaciones de hitos de impacto y resolver disputas comerciales entre sponsors y oráculos validadores de forma transparente.
          </p>
        </div>

        {/* Warning Banner */}
        <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-300 text-xs leading-relaxed space-y-1">
          <span className="font-bold uppercase tracking-wider block">⚠️ ESPECIFICACIÓN DE DISEÑO</span>
          <p>
            Esta sección describe la arquitectura teórica del sistema de arbitraje que se desplegará en la Fase 2. La lógica contractual actual opera de forma automática; este portal servirá de interfaz para la DAO de resolución de disputas cuando el protocolo migre a Mainnet.
          </p>
        </div>

        {/* ¿Cómo funciona el Arbitraje? */}
        <div className="glass-card p-6 sm:p-8 rounded-2xl border border-[var(--border)] space-y-6">
          <h2 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
            <Scale className="h-5 w-5 text-teal-400" />
            Protocolo de Resolución de Conflictos (Dispute Protocol)
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[var(--muted-bg)] border border-[var(--border)] space-y-2">
              <div className="h-8 w-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center font-bold text-xs">
                1
              </div>
              <h4 className="text-xs font-bold text-[var(--foreground)]">Elevación del Reclamo</h4>
              <p className="text-[10px] text-[var(--muted)] leading-relaxed">
                Si un sponsor detecta que un reporte de impacto notarizado SHA-256 es falso o carece de sustento físico, puede congelar el cobro e iniciar una disputa on-chain.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[var(--muted-bg)] border border-[var(--border)] space-y-2">
              <div className="h-8 w-8 rounded-lg bg-yellow-500/10 text-yellow-400 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <h4 className="text-xs font-bold text-[var(--foreground)]">Fase de Auditoría (DAO)</h4>
              <p className="text-[10px] text-[var(--muted)] leading-relaxed">
                Los árbitros elegidos por la gobernanza analizan el hash SHA-256 y solicitan pruebas físicas (reporte completo encriptado bajo llave del oráculo) para cotejar la veracidad.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[var(--muted-bg)] border border-[var(--border)] space-y-2">
              <div className="h-8 w-8 rounded-lg bg-green-500/10 text-green-400 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <h4 className="text-xs font-bold text-[var(--foreground)]">Veredicto e Infracción</h4>
              <p className="text-[10px] text-[var(--muted)] leading-relaxed">
                Si se comprueba fraude, el oráculo es revocado on-chain. Los fondos en garantía en disputa retornan al sponsor y el oráculo es penalizado financieramente.
              </p>
            </div>
          </div>
        </div>

        {/* Mock Interface de Disputas (Solo Lectura) */}
        <div className="glass-card p-6 sm:p-8 rounded-2xl border border-[var(--border)] space-y-4 opacity-75">
          <div className="flex justify-between items-center border-b border-[var(--border)] pb-3">
            <h3 className="text-sm font-bold text-[var(--foreground)]">
              Vista Previa: Consola de Arbitraje Descentralizado
            </h3>
            <span className="text-[10px] font-mono bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded border border-zinc-700">
              Mock Visual
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/5 flex justify-between items-center text-xs">
              <div className="space-y-1">
                <span className="font-mono text-[var(--muted)]">[DISPUTA-092] · Caso MIRA Testnet</span>
                <p className="font-semibold">Reclamación de Hito por Reporte Clínico Incompleto</p>
              </div>
              <div className="text-right space-y-1">
                <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 font-bold text-[10px]">
                  Bajo Arbitraje
                </span>
                <p className="text-[10px] text-[var(--muted)] font-mono">Hash: a7f8...e221</p>
              </div>
            </div>

            <div className="p-3 rounded-lg border border-green-500/20 bg-green-500/5 flex justify-between items-center text-xs">
              <div className="space-y-1">
                <span className="font-mono text-[var(--muted)]">[DISPUTA-089] · Caso EcoForest</span>
                <p className="font-semibold">Falta de consistencia en coordenadas de reforestación satelital</p>
              </div>
              <div className="text-right space-y-1">
                <span className="px-2.5 py-0.5 rounded-full bg-green-500/20 text-green-400 font-bold text-[10px]">
                  Resuelto - Reembolsado
                </span>
                <p className="text-[10px] text-[var(--muted)] font-mono">Hash: b82c...99a1</p>
              </div>
            </div>
          </div>
        </div>

        {/* Back navigation */}
        <div className="flex justify-between items-center text-xs text-[var(--muted)]">
          <Link href="/" className="flex items-center gap-1 hover:text-teal-400 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Volver al Inicio
          </Link>
          <Link href="/presentation" className="text-teal-500 hover:underline font-bold">
            Ver Libro Blanco & Hoja de Ruta →
          </Link>
        </div>

      </div>
    </div>
  );
}
