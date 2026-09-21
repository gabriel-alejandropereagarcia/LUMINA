"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useWallet } from "@/context/WalletContext";
import { useChain } from "@/context/ChainContext";
import { useToast } from "@/context/ToastContext";
import { getExplorerUrls } from "@/lib/explorer";
import { IMPACT_APPS, getImpactApp, listedForAssign } from "@/lib/impact-apps";
import { USDC_TESTNET_SAC, USDT0_OFFICIAL } from "@/lib/official-assets";
import { buildAssignOracleTx, submitSorobanTransaction } from "@/lib/stellar";
import { signStellarTransaction } from "@/lib/integrations/wallets-kit";
import Link from "next/link";
import { Coins, ShieldCheck, Wallet, ArrowRight, Loader2, Info, AlertTriangle, Activity } from "lucide-react";
import CertifyDemoButton from "@/components/CertifyDemoButton";


function InvestPortal() {
  const { address, isConnected, connect, escrowBalance, impactScore, refreshBalances } = useWallet();
  const { adapter, selectedNetwork } = useChain();
  const { toast } = useToast();
  const urls = getExplorerUrls(selectedNetwork);
  const searchParams = useSearchParams();

  
  const [activeTab] = useState<"web3">("web3");
  const assignableApps = listedForAssign();
  const [selectedAppId, setSelectedAppId] = useState("mira");
  const selectedApp = getImpactApp(selectedAppId) ?? assignableApps[0] ?? IMPACT_APPS[0];

  useEffect(() => {
    const fromQuery = searchParams.get("app");
    if (fromQuery && getImpactApp(fromQuery)) {
      setSelectedAppId(fromQuery);
    }
  }, [searchParams]);
  
  // States for Web3 Deposit
  const [amount, setAmount] = useState<string>("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<number>(1); // 1: Approve, 2: Deposit
  const [loading, setLoading] = useState<boolean>(false);
  const [lastDeposit, setLastDeposit] = useState<{ sponsor: string; amount: number } | null>(null);

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
        errMsg = "Saldo de USDC insuficiente. Reclamá USDC de prueba en faucet.circle.com.";
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

      setStatus("Depósito en custodia completado. Asignando el pozo a la app...");
      toast({
        type: "success",
        title: "Depósito Acreditado",
        message: `Depósito de ${cleanAmount} USDC en escrow.`,
        txHash: res.hash
      });

      try {
        // assign_oracle = signer que certifica (GBJJCKJ…), no la wallet de payout.
        const assignXdr = await buildAssignOracleTx(
          address,
          USDC_TESTNET_SAC,
          selectedApp.oracleAddress
        );
        const signedAssign = await signStellarTransaction(assignXdr, address);
        if (signedAssign) {
          const assignHash = await submitSorobanTransaction(signedAssign);
          toast({
            type: "success",
            title: "App asignada on-chain",
            message: `${selectedApp.name} puede certificar este pozo.`,
            txHash: assignHash,
          });
        }
      } catch (assignErr: unknown) {
        const msg = assignErr instanceof Error ? assignErr.message : String(assignErr);
        toast({
          type: "info",
          title: "Depósito ok · assign pendiente",
          message:
            msg.includes("UnauthorizedOracle")
              ? "Assign usa el signer de certify, no la wallet de payout. El USDC ya está en custodia."
              : `No se pudo asignar: ${msg}`,
        });
      }

      setAmount("");
      setStep(1);
      setLastDeposit({ sponsor: address, amount: cleanAmount });
      await refreshBalances();
    } catch (err: any) {
      console.error(err);
      let errMsg = err.message || "Error al procesar el depósito en custodia.";
      if (errMsg.includes("Error(Contract, #10)") || errMsg.includes("resulting balance is not within the allowed range")) {
        errMsg = "Saldo de USDC insuficiente. Reclamá USDC de prueba en faucet.circle.com.";
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


  return (
    <div className="flex flex-col items-center justify-start min-h-[calc(100vh-4rem)] px-4 py-16 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12 w-full mt-12">
      {/* Encabezado */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-[var(--teal)] via-[var(--green)] to-[var(--gold)] bg-clip-text text-transparent">
          Probá el riel · USDC testnet
        </h1>
        <p className="max-w-2xl mx-auto text-sm text-[var(--muted)]">
          Depositá 40 USDC Circle, asigná la app y liberá con certify. Freighter solo acá.
          Una tesorería entra por{" "}
          <Link href="/empresa" className="text-teal-600 font-semibold underline">
            /empresa
          </Link>
          {" "}(factura, sin wallet). USDT0 oficial vive en mainnet.
        </p>
        <p className="max-w-2xl mx-auto text-xs text-[var(--muted)] rounded-xl border border-[var(--border)] bg-[var(--card-bg)] px-4 py-3">
          Evidencia al final:{" "}
          <Link href="/jury" className="text-teal-600 font-semibold underline">
            /jury
          </Link>
          .
        </p>
      </div>

      {/* Grid de Contenido */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Panel de Información de la Wallet / Balances */}
        <div className="glass-card p-8 rounded-2xl md:col-span-1 space-y-6">
          <h2 className="text-lg font-bold text-[var(--foreground)] font-serif flex items-center gap-2">
            <Wallet className="h-5 w-5 text-teal-500" /> Tu wallet
          </h2>

          {isConnected && address ? (
            <div className="space-y-6">
              <div className="space-y-1">
                <span className="text-xs text-[var(--muted)] font-semibold uppercase tracking-wider">Dirección</span>
                <p className="text-sm font-mono text-teal-500 truncate" id="refi-wallet-address">{address}</p>
              </div>

              <div className="border-t border-[var(--border)] pt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[var(--muted)] font-semibold uppercase">Fondo en Custodia</span>
                  <span className="text-lg font-bold text-[var(--foreground)]" id="refi-escrow-balance">{escrowBalance.toLocaleString()} USDC</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[var(--muted)] font-semibold uppercase">Impacto Acumulado</span>
                  <span className="text-lg font-bold text-teal-500" id="refi-impact-score">{impactScore} Hitos</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 space-y-4">
              <p className="text-sm text-[var(--muted)]">Billetera no conectada. Conectá Freighter, xBull u otra wallet Stellar para ver saldos reales.</p>
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
          {/* Recorrido USDC testnet */}
          {activeTab === "web3" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-[var(--border)] bg-white/2 p-4 text-xs text-[var(--muted)] leading-relaxed flex gap-2.5 items-start">
                <Info className="h-4 w-4 text-teal-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-1.5">
                  <p>
                    Conectá una wallet Stellar (Freighter, xBull, WalletConnect) y tené USDC (SAC) en Testnet. El flujo es directo y descentralizado.
                  </p>
                  <p className="text-[var(--warn)]/90 font-bold">
                    ⚠️ CUSTODIA: los fondos quedan 12 meses. Si ninguna app verificadora certifica hitos en ese plazo, el sponsor puede reclamar el remanente.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-[var(--border)] p-3 space-y-2">
                <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Asset</span>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-lg px-3 py-1.5 text-[11px] font-bold bg-teal-600 text-white">
                    USDC testnet · demo
                  </span>
                  <span
                    className="rounded-lg px-3 py-1.5 text-[11px] font-bold border border-[var(--border)] text-[var(--muted)]"
                    title={`SAC oficial ${USDT0_OFFICIAL.sac}. No existe en testnet.`}
                  >
                    USDT0 oficial · próximamente
                  </span>
                </div>
                <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                  Testnet: USDC Circle. USDT0 oficial: próximamente (solo mainnet).
                </p>
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

              <div className="space-y-2">
                <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">App que va a certificar el hito</span>
                <div className="flex flex-wrap gap-2">
                  {assignableApps.map((app) => (
                    <button
                      key={app.id}
                      type="button"
                      onClick={() => setSelectedAppId(app.id)}
                      className={`rounded-lg px-3 py-1.5 text-[11px] font-bold border transition-all cursor-pointer ${
                        selectedAppId === app.id
                          ? "bg-teal-600 text-white border-teal-500"
                          : "bg-[var(--card-bg)] text-[var(--muted)] border-[var(--border)] hover:border-teal-500/50"
                      }`}
                    >
                      {app.name} · {app.priceUsdc} USDC
                      {app.status === "wip" ? " · en desarrollo" : ""}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-[var(--muted)] leading-relaxed">{selectedApp.milestone}</p>
                {selectedApp.oracleAddress.startsWith("G") ? (
                  <p className="text-[10px] font-mono text-[var(--muted)] break-all leading-relaxed">
                    Firma certify / assign: {selectedApp.oracleAddress}
                    {selectedApp.payoutAddress.startsWith("G") ? (
                      <>
                        <br />
                        Cobra 97.5%: {selectedApp.payoutAddress}
                      </>
                    ) : null}
                  </p>
                ) : null}
              </div>

              {isConnected && amount && Number(amount) < selectedApp.priceUsdc && Number(amount) > 0 && (
                <div className="rounded-xl border border-yellow-500/20 bg-[var(--warn-bg)] p-4 space-y-3">
                  <div className="flex gap-2.5 items-start">
                    <AlertTriangle className="h-5 w-5 text-[var(--warn)] flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-[var(--warn)] uppercase tracking-wider">Aporte parcial</h4>
                      <p className="text-xs text-[var(--warn)] leading-relaxed">
                        El hito de {selectedApp.name} cuesta {selectedApp.priceUsdc} USDC. El depósito queda en escrow igual; podés completar o elegir otra app.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <button 
                      onClick={() => setAmount(String(selectedApp.priceUsdc))}
                      className="flex-1 rounded-lg bg-[var(--warn-bg)] hover:bg-[var(--warn-border)] py-2 px-3 text-xs font-bold text-[var(--warn)] transition-all cursor-pointer text-center"
                    >
                      Completar {selectedApp.name} ({selectedApp.priceUsdc} USDC)
                    </button>
                    <button 
                      onClick={() => {
                        const cheaper = IMPACT_APPS.find((app) => app.priceUsdc <= Number(amount));
                        if (cheaper) setSelectedAppId(cheaper.id);
                      }}
                      className="flex-1 rounded-lg bg-[var(--card-bg)] hover:bg-[var(--teal-light)] py-2 px-3 text-xs font-bold text-[var(--muted)] border border-[var(--border)] transition-all cursor-pointer text-center"
                    >
                      Elegir un hito más chico
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

              {(lastDeposit || (isConnected && address && escrowBalance > 0)) && (
                <CertifyDemoButton
                  sponsor={lastDeposit?.sponsor || address || ""}
                  amount={selectedApp.priceUsdc}
                />
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

      {/* Presupuesto ilustrativo (no es on-chain) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 w-full">
        <div className="glass-card p-8 rounded-2xl space-y-6">
          <div className="border-b border-[var(--border)] pb-4">
            <span className="text-xs font-bold text-teal-500 uppercase tracking-widest">Planificación</span>
            <h2 className="text-xl font-bold text-[var(--foreground)] font-serif flex items-center gap-2 mt-1">
              <Activity className="h-5 w-5 text-teal-500" />
              Cuántos hitos con este presupuesto
            </h2>
            <p className="text-xs text-[var(--muted)] mt-1">
              Proyección simple: precio de lock por app vs presupuesto total.
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {IMPACT_APPS.map((app) => (
                <div key={app.id} className="p-5 rounded-xl border border-[var(--border)] bg-white/2 space-y-4">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-[var(--foreground)]">{app.categoryLabel} ({app.name})</h3>
                      <p className="text-xs text-[var(--muted)] mt-0.5">{app.tagline}</p>
                    </div>
                    <span className="rounded-lg bg-[var(--teal-light)] px-2 py-1 text-xs font-bold text-teal-500 font-mono whitespace-nowrap">
                      ${app.priceUsdc} c/u
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-[var(--muted)]">Hitos con este presupuesto:</span>
                      <strong className="text-[var(--foreground)]">{Math.floor(simBudget / app.priceUsdc)}</strong>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[var(--muted)]">Remanente:</span>
                      <span className="text-[var(--muted)] font-mono">{simBudget % app.priceUsdc} USDC</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InvestPage() {
  return (
    <Suspense fallback={<div className="min-h-[50vh]" />}>
      <InvestPortal />
    </Suspense>
  );
}
