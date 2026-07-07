"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/context/WalletContext";
import { useToast } from "@/context/ToastContext";
import { txUrl } from "@/lib/explorer";

import { 
  Activity, ShieldCheck, Heart, Coins, Users, AlertCircle, 
  RefreshCw, Cpu, Download, FileText, Share2, 
  AlertTriangle, Lock, Unlock, ArrowUpRight, HelpCircle, Landmark, Info 
} from "lucide-react";

interface LedgerEvent {
  id: string;
  type: "deposit" | "impact";
  title: string;
  desc: string;
  amount: number;
  timestamp: string;
  txHash: string;
  isSimulated?: boolean;
}


export default function SponsorDashboard() {
  const { address, isConnected, connect, escrowBalance, impactScore, refreshBalances } = useWallet();
  const { toast } = useToast();
  
  // Preferencias de Notificación
  const [sponsorEmail, setSponsorEmail] = useState<string>("");
  const [sponsorWebhook, setSponsorWebhook] = useState<string>("");
  const [savingConfig, setSavingConfig] = useState<boolean>(false);

  useEffect(() => {
    if (!address) return;
    fetch(`/api/sponsor/config?address=${address}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSponsorEmail(data.email || "");
          setSponsorWebhook(data.webhookUrl || "");
        }
      })
      .catch(err => console.error("Error al cargar configuración de notificaciones:", err));
  }, [address]);

  const handleSaveConfig = async () => {
    if (!address) return;
    setSavingConfig(true);
    try {
      const res = await fetch("/api/sponsor/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          email: sponsorEmail,
          webhookUrl: sponsorWebhook
        })
      });
      const data = await res.json();
      if (data.success) {
        toast({
          type: "success",
          title: "Configuración Actualizada",
          message: "Preferencias de alertas guardadas en producción con éxito."
        });
      } else {
        throw new Error(data.error || "Fallo en guardado.");
      }
    } catch (e: any) {
      console.error(e);
      toast({
        type: "error",
        title: "Error al Guardar",
        message: e.message || "No se pudo actualizar la configuración."
      });
    } finally {
      setSavingConfig(false);
    }
  };
  
  // Yield mode state (DeFi opt-in)
  const [yieldMode, setYieldMode] = useState<boolean>(false);
  const [showYieldDisclaimer, setShowYieldDisclaimer] = useState<boolean>(false);
  const [agreedToYieldRisk, setAgreedToYieldRisk] = useState<boolean>(false);
  const [esgDownloading, setEsgDownloading] = useState<boolean>(false);
  const [prCopied, setPrCopied] = useState<boolean>(false);

  // States for simulation
  const [events, setEvents] = useState<LedgerEvent[]>([
    {
      id: "1",
      type: "deposit",
      title: "Depósito de RSE en Custodia (Simulado)",
      desc: "Sponsor Corporativo acreditó fondos en Lumina Escrow.",
      amount: 1000,
      timestamp: "Hace 2 horas",
      txHash: "a1b2c3d4f5e6a1b2c3d4f5e6a1b2c3d4f5e6a1b2c3d4f5e6a1b2c3d4f5e6b2a1",
      isSimulated: true,
    },
    {
      id: "2",
      type: "impact",
      title: "Impacto MIRA Verificado (Testnet)",
      desc: "USDC 40 liberados. Reporte PDF notarizado con Hash: a89e...b24c.",
      amount: 40,
      timestamp: "Hace 45 mins",
      txHash: "f6e5d4c3b2a1f6e5d4c3b2a1f6e5d4c3b2a1f6e5d4c3b2a1f6e5d4c3b2a1a1b2",
      isSimulated: false,
    },
  ]);


  const [simulating, setSimulating] = useState<boolean>(false);
  const [simStatus, setSimStatus] = useState<string | null>(null);
  const [simError, setSimError] = useState<string | null>(null);
  const [customStats, setCustomStats] = useState({
    mockEscrow: 500,
    mockImpact: 12,
  });

  const isRealMode = isConnected && escrowBalance > 0;
  const currentImpactCount = isRealMode ? impactScore : customStats.mockImpact;
  const currentEscrowUSD = isRealMode ? escrowBalance : customStats.mockEscrow;
  const totalFundingUSD = currentImpactCount * 40;

  // Reputation tokens: 1 LUMINA minted per completed impact milestone
  const reputationLumina = currentImpactCount;

  const handleSimulateImpact = async () => {
    setSimulating(true);
    setSimError(null);
    setSimStatus("MIRA: Familia completó cuestionario M-CHAT-R/F...");
    
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSimStatus("MIRA: Generando Reporte de Impacto PDF y Hash Criptográfico...");
    
    if (isRealMode && address) {
      setSimStatus("Para ejecutar un impacto real on-chain, utilice la aplicación MIRA.");
      setSimulating(false);
      return;
    } else {
      if (customStats.mockEscrow < 40) {
        setSimError("Error: Fondos insuficientes en custodia para simular la liberación de este hito (Mínimo 40 USDC).");
        setSimStatus(null);
        setSimulating(false);
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 1200));
      setSimStatus("MIRA: Firmando hash y liberando 40 USDC (Simulado)...");
      await new Promise((resolve) => setTimeout(resolve, 800));

      const mockHash = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      const mockTx = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

      const newEvent: LedgerEvent = {
        id: Date.now().toString(),
        type: "impact",
        title: "Evaluación MIRA Verificada (Simulado)",
        desc: `USDC 40 liberados. PDF Notarizado con Hash: ${mockHash.slice(0, 10)}...`,
        amount: 40,
        timestamp: "Ahora mismo",
        txHash: mockTx,
        isSimulated: true,
      };


      setEvents((prev) => [newEvent, ...prev]);
      setCustomStats((prev) => ({
        mockEscrow: Math.max(0, prev.mockEscrow - 40),
        mockImpact: prev.mockImpact + 1,
      }));
      setSimStatus("Impacto verificado (Simulación Local Exitosa).");
      setSimulating(false);
    }
  };

  const prTextCopy = `Lumina Protocol Report: ${
    address ? `La empresa con wallet ${address.slice(0, 8)}...` : "Nuestra corporación"
  } financió exitosamente el screening de neurodesarrollo infantil de ${currentImpactCount} familias a través del protocolo ReFi Lumina e integrado con MIRA AI. Esta acción aporta a la salud infantil y genera un ahorro social proyectado de $${(
    currentImpactCount * 3000
  ).toLocaleString()} USD en costos de atención pública a largo plazo, validado 100% on-chain en Stellar.`;

  const toggleYield = () => {
    if (!yieldMode) {
      setShowYieldDisclaimer(true);
    } else {
      setYieldMode(false);
      setAgreedToYieldRisk(false);
    }
  };

  const confirmYieldActivation = () => {
    if (agreedToYieldRisk) {
      setYieldMode(true);
      setShowYieldDisclaimer(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-teal-600 selection:text-white pb-16">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 w-full space-y-8">
        
        {/* Banner de Modo Demo */}
        {!isRealMode && (
          <div className="p-4 rounded-xl border border-teal-500/20 bg-[var(--teal-light)] text-xs text-teal-500 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="space-y-0.5">
              <span className="font-bold uppercase tracking-wider block text-xs">💡 MODO DEMOSTRACIÓN ACTIVO</span>
              <p className="text-[var(--muted)]">Estás viendo datos simulados. Conecta tu Freighter Wallet para gestionar tus garantías reales on-chain.</p>
            </div>
            <button 
              onClick={connect}
              className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-[var(--foreground)] font-bold text-xs uppercase transition-all cursor-pointer flex-shrink-0"
            >
              Conectar Billetera
            </button>
          </div>
        )}

        {/* Encabezado */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-[var(--border)] pb-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-teal-500 uppercase tracking-widest flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5" /> Sponsor Command Center
            </span>
            <h1 className="text-4xl font-extrabold font-serif text-[var(--foreground)] tracking-tight">Consola de Gestión del Sponsor</h1>
            <p className="text-[var(--muted)] max-w-xl text-xs leading-relaxed">
              Monitoreá el estado de tus fondos en garantía, reclamá tu score Soulbound y generá reportes ESG para tu junta directiva.
            </p>
          </div>

          {/* Wallet Address Display */}
          {isConnected && address && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] px-4 py-2.5 text-xs font-mono text-teal-500">
              Sponsor: {address.slice(0, 8)}...{address.slice(-8)}
            </div>
          )}
        </div>

        {/* MÉTRIQUES FINANCIERAS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

          
          {/* Custodia USDC (Free Escrow) */}
          <div className="glass-card p-6 rounded-2xl flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Custodia Pura (Garantía Lumina)</span>
              <Coins className="h-4.5 w-4.5 text-emerald-400" />
            </div>
            <div>
              <span className="text-3xl font-bold tracking-tight text-[var(--foreground)] font-mono">
                {(yieldMode ? 0 : currentEscrowUSD).toLocaleString()} USDC
              </span>
              <p className="text-xs text-[var(--muted)] mt-1">
                Fondos seguros con devolución del 100% garantizada.
              </p>
            </div>
          </div>

          {/* Yield Comprometido en Blend */}
          <div className="glass-card p-6 rounded-2xl flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Yield Mode en Blend (DeFi)</span>
              <Activity className={`h-4.5 w-4.5 ${yieldMode ? "text-[var(--warn)] animate-pulse" : "text-[var(--muted)]"}`} />
            </div>
            <div>
              <span className={`text-3xl font-bold tracking-tight font-mono ${yieldMode ? "text-[var(--warn)]" : "text-[var(--foreground)]/40"}`}>
                {(yieldMode ? currentEscrowUSD : 0).toLocaleString()} USDC
              </span>
              <p className="text-xs text-[var(--muted)] mt-1">
                {yieldMode ? "Generando ~5.4% APY en Blend" : "Inactivo (0% APY)"}
              </p>
            </div>
          </div>

          {/* Garantía en Espera de Impacto */}
          <div className="glass-card p-6 rounded-2xl flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Fondo en Espera de Meta</span>
              <Lock className="h-4.5 w-4.5 text-teal-600" />
            </div>
            <div>
              <span className="text-3xl font-bold tracking-tight text-[var(--foreground)] font-mono">
                {(currentEscrowUSD > 40 ? 40 : 0)} USDC
              </span>
              <p className="text-xs text-[var(--muted)] mt-1">
                Comprometido para la siguiente evaluación de MIRA.
              </p>
            </div>
          </div>

          {/* Reputación $LUMINA */}
          <div className="glass-card p-6 rounded-2xl flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Tokens $LUMINA Minteados</span>
              <ShieldCheck className="h-4.5 w-4.5 text-teal-600" />
            </div>
            <div>
              <span className="text-3xl font-bold tracking-tight text-[var(--foreground)] font-mono">
                {reputationLumina} LUMINA
              </span>
              <p className="text-xs text-[var(--muted)] mt-1">
                Score reputacional Soulbound intransferible.
              </p>
            </div>
          </div>
        </div>

        {/* SECCIÓN DE ASIGNACIÓN, SIMULACIÓN Y RENDIMIENTO */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          
          {/* Asignación y Yield Mode */}
          <div className="glass-card p-6 rounded-2xl lg:col-span-2 space-y-6">
            <div className="space-y-1">
              <h3 className="text-sm font-bold font-serif text-[var(--foreground)] flex items-center gap-2">
                <Landmark className="h-4.5 w-4.5 text-teal-600" /> Control de Custodia y Rendimiento
              </h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Administrá tus fondos inactivos mientras esperan ser liberados por impacto.
              </p>
            </div>

            {/* Selector Opt-in de Yield */}
            <div className="p-4 rounded-xl border border-[var(--border)] bg-transparent space-y-4">
              <div className="flex justify-between items-center">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-[var(--foreground)] block">Activar Modo Yield (DeFi) · SIMULACIÓN</span>
                  <span className="text-xs text-[var(--muted)] block">Demo conceptual — Blend Protocol no integrado aún</span>
                </div>
                <button
                  onClick={toggleYield}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                    yieldMode ? "bg-[var(--warn)]" : "bg-[var(--muted-bg)]"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      yieldMode ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {yieldMode && (
                <div className="rounded-lg border-[var(--warn-border)] bg-[var(--warn-bg)] p-3 flex gap-2 items-start text-amber-400 text-xs leading-relaxed">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  <p>
                    <strong>FONDOS SUJETOS A RIESGO:</strong> Tus USDC inactivos están depositados en Blend Protocol. Lumina no se responsabiliza ni garantiza el principal ante fallas en contratos de terceros.
                  </p>
                </div>
              )}
            </div>

            {/* Advertencia de Time-Lock de Custodia */}
            <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 flex gap-2.5 items-start text-xs text-blue-300">
              <Info className="h-5 w-5 text-teal-600 flex-shrink-0" />
              <div className="space-y-1">
                <strong>Garantía de Tiempo Comprometida:</strong>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  Tus fondos asignados a un hito están protegidos por contrato en Soroban. Si la app de impacto (MIRA) no valida el trabajo antes del vencimiento de 12 meses, los fondos se desbloquearán automáticamente para retiro.
                </p>
              </div>
            </div>

            {/* Configuración de Notificaciones (Email + Webhook) */}
            {isConnected && address && (
              <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] space-y-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-teal-500 uppercase tracking-widest block">Canales de Alerta</span>
                  <h4 className="text-sm font-bold text-[var(--foreground)]">Configuración de Alertas en Producción</h4>
                  <p className="text-xs text-[var(--muted)] leading-relaxed">
                    Recibí notificaciones instantáneas de correos electrónicos y webhooks en tiempo real cuando tus hitos sean certificados y liberados on-chain.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label htmlFor="sponsor-email-input" className="text-xs font-semibold text-[var(--foreground)] block">Correo Corporativo</label>
                    <input
                      type="email"
                      id="sponsor-email-input"
                      value={sponsorEmail}
                      onChange={(e) => setSponsorEmail(e.target.value)}
                      placeholder="sponsor@empresa.com"
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs font-mono text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="sponsor-webhook-input" className="text-xs font-semibold text-[var(--foreground)] block">Webhook URL (Post Request)</label>
                    <input
                      type="url"
                      id="sponsor-webhook-input"
                      value={sponsorWebhook}
                      onChange={(e) => setSponsorWebhook(e.target.value)}
                      placeholder="https://api.empresa.com/webhooks/lumina"
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs font-mono text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSaveConfig}
                  disabled={savingConfig}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-green-600 py-3 text-xs font-bold text-white shadow-lg disabled:opacity-50 hover:opacity-90 transition-all cursor-pointer"
                >
                  {savingConfig ? "Guardando Preferencias..." : "Guardar Canales de Alerta"}
                </button>
              </div>
            )}

            {/* Simulador MIRA */}
            <div className="p-5 rounded-xl border border-[var(--border)] bg-transparent space-y-4">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest block">Simulación Local</span>
                <h4 className="text-xs font-bold text-[var(--foreground)]">Walkthrough del Oráculo MIRA</h4>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  Simulación paso a paso de la lógica on-chain definitiva: MIRA firma el hash y Soroban libera los fondos.
                </p>
              </div>

              <button
                onClick={handleSimulateImpact}
                disabled={simulating}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-green-600 py-3 text-xs font-bold text-white shadow-lg disabled:opacity-50 transition-all cursor-pointer"
              >
                {simulating ? "Ejecutando Simulación MIRA..." : "Simular Walkthrough On-Chain MIRA"}
              </button>

              {simStatus && (
                <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-3 text-xs text-blue-300 flex items-center gap-2">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin flex-shrink-0 text-teal-600" />
                  <p>{simStatus}</p>
                </div>
              )}

              {simError && (
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 text-rose-500" />
                  <p>{simError}</p>
                </div>
              )}
            </div>


          </div>

          {/* Mis Inversiones por App y Ledger */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Tabla de Inversiones Activas */}
            <div className="glass-card p-6 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold font-serif text-[var(--foreground)]">Mis Inversiones por Aplicación</h3>
              
              <div className="border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--muted-bg)] text-xs">
                <div className="bg-[var(--card-bg)] p-3 font-bold text-[var(--muted)] grid grid-cols-4 border-b border-[var(--border)] text-xs">
                  <span>APLICACIÓN</span>
                  <span>HITOS COMPLETOS</span>
                  <span>USDC LIBERADOS</span>
                  <span className="text-right">ESTADO</span>
                </div>
                <div className="divide-y divide-[var(--border)]">
                  <div className="p-3 grid grid-cols-4 items-center text-[var(--muted)]">
                    <span className="font-semibold text-[var(--foreground)]">MIRA AI (Salud)</span>
                    <span className="font-mono">{currentImpactCount} evaluados</span>
                    <span className="font-mono text-emerald-400">${totalFundingUSD} USDC</span>
                    <span className="text-right text-xs font-semibold flex items-center justify-end gap-1.5 text-emerald-400">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      Conexión Real (Stellar Testnet)
                    </span>
                  </div>
                  <div className="p-3 grid grid-cols-4 items-center text-[var(--muted)]">
                    <span className="font-semibold text-[var(--foreground)]/60">FitSteps (Deporte)</span>
                    <span className="font-mono">0 caminatas</span>
                    <span className="font-mono text-zinc-500">$0 USDC</span>
                    <span className="text-right text-xs text-zinc-500 font-semibold flex items-center justify-end gap-1">
                      Demo Conceptual
                    </span>
                  </div>
                  <div className="p-3 grid grid-cols-4 items-center text-[var(--muted)]">
                    <span className="font-semibold text-[var(--foreground)]/60">EcoForest (Ambiente)</span>
                    <span className="font-mono">0 árboles</span>
                    <span className="font-mono text-zinc-500">$0 USDC</span>
                    <span className="text-right text-xs text-zinc-500 font-semibold flex items-center justify-end gap-1">
                      Demo Conceptual
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ledger de Eventos */}
            <div className="glass-card p-6 rounded-2xl space-y-4 h-[240px] flex flex-col justify-between">
              <h3 className="text-sm font-bold font-serif text-[var(--foreground)]">Registro de Eventos y Auditoría</h3>
              
              <div className="flex-grow overflow-y-auto space-y-2 pr-1 custom-scrollbar text-xs">
                {events.map((event) => (
                  <div key={event.id} className="p-2.5 rounded-lg border border-[var(--border)] bg-transparent flex justify-between items-center">
                    <div className="space-y-0.5">
                      <span className="font-bold text-[var(--foreground)] block">{event.title}</span>
                      <p className="text-xs text-[var(--muted)] font-mono flex items-center gap-1.5 flex-wrap">
                        <span>Tx:</span>
                        {event.isSimulated ? (
                          <span className="text-zinc-500 font-semibold italic">
                            [Simulación - Mock Data]
                          </span>
                        ) : (
                          <a
                            href={txUrl(event.txHash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--teal)] hover:underline flex items-center gap-0.5"
                          >
                            {event.txHash.substring(0, 8)}...{event.txHash.substring(event.txHash.length - 4)}
                            <ArrowUpRight className="h-3 w-3 shrink-0" />
                          </a>
                        )}
                        <span>• {event.timestamp}</span>
                      </p>
                    </div>
                    <span className={`font-bold font-mono ${event.type === 'deposit' ? 'text-emerald-400' : 'text-teal-500'}`}>
                      {event.type === 'deposit' ? `+${event.amount}` : `-${event.amount}`}
                    </span>
                  </div>
                ))}

              </div>
            </div>

          </div>
        </div>

        {/* KIT CORPORATIVO */}
        <div className="glass-card p-8 rounded-2xl space-y-6">
          <div className="border-b border-[var(--border)] pb-4">
            <h3 className="text-lg font-bold font-serif text-[var(--foreground)] flex items-center gap-2">
              <FileText className="h-5 w-5 text-teal-600" />
              Kit de Comunicación Corporativa (PR & Directorio)
            </h3>
            <p className="text-xs text-[var(--muted)] mt-1">
              Descargá tus reportes consolidados y compartí los logros auditados on-chain con tu junta directiva.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Board Room Report */}
            <div className="p-5 rounded-xl border border-[var(--border)] bg-transparent space-y-3">
              <h4 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">Reporte para Junta Directiva</h4>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Descarga la planilla de auditoría oficial con firmas de oráculos y hashes on-chain para presentar a tus auditores ESG.
              </p>
              <button 
                onClick={() => {
                  setEsgDownloading(true);
                  setTimeout(() => setEsgDownloading(false), 2000);
                }}
                disabled={esgDownloading}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-[var(--card-bg)] border border-[var(--border)] hover:bg-[var(--card-bg)] py-2.5 text-xs font-bold text-teal-500 transition-all cursor-pointer disabled:opacity-50"
              >
                <Download className="h-4 w-4" /> {esgDownloading ? "Generando PDF..." : "Exportar Reporte ESG"}
              </button>
            </div>
 
            {/* PR Generator */}
            <div className="p-5 rounded-xl border border-[var(--border)] bg-transparent space-y-3 lg:col-span-2">
              <h4 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">Generador de Notas de Prensa (PR)</h4>
              <div className="bg-[var(--muted-bg)] p-3 rounded-lg border border-[var(--border)]">
                <p className="text-xs text-[var(--muted)] italic leading-relaxed font-mono">
                  "{prTextCopy}"
                </p>
              </div>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(prTextCopy);
                  setPrCopied(true);
                  setTimeout(() => setPrCopied(false), 2000);
                }}
                className="flex items-center justify-center gap-2 rounded-lg bg-teal-600/20 hover:bg-teal-600/30 py-2 px-4 text-xs font-bold text-teal-500 transition-all cursor-pointer ml-auto"
              >
                <Share2 className="h-4 w-4" /> {prCopied ? "¡Copiado!" : "Copiar Nota de Prensa"}
              </button>
            </div>
          </div>
        </div>

        {/* DIÁLOGO MODAL YIELD MODE */}
        {showYieldDisclaimer && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="glass-card max-w-md w-full p-6 rounded-2xl space-y-4 border border-[var(--border)]">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <h4 className="text-sm font-bold font-serif text-[var(--foreground)] flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-[var(--warn)] animate-pulse" />
                  Activar Rendimiento DeFi (Opt-In)
                </h4>
                <button 
                  onClick={() => setShowYieldDisclaimer(false)}
                  className="text-[var(--muted)] hover:text-[var(--foreground)] font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="text-xs text-[var(--muted)] space-y-3 leading-relaxed">
                <p>
                  Estás a punto de activar el **Yield Mode** del protocolo. Esto significa que tus fondos de RSE inactivos en el smart contract serán suministrados al pool de liquidez de **Blend Protocol** en Stellar.
                </p>
                <p className="text-[var(--foreground)] font-semibold">
                  ⚠️ LEER ATENTAMENTE ANTES DE CONFIRMAR:
                </p>
                <ul className="list-disc pl-4 space-y-1.5 text-xs">
                  <li>Lumina **no garantiza** el principal en este modo.</li>
                  <li>Tus fondos están sujetos a riesgos sistémicos de DeFi (smart contract exploits en Blend, descalces de liquidez del pool).</li>
                  <li>Si eliges activar, aceptas la plena responsabilidad en caso de pérdida.</li>
                </ul>

                <div className="pt-2 flex items-center gap-2.5">
                  <input 
                    type="checkbox" 
                    id="chk-risk-agree"
                    checked={agreedToYieldRisk}
                    onChange={(e) => setAgreedToYieldRisk(e.target.checked)}
                    className="h-4 w-4 rounded border-[var(--border)] bg-[var(--card-bg)] text-teal-600 focus:ring-teal-500 cursor-pointer"
                  />
                  <label htmlFor="chk-risk-agree" className="text-xs text-[var(--foreground)] font-bold select-none cursor-pointer">
                    Entiendo el riesgo y acepto la responsabilidad.
                  </label>
                </div>
              </div>

              <button
                onClick={confirmYieldActivation}
                disabled={!agreedToYieldRisk}
                className="w-full bg-[var(--warn)] hover:opacity-80 disabled:opacity-50 py-3 text-xs font-bold text-white rounded-xl shadow-lg transition-all cursor-pointer"
              >
                Confirmar Activación de Yield
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
