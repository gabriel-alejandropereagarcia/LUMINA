"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/context/WalletContext";
import { useChain } from "@/context/ChainContext";
import { useToast } from "@/context/ToastContext";
import { getExplorerUrls } from "@/lib/explorer";
import { Coins, ShieldCheck, Wallet, ArrowRight, Loader2, Info, Building, Landmark, AlertTriangle, Activity } from "lucide-react";


export default function InvestPortal() {
  const { address, isConnected, connect, escrowBalance, impactScore, refreshBalances } = useWallet();
  const { adapter, selectedNetwork } = useChain();
  const { toast } = useToast();
  const urls = getExplorerUrls(selectedNetwork);

  
  const [activeTab, setActiveTab] = useState<"web3" | "sep24">("web3");
  
  // States for Web3 Deposit
  const [amount, setAmount] = useState<string>("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<number>(1); // 1: Approve, 2: Deposit
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!address || !amount) {
      setStep(1);
      return;
    }

    const cleanAmount = Number(amount);
    if (isNaN(cleanAmount) || cleanAmount <= 0) {
      setStep(1);
      return;
    }

    let isMounted = true;
    adapter.getAllowance(address)
      .then((allowance) => {
        if (!isMounted) return;
        if (allowance >= cleanAmount) {
          setStep(2);
        } else {
          setStep(1);
        }
      })
      .catch((err) => {
        console.error("Error al verificar el allowance de USDC:", err);
        if (isMounted) setStep(1);
      });

    return () => {
      isMounted = false;
    };
  }, [address, amount]);

  // States for SEP-24 Fiat Onramp (Transferencias 3.0)
  const [fiatAmount, setFiatAmount] = useState<string>("");
  const [cuit, setCuit] = useState<string>("");
  const [alias, setAlias] = useState<string>("");
  const [fiatStatus, setFiatStatus] = useState<string | null>(null);
  const [fiatStep, setFiatStep] = useState<number>(1); // 1: Form, 2: Bank Instructions, 3: Success
  const [fiatLoading, setFiatLoading] = useState<boolean>(false);
  const [simulatedOffset, setSimulatedOffset] = useState<number>(0);
  const [simBudget, setSimBudget] = useState<number>(100);

  const exchangeRate = 1400; // 1 USDC = 1400 ARS
  const calculatedUSDC = fiatAmount ? (Number(fiatAmount) / exchangeRate).toFixed(2) : "0.00";

  const handleApprove = async () => {
    if (!address || loading) return;
    const cleanAmount = Number(amount);
    if (isNaN(cleanAmount) || cleanAmount <= 0) {
      setError("Por favor ingresa un monto válido.");
      toast({
        type: "error",
        title: "Monto inválido",
        message: "Por favor ingresa un monto válido para aprobar."
      });
      return;
    }

    setLoading(true);
    setStatus("Preparando transacción de aprobación en USDC...");
    setError(null);

    try {
      setStatus("Firma requerida: Por favor aprueba la transacción en tu billetera...");
      const res = await adapter.approve(address, cleanAmount);
      
      if (!res.success) {
        throw new Error(res.error || "Fallo en la aprobación de fondos.");
      }

      setStatus("USDC Aprobado con éxito! Ahora procede con el depósito.");
      toast({
        type: "success",
        title: "Aprobación Exitosa",
        message: `${cleanAmount} USDC aprobados correctamente para el protocolo.`,
        txHash: res.hash
      });
      setStep(2);
    } catch (err: any) {
      console.error(err);
      let errMsg = err.message || "Error al procesar la aprobación en USDC.";
      if (errMsg.includes("Error(Contract, #10)") || errMsg.includes("resulting balance is not within the allowed range")) {
        errMsg = "Saldo de USDC insuficiente en tu Freighter Wallet. Por favor, reclamá USDC de prueba en faucet.circle.com.";
      }
      setError(errMsg);
      toast({
        type: "error",
        title: "Error de Aprobación",
        message: errMsg
      });
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!address || loading) return;
    const cleanAmount = Number(amount);
    if (isNaN(cleanAmount) || cleanAmount <= 0) {
      setError("Por favor ingresa un monto válido.");
      toast({
        type: "error",
        title: "Monto inválido",
        message: "Por favor ingresa un monto válido para depositar."
      });
      return;
    }

    setLoading(true);
    setStatus("Preparando depósito en el contrato Lumina...");
    setError(null);

    try {
      setStatus("Firma requerida: Por favor firma el depósito de fondos en tu billetera...");
      const res = await adapter.deposit(address, cleanAmount);
      
      if (!res.success) {
        throw new Error(res.error || "Fallo en el depósito de fondos.");
      }

      setStatus("Depósito en custodia completado con éxito!");
      toast({
        type: "success",
        title: "Depósito Acreditado",
        message: `Depósito de ${cleanAmount} USDC completado con éxito en el fideicomiso on-chain.`,
        txHash: res.hash
      });
      setAmount("");
      setStep(1);
      await refreshBalances();
    } catch (err: any) {
      console.error(err);
      let errMsg = err.message || "Error al procesar el depósito en custodia.";
      if (errMsg.includes("Error(Contract, #10)") || errMsg.includes("resulting balance is not within the allowed range")) {
        errMsg = "Saldo de USDC insuficiente en tu Freighter Wallet. Por favor, reclamá USDC de prueba en faucet.circle.com.";
      }
      setError(errMsg);
      toast({
        type: "error",
        title: "Error de Depósito",
        message: errMsg
      });
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };

  const handleInitiateSep24 = async () => {
    if (!fiatAmount || !cuit || !alias || fiatLoading) return;

    // Validar CUIT (debe tener exactamente 11 números)
    const cleanCuit = cuit.replace(/[^\d]/g, "");
    if (cleanCuit.length !== 11) {
      setError("CUIT corporativo inválido. Debe contener exactamente 11 dígitos.");
      toast({
        type: "error",
        title: "CUIT Inválido",
        message: "El CUIT debe tener exactamente 11 dígitos numéricos."
      });
      return;
    }

    // Validar Alias o CBU/CVU (al menos 6 caracteres)
    if (alias.trim().length < 6) {
      setError("Alias/CBU de origen inválido. Debe tener al menos 6 caracteres.");
      toast({
        type: "error",
        title: "Alias/CBU Inválido",
        message: "Por favor ingresa un Alias o CBU válido."
      });
      return;
    }

    setError(null);
    setFiatLoading(true);
    setFiatStatus("Llamando al Endpoint SEP-24 del Anchor...");
    
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setFiatStatus("Anchor: Creando transacción de depósito FIAT en Stellar...");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setFiatLoading(false);
    setFiatStatus(null);
    setFiatStep(2); // Mostrar instrucciones bancarias
  };

  const handleConfirmBankTransfer = async () => {
    if (fiatLoading) return;
    setFiatLoading(true);
    setFiatStatus("Detectando acreditación de Transferencia 3.0 en pesos (ARS)...");
    
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setFiatStatus("Anchor: Depósito ARS recibido. Convirtiendo a USDC...");
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setFiatStatus("Anchor: Invocando función 'deposit' en Soroban via Hot Wallet...");
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setFiatLoading(false);
    setFiatStatus("¡Depósito acreditado! 100% verificado on-chain.");
    toast({
      type: "success",
      title: "Transferencia Procesada (SEP-24)",
      message: `Tu transferencia bancaria ha sido recibida por el Anchor. Se acreditaron ${calculatedUSDC} USDC.`
    });
    setFiatStep(3); // Acreditado con éxito
    setSimulatedOffset((prev) => prev + Number(calculatedUSDC));
    await refreshBalances();

  };

  const resetSep24 = () => {
    setFiatAmount("");
    setCuit("");
    setAlias("");
    setFiatStep(1);
    setFiatStatus(null);
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-[calc(100vh-4rem)] px-4 py-16 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12 w-full mt-12">
      {/* Encabezado */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-[var(--teal)] via-[var(--green)] to-[var(--gold)] bg-clip-text text-transparent">
          Financiamiento de Hitos de Impacto (ReFi)
        </h1>
        <p className="max-w-2xl mx-auto text-sm text-[var(--muted)]">
          Bloqueá USDC en la infraestructura universal de Lumina. Tus fondos quedan custodiados en contratos inteligentes de Stellar Soroban y se liberan únicamente cuando una App Verificadora (como MIRA AI) certifica criptográficamente el cumplimiento de un hito.
        </p>
      </div>

      {/* Grid de Contenido */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Panel de Información de la Wallet / Balances */}
        <div className="glass-card p-8 rounded-2xl md:col-span-1 space-y-6">
          <h2 className="text-lg font-bold text-[var(--foreground)] font-serif flex items-center gap-2">
            <Wallet className="h-5 w-5 text-teal-500" /> Tu Estado ReFi
          </h2>

          {isConnected && address ? (
            <div className="space-y-6">
              <div className="space-y-1">
                <span className="text-xs text-[var(--muted)] font-semibold uppercase tracking-wider">Dirección Sponsor</span>
                <p className="text-sm font-mono text-teal-500 truncate" id="refi-wallet-address">{address}</p>
              </div>

              <div className="border-t border-[var(--border)] pt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[var(--muted)] font-semibold uppercase">Fondo en Custodia</span>
                  <span className="text-lg font-bold text-[var(--foreground)]" id="refi-escrow-balance">{(escrowBalance + simulatedOffset).toLocaleString()} USDC</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[var(--muted)] font-semibold uppercase">Impacto Acumulado</span>
                  <span className="text-lg font-bold text-teal-500" id="refi-impact-score">{impactScore} Hitos</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 space-y-4">
              <p className="text-sm text-[var(--muted)]">Billetera no conectada. Conéctate a Freighter para ver saldos reales.</p>
              <button
                onClick={connect}
                id="btn-refi-connect"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-green-600 px-4 py-3 text-sm font-semibold text-[var(--foreground)] shadow-md hover:from-teal-700 hover:to-green-600 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                Conectar Billetera
              </button>
            </div>
          )}
        </div>

        {/* Formulario de Depósito / Tabs */}
        <div className="glass-card p-8 rounded-2xl md:col-span-2 space-y-6">
          {/* Selector de Pestañas */}
          <div className="flex rounded-xl bg-[var(--card-bg)] p-1 border border-[var(--border)]">
            <button
              onClick={() => setActiveTab("web3")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "web3" ? "bg-teal-600 text-[var(--foreground)] shadow-md" : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              <Coins className="h-4 w-4" /> Web3 USDC (Freighter)
            </button>
            <button
              onClick={() => setActiveTab("sep24")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "sep24" ? "bg-teal-600 text-[var(--foreground)] shadow-md" : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              <Building className="h-4 w-4" /> Transferencia ARS (SEP-24) · SIMULACIÓN
            </button>
          </div>

          {/* CONTENIDO PESTAÑA A: WEB3 DEPOSIT */}
          {activeTab === "web3" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-[var(--border)] bg-white/2 p-4 text-xs text-[var(--muted)] leading-relaxed flex gap-2.5 items-start">
                <Info className="h-4 w-4 text-teal-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-1.5">
                  <p>
                    Esta opción requiere conectar tu Freighter Wallet y tener USDC (SAC) en la red de pruebas Stellar. El flujo es directo y descentralizado.
                  </p>
                  <p className="text-[var(--warn)]/90 font-bold">
                    ⚠️ NOTA DE CUSTODIA: Los fondos depositados quedan comprometidos por 12 meses. Si la App Verificadora designada no firma ni certifica los hitos de impacto dentro de este plazo, podés reclamar la devolución de tu capital remanente desde el contrato inteligente.
                  </p>
                </div>
              </div>

              <div>
                <label htmlFor="amount-input" className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">
                  Monto a Depositar (USDC)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="amount-input"
                    placeholder="Monto en USDC (ej. 200)"
                    value={amount}
                    min="1"
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={loading || !isConnected}
                    className="w-full bg-[var(--card-bg)] border border-[var(--border)] rounded-xl px-4 py-4 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-50 text-base"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--muted)]">
                    USDC
                  </span>
                </div>
              </div>

              {isConnected && amount && Number(amount) < 40 && Number(amount) > 0 && (
                <div className="rounded-xl border border-yellow-500/20 bg-[var(--warn-bg)] p-4 space-y-3">
                  <div className="flex gap-2.5 items-start">
                    <AlertTriangle className="h-5 w-5 text-[var(--warn)] flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-[var(--warn)] uppercase tracking-wider">Aporte Parcial Detectado</h4>
                      <p className="text-xs text-[var(--warn)] leading-relaxed">
                        El monto ingresado es menor al mínimo requerido para un hito completo de MIRA AI ($40 USDC). Los fondos quedarán depositados en el contrato, pero podés ajustar tu aporte:
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <button 
                      onClick={() => setAmount("40")}
                      className="flex-1 rounded-lg bg-[var(--warn-bg)] hover:bg-[var(--warn-border)] py-2 px-3 text-xs font-bold text-[var(--warn)] transition-all cursor-pointer text-center"
                    >
                      Completar Saldo MIRA ($40 USDC)
                    </button>
                    <button 
                      onClick={() => {
                        setAmount("10");
                      }}
                      className="flex-1 rounded-lg bg-[var(--card-bg)] hover:bg-[var(--teal-light)] py-2 px-3 text-xs font-bold text-[var(--muted)] border border-[var(--border)] transition-all cursor-pointer text-center"
                    >
                      Ajustar a FitSteps ($10 USDC)
                    </button>
                    <button 
                      onClick={() => {
                        setAmount("");
                      }}
                      className="flex-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 py-2 px-3 text-xs font-bold text-red-400 transition-all cursor-pointer text-center"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {isConnected && amount && (
                <div className="grid grid-cols-2 gap-4 py-2">
                  <div className={`p-4 rounded-xl border transition-all ${step === 1 ? "border-teal-600 bg-[var(--teal-light)] text-[var(--foreground)]" : "border-[var(--border)] bg-white/2 text-[var(--muted)]"}`}>
                    <span className="block text-xs font-bold uppercase tracking-wider">Paso 1</span>
                    <span className="text-xs font-semibold">Aprobar USDC</span>
                  </div>
                  <div className={`p-4 rounded-xl border transition-all ${step === 2 ? "border-teal-600 bg-[var(--teal-light)] text-[var(--foreground)]" : "border-[var(--border)] bg-white/2 text-[var(--muted)]"}`}>
                    <span className="block text-xs font-bold uppercase tracking-wider">Paso 2</span>
                    <span className="text-xs font-semibold">Depositar en Custodia</span>
                  </div>
                </div>
              )}

              {isConnected ? (
                <div className="pt-2">
                  {step === 1 ? (
                    <button
                      onClick={handleApprove}
                      disabled={loading || !amount || Number(amount) <= 0}
                      id="btn-refi-approve"
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 px-6 py-4 text-base font-semibold text-[var(--foreground)] shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Procesando...
                        </>
                      ) : (
                        <>
                          Paso 1: Aprobar USDC
                          <ArrowRight className="h-5 w-5" />
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={handleDeposit}
                      disabled={loading || !amount || Number(amount) <= 0}
                      id="btn-refi-deposit"
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 px-6 py-4 text-base font-semibold text-[var(--foreground)] shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Depositando...
                        </>
                      ) : (
                        <>
                          Paso 2: Confirmar Custodia
                          <ShieldCheck className="h-5 w-5" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              ) : (
                <div className="pt-2">
                  <button
                    onClick={connect}
                    className="w-full rounded-xl bg-teal-600 hover:bg-teal-700 py-4 text-base font-semibold text-[var(--foreground)] transition-all cursor-pointer text-center"
                  >
                    Conectar Billetera para depositar
                  </button>
                </div>
              )}

              {status && (
                <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 text-sm text-blue-300 flex gap-3 items-start" id="refi-status-box">
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin flex-shrink-0 mt-0.5 text-teal-500" />
                  ) : (
                    <ShieldCheck className="h-5 w-5 flex-shrink-0 mt-0.5 text-emerald-400" />
                  )}
                  <p>{status}</p>
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300 flex gap-3 items-start" id="refi-error-box">
                  <Info className="h-5 w-5 flex-shrink-0 mt-0.5 text-red-400" />
                  <p>{error}</p>
                </div>
              )}
            </div>
          )}

          {/* CONTENIDO PESTAÑA B: FIAT ONRAMP (SEP-24 SIMULATOR) */}
          {activeTab === "sep24" && (
            <div className="space-y-6">
              <div className="rounded-xl border border-teal-600/20 bg-teal-600/5 p-4 text-xs text-teal-500 leading-relaxed flex gap-2.5 items-start">
                <Building className="h-4 w-4 text-teal-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-1.5">
                  <p>
                    <strong className="text-[var(--foreground)]">Fiel a la realidad Argentina:</strong> Esta opción simula el protocolo de anclaje **SEP-24**. Las empresas tradicionales de Argentina que no poseen criptomonedas transfieren Pesos (ARS) mediante la red de pagos bancarios locales. El Anchor de Stellar acredita USDC directamente en el escrow.
                  </p>
                  <p className="text-[var(--warn)]/90 font-bold font-mono">
                    ⚠️ NOTA DE CUSTODIA: Los fondos depositados quedan comprometidos por 12 meses. Si la App Verificadora designada no firma ni certifica los hitos de impacto dentro de este plazo, podés reclamar la devolución de tu capital remanente desde el contrato inteligente.
                  </p>
                </div>
              </div>

              {fiatStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">Monto a Depositar (ARS)</label>
                      <input
                        type="number"
                        placeholder="Monto en ARS (ej. 280000)"
                        value={fiatAmount}
                        onChange={(e) => setFiatAmount(e.target.value)}
                        className="w-full bg-[var(--card-bg)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">Conversión Estimada (USDC)</label>
                      <div className="w-full bg-white/2 border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--muted)] text-sm flex items-center justify-between">
                        <span>{calculatedUSDC} USDC</span>
                        <span className="text-xs text-teal-500 font-bold font-mono">1 USDC = {exchangeRate} ARS</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">CUIT Corporativo</label>
                      <input
                        type="text"
                        placeholder="CUIT (ej. 30-12345678-9)"
                        value={cuit}
                        onChange={(e) => setCuit(e.target.value)}
                        className="w-full bg-[var(--card-bg)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">CBU / CVU o Alias Origen</label>
                      <input
                        type="text"
                        placeholder="Alias o CVU corporativo"
                        value={alias}
                        onChange={(e) => setAlias(e.target.value)}
                        className="w-full bg-[var(--card-bg)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                      />
                    </div>
                  </div>

                  {fiatAmount && Number(calculatedUSDC) < 40 && Number(fiatAmount) > 0 && (
                    <div className="rounded-xl border border-yellow-500/20 bg-[var(--warn-bg)] p-4 space-y-3">
                      <div className="flex gap-2.5 items-start">
                        <AlertTriangle className="h-5 w-5 text-[var(--warn)] flex-shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-[var(--warn)] uppercase tracking-wider">Conversión Menor al Mínimo de MIRA</h4>
                          <p className="text-xs text-[var(--warn)] leading-relaxed">
                            La conversión estimada ({calculatedUSDC} USDC) es menor al costo de un hito completo de MIRA ($40 USDC). Podés ajustar para cubrir al menos un hito de MIRA o continuar.
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 pt-1">
                        <button 
                          onClick={() => setFiatAmount((40 * exchangeRate).toString())}
                          className="flex-1 rounded-lg bg-[var(--warn-bg)] hover:bg-[var(--warn-border)] py-2 px-3 text-xs font-bold text-[var(--warn)] transition-all cursor-pointer text-center"
                        >
                          Completar a $40 USDC (${(40 * exchangeRate).toLocaleString()} ARS)
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleInitiateSep24}
                    disabled={fiatLoading || !fiatAmount || !cuit || !alias}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 px-6 py-4 text-base font-semibold text-[var(--foreground)] shadow-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {fiatLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Iniciando flujo SEP-24...
                      </>
                    ) : (
                      <>
                        Iniciar Solicitud de Depósito
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </button>
                </div>
              )}

              {fiatStep === 2 && (
                <div className="space-y-6">
                  {/* Vista Interactiva Simulación SEP-24 */}
                  <div className="p-6 rounded-2xl border border-teal-600/20 bg-teal-600/5 space-y-4">
                    <h3 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2 border-b border-[var(--border)] pb-2">
                      <Landmark className="h-4 w-4 text-teal-500" /> Instrucciones de Pago: Transferencias 3.0
                    </h3>

                    <div className="text-xs text-[var(--muted)] space-y-2 leading-relaxed">
                      <p>
                        Para acreditar los <strong className="text-[var(--foreground)]">{Number(fiatAmount).toLocaleString()} ARS</strong> ({calculatedUSDC} USDC) en Lumina, por favor realiza una transferencia bancaria a los datos del Anchor habilitado:
                      </p>
                      <div className="bg-[var(--muted-bg)] p-4 rounded-xl space-y-2 font-mono text-[var(--foreground)] border border-[var(--border)]">
                        <div className="flex justify-between"><span>Alias Coelsa:</span> <span className="text-teal-500 font-bold">lumina.anchor.ars</span></div>
                        <div className="flex justify-between"><span>CVU Anchor:</span> <span>0000003100012345678901</span></div>
                        <div className="flex justify-between"><span>Banco:</span> <span>Stellar Anchor Argentina S.A.</span></div>
                        <div className="flex justify-between"><span>Monto exacto:</span> <span className="text-[var(--foreground)]">${Number(fiatAmount).toLocaleString()} ARS</span></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={resetSep24}
                      disabled={fiatLoading}
                      className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] py-4 text-sm font-semibold text-[var(--muted)] hover:bg-[var(--teal-light)] transition-all cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleConfirmBankTransfer}
                      disabled={fiatLoading}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 py-4 text-sm font-semibold text-[var(--foreground)] shadow-lg transition-all active:scale-95 cursor-pointer"
                    >
                      {fiatLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Acreditando...
                        </>
                      ) : (
                        <>
                          Confirmar Transferencia Bancaria
                          <ShieldCheck className="h-4.5 w-4.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {fiatStep === 3 && (
                <div className="text-center p-8 space-y-6">
                  <div className="h-16 w-16 mx-auto flex items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                    <ShieldCheck className="h-10 w-10 animate-bounce" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-[var(--foreground)]">¡Depósito Acreditado con Éxito!</h3>
                    <p className="text-xs text-[var(--muted)] max-w-sm mx-auto">
                      Tu transferencia de ${Number(fiatAmount).toLocaleString()} ARS fue procesada por el Anchor. El Fideicomiso de Lumina en Soroban recibió <strong className="text-[var(--foreground)]">{calculatedUSDC} USDC</strong> on-chain.
                    </p>
                  </div>
                  <button
                    onClick={resetSep24}
                    className="rounded-xl border border-teal-600/20 bg-[var(--teal-light)] px-6 py-3 text-xs font-bold text-teal-500 hover:bg-teal-600 hover:text-[var(--foreground)] transition-all cursor-pointer"
                  >
                    Realizar otro depósito
                  </button>
                </div>
              )}

              {fiatStatus && (
                <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 text-xs text-blue-300 flex gap-3 items-start">
                  {fiatLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin flex-shrink-0 mt-0.5 text-teal-500" />
                  ) : (
                    <ShieldCheck className="h-4 w-4 flex-shrink-0 mt-0.5 text-emerald-400" />
                  )}
                  <p>{fiatStatus}</p>
                </div>
              )}
            </div>
          )}

          {/* Información del Contrato */}
          <div className="border-t border-[var(--border)] pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs text-[var(--muted)]">
            <div className="space-y-1">
              <span>Contrato Lumina:</span>
              <a
                href={urls.contractUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-teal-600 hover:underline block break-all"
              >
                {urls.contractAddress}
              </a>
            </div>
            <div className="space-y-1 sm:text-right">
              <span>Contrato USDC:</span>
              <a
                href={urls.usdcUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-teal-600 hover:underline block break-all"
              >
                {urls.usdcAddress}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Simulador de Garantías ReFi */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 w-full">
        <div className="glass-card p-8 rounded-2xl space-y-6">
          <div className="border-b border-[var(--border)] pb-4">
            <span className="text-xs font-bold text-teal-500 uppercase tracking-widest">Herramienta de Planificación ReFi</span>
            <h2 className="text-xl font-bold text-[var(--foreground)] font-serif flex items-center gap-2 mt-1">
              <Activity className="h-5 w-5 text-teal-500" />
              Simulador de Asignación de Garantías
            </h2>
            <p className="text-xs text-[var(--muted)] mt-1">
              Ajustá tu presupuesto total para proyectar cómo se distribuirá el impacto y qué remanentes quedarán custodiados en garantía.
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-black/30 p-6 rounded-2xl border border-[var(--border)] space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Presupuesto de Garantía</span>
                <span className="text-lg font-mono font-bold text-teal-500">{simBudget} USDC</span>
              </div>
              <input
                type="range"
                min="5"
                max="2000"
                step="5"
                value={simBudget}
                onChange={(e) => setSimBudget(Number(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
              <div className="flex justify-between text-xs text-[var(--muted)] font-mono">
                <span>5 USDC</span>
                <span>500 USDC</span>
                <span>1000 USDC</span>
                <span>1500 USDC</span>
                <span>2000 USDC</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Columna Salud: MIRA */}
              <div className="p-5 rounded-xl border border-[var(--border)] bg-white/2 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold text-[var(--foreground)]">Salud (MIRA AI) [Live]</h3>
                    <p className="text-xs text-[var(--muted)] mt-0.5">Evaluaciones de Neurodesarrollo</p>
                  </div>
                  <span className="rounded-lg bg-[var(--teal-light)] px-2 py-1 text-xs font-bold text-teal-500 font-mono">$40 USDC c/u</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-[var(--muted)]">Impacto Proyectado:</span>
                    <strong className="text-[var(--foreground)]">{Math.floor(simBudget / 40)} Hitos</strong>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[var(--muted)]">Capital en Garantía:</span>
                    <span className="text-[var(--muted)] font-mono">{simBudget % 40} USDC ociosos</span>
                  </div>
                </div>
              </div>

              {/* Columna FitSteps (Simulado) */}
              <div className="p-5 rounded-xl border border-[var(--border)] bg-white/2 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold text-[var(--foreground)]">Salud Preventiva (FitSteps) [Simulado]</h3>
                    <p className="text-xs text-[var(--muted)] mt-0.5">Pasos y Deporte Preventivo</p>
                  </div>
                  <span className="rounded-lg bg-emerald-500/10 px-2 py-1 text-xs font-bold text-emerald-400 font-mono">$10 USDC c/u</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-[var(--muted)]">Impacto Proyectado:</span>
                    <strong className="text-[var(--foreground)]">{Math.floor(simBudget / 10)} Hitos</strong>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[var(--muted)]">Capital en Garantía:</span>
                    <span className="text-[var(--muted)] font-mono">{simBudget % 10} USDC ociosos</span>
                  </div>
                </div>
              </div>

              {/* Columna Mix Portafolio */}
              <div className="p-5 rounded-xl border border-teal-600/20 bg-teal-600/5 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold text-teal-500">Mix Portafolio [Simulado]</h3>
                    <p className="text-xs text-teal-500/80 mt-0.5">Asignación Balanceada (50/50)</p>
                  </div>
                  <span className="rounded-lg bg-teal-600/20 px-2 py-1 text-xs font-bold text-teal-500">Sugerido</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-[var(--muted)]">Impacto Proyectado:</span>
                    <strong className="text-[var(--foreground)]">
                      {Math.floor((simBudget / 2) / 40)} MIRA AI + {Math.floor((simBudget / 2) / 10)} FitSteps
                    </strong>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[var(--muted)]">Capital en Garantía:</span>
                    <span className="text-teal-500 font-mono">
                      {((simBudget / 2) % 40) + ((simBudget / 2) % 10)} USDC ociosos
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
