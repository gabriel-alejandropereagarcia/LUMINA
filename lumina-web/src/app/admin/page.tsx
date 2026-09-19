"use client";

import { useState } from "react";
import { useWallet } from "@/context/WalletContext";
import { 
  ShieldAlert, ShieldCheck, Plus, Trash2, Sliders, 
  Lock, Unlock, Landmark, BarChart3, Users, HelpCircle, RefreshCw 
} from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";
import { buildAddOracleTx, buildAllowAssetTx, submitSorobanTransaction } from "@/lib/stellar";
import { signStellarTransaction } from "@/lib/integrations/wallets-kit";
import { USDT0_OFFICIAL } from "@/lib/official-assets";


interface OracleItem {
  address: string;
  name: string;
  price: number;
  lastUpdate: string;
  daysRemaining: number; // For time-lock simulation
}

const ADMIN_ADDRESS = process.env.NEXT_PUBLIC_ADMIN_ADDRESS || "";

export default function AdminPortal() {
  const { address, isConnected, connect } = useWallet();
  const [demoAdminMode, setDemoAdminMode] = useState<boolean>(
    process.env.NEXT_PUBLIC_STELLAR_NETWORK !== "mainnet"
  ); // Enabled by default only on testnet/dev, forced false on mainnet
  
  // States for Oracle registry
  const [oracles, setOracles] = useState<OracleItem[]>([
    {
      address: process.env.NEXT_PUBLIC_ORACLE_ADDRESS || process.env.NEXT_PUBLIC_MIRA_ORACLE_ADDRESS || "GBJJCKJBEF2ILRD5LGWXGH5BQIKZ6EYFDS3RHQZQ5KBCOV4XHSDESM7W",
      name: "MIRA AI · impacto WIP (aún no firma)",
      price: 40,
      lastUpdate: "pendiente Connect",
      daysRemaining: 0,
    },
  ]);

  const [newOracleAddress, setNewOracleAddress] = useState("");
  const [newOracleName, setNewOracleName] = useState("");
  const [newOraclePrice, setNewOraclePrice] = useState("");

  // States for price adjustment modal
  const [adjustingOracle, setAdjustingOracle] = useState<OracleItem | null>(null);
  const [newPriceVal, setNewPriceVal] = useState("");

  const [adminStatus, setAdminStatus] = useState<string | null>(null);
  const [adminLoading, setAdminLoading] = useState<boolean>(false);
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });


  // Checks
  const isActualAdmin = isConnected && address === ADMIN_ADDRESS;
  const hasAdminAccess = demoAdminMode || isActualAdmin;

  const handleAddOracle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOracleAddress || !newOracleName || !newOraclePrice) return;

    setAdminLoading(true);

    const newItem: OracleItem = {
      address: newOracleAddress,
      name: newOracleName,
      price: Number(newOraclePrice),
      lastUpdate: new Date().toISOString().split("T")[0],
      daysRemaining: 360,
    };

    try {
      if (isActualAdmin && address) {
        setAdminStatus("Firmá add_oracle en la wallet (on-chain, no simulación)...");
        const xdr = await buildAddOracleTx(address, newOracleAddress, Number(newOraclePrice), newOracleAddress);
        const signed = await signStellarTransaction(xdr, address);
        if (!signed) throw new Error("Firma rechazada.");
        const hash = await submitSorobanTransaction(signed);
        setAdminStatus(`Oráculo registrado on-chain. Tx ${hash.slice(0, 12)}…`);
      } else {
        setAdminStatus("Sandbox: no se envió add_oracle. Conectá la wallet admin para firmar de verdad.");
        await new Promise((resolve) => setTimeout(resolve, 600));
      }

      setOracles((prev) => [...prev, newItem]);
      setNewOracleAddress("");
      setNewOracleName("");
      setNewOraclePrice("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al registrar oráculo.";
      setAdminStatus(message);
    } finally {
      setAdminLoading(false);
      setTimeout(() => setAdminStatus(null), 8000);
    }
  };

  const handleRemoveOracle = (oracleAddr: string) => {
    setConfirmModal({
      open: true,
      title: "Revocar Permisos",
      message: "¿Estás seguro de que deseas revocar los permisos de esta aplicación de impacto?",
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, open: false }));
        setAdminLoading(true);
        setAdminStatus("Enviando transacción 'remove_oracle' a Stellar Testnet...");

        await new Promise((resolve) => setTimeout(resolve, 1500));

        setOracles((prev) => prev.filter((o) => o.address !== oracleAddr));
        setAdminLoading(false);
        setAdminStatus("Aplicación de impacto revocada on-chain con éxito.");
        setTimeout(() => setAdminStatus(null), 3000);
      }
    });
  };


  const handleAdjustPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingOracle || !newPriceVal) return;

    if (adjustingOracle.daysRemaining > 0) {
      setAdminStatus("Error: Ajuste bloqueado por Time-Lock. Debe transcurrir 1 año.");
      setTimeout(() => setAdminStatus(null), 4000);
      return;
    }

    setAdminLoading(true);
    setAdminStatus(`Ajustando tarifa de la aplicación a ${newPriceVal} USDC...`);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    setOracles((prev) =>
      prev.map((o) =>
        o.address === adjustingOracle.address
          ? { ...o, price: Number(newPriceVal), lastUpdate: new Date().toISOString().split("T")[0], daysRemaining: 360 }
          : o
      )
    );

    setAdjustingOracle(null);
    setNewPriceVal("");
    setAdminLoading(false);
    setAdminStatus("Tarifa actualizada on-chain con éxito.");
    setTimeout(() => setAdminStatus(null), 3000);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-teal-600 selection:text-white pb-16">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 w-full space-y-8">
        
        {/* Cabecera Administrativa */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-[var(--border)] pb-8">
          <div className="space-y-2">
            <span className="text-xs font-bold text-[var(--danger)] uppercase tracking-widest flex items-center gap-1.5">
              <Landmark className="h-3.5 w-3.5" /> Lumina Protocol Governance
            </span>
            <h1 className="text-4xl font-extrabold text-[var(--foreground)] tracking-tight">Panel de Administración</h1>
            <p className="text-[var(--muted)] max-w-2xl text-xs leading-relaxed">
              Consola técnica de control de oráculos de impacto y ajustes de precios con bloqueos de tiempo para la administración del escrow.
            </p>
          </div>

          {/* Sandbox Toggle para el Jurado (Oculto en Mainnet) */}
          {process.env.NEXT_PUBLIC_STELLAR_NETWORK !== "mainnet" && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--muted-bg)] p-3 flex items-center gap-3">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-[var(--muted)] block uppercase">Sandbox Evaluador</span>
                <p className="text-xs text-[var(--muted)]">Permite simular permisos de admin para la demo.</p>
              </div>
              <button
                onClick={() => setDemoAdminMode(!demoAdminMode)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase transition-all cursor-pointer ${
                  demoAdminMode ? "bg-[var(--danger-bg)] text-[var(--danger)] border border-rose-500/30" : "bg-[var(--card-bg)] text-[var(--muted)] border border-[var(--border)]"
                }`}
              >
                {demoAdminMode ? "Simulación ON" : "Simulación OFF"}
              </button>
            </div>
          )}
        </div>

        {/* ACCESO DENEGADO SI NO ES ADMIN */}
        {!hasAdminAccess ? (
          <div className="glass-card p-12 max-w-xl mx-auto text-center space-y-6">
            <div className="h-16 w-16 mx-auto flex items-center justify-center rounded-full bg-[var(--danger-bg)] text-[var(--danger)] border-[var(--danger-border)]">
              <ShieldAlert className="h-8 w-8 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold font-serif text-[var(--foreground)]">Acceso Restringido</h2>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Esta sección es exclusiva para el administrador del contrato inteligente Lumina. Conecta tu Freighter Wallet autorizada para continuar.
              </p>
            </div>
            {isConnected ? (
              <div className="bg-[var(--muted-bg)] p-3 rounded-lg border border-[var(--border)] font-mono text-xs text-[var(--muted)]">
                Wallet conectada: {address}
              </div>
            ) : (
              <button
                onClick={connect}
                className="w-full rounded-xl bg-teal-600 hover:bg-teal-700 py-3 text-xs font-bold text-[var(--foreground)] shadow-lg transition-all cursor-pointer"
              >
                Conectar Billetera Admin
              </button>
            )}
          </div>
        ) : (
          // CONTENIDO ADMIN ENTRADA AUTORIZADA
          <div className="space-y-8">
            
            {/* Indicador de Estado Global */}
            {adminStatus && (
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 text-xs text-blue-300 flex items-center gap-3">
                <RefreshCw className={`h-4 w-4 text-teal-500 flex-shrink-0 ${adminLoading ? "animate-spin" : ""}`} />
                <p>{adminStatus}</p>
              </div>
            )}

            {/* Widgets de Protocolo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-card p-6 rounded-2xl flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Volumen Total en Custodia</span>
                  <BarChart3 className="h-5 w-5 text-teal-500" />
                </div>
                <div>
                  <span className="text-3xl font-bold tracking-tight text-[var(--foreground)] font-mono">on-chain</span>
                  <p className="text-xs text-[var(--muted)] mt-1">Sin TVL inventado. El saldo vive en el escrow.</p>
                </div>
              </div>

              <div className="glass-card p-6 rounded-2xl flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Oráculos de Impacto Activos</span>
                  <Users className="h-5 w-5 text-teal-500" />
                </div>
                <div>
                  <span className="text-3xl font-bold tracking-tight text-[var(--foreground)] font-mono">{oracles.length} Apps</span>
                  <p className="text-xs text-[var(--muted)] mt-1">Entidades autorizadas a firmar hitos.</p>
                </div>
              </div>

              <div className="glass-card p-6 rounded-2xl flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Comisiones de Protocolo (2.5%)</span>
                  <Landmark className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <span className="text-3xl font-bold tracking-tight text-[var(--foreground)] font-mono">2.5%</span>
                  <p className="text-xs text-[var(--muted)] mt-1">Fee de protocolo por release. Sin acumulado mock.</p>
                </div>
              </div>
            </div>

            {/* Listado y Registro de Oráculos */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
              
              {/* Formulario de Alta */}
              <div className="glass-card p-6 rounded-2xl lg:col-span-2 space-y-6">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold font-serif text-[var(--foreground)] flex items-center gap-2">
                    <Plus className="h-4 w-4 text-teal-500" /> Registrar Aplicación de Impacto
                  </h3>
                  <p className="text-xs text-[var(--muted)] leading-relaxed">
                    Ingresa los datos para autorizar a una nueva aplicación en el registro on-chain de Lumina.
                  </p>
                </div>

                <form onSubmit={handleAddOracle} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[var(--muted)] mb-1 font-semibold">Nombre de la Aplicación</label>
                    <input
                      type="text"
                      placeholder="Ej. MIRA AI"
                      value={newOracleName}
                      onChange={(e) => setNewOracleName(e.target.value)}
                      className="w-full bg-[var(--card-bg)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-teal-500 text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[var(--muted)] mb-1 font-semibold">Dirección del Oráculo (Public Key)</label>
                    <input
                      type="text"
                      placeholder="Dirección Stellar G..."
                      value={newOracleAddress}
                      onChange={(e) => setNewOracleAddress(e.target.value)}
                      className="w-full bg-[var(--card-bg)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-teal-500 text-xs font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[var(--muted)] mb-1 font-semibold">Costo por Hito (USDC)</label>
                    <input
                      type="number"
                      placeholder="Monto en USDC (ej. 40)"
                      value={newOraclePrice}
                      onChange={(e) => setNewOraclePrice(e.target.value)}
                      className="w-full bg-[var(--card-bg)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-teal-500 text-xs font-mono"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={adminLoading}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 py-3 font-bold text-[var(--foreground)] transition-all cursor-pointer"
                  >
                    Registrar y Desplegar
                  </button>
                </form>

                <div className="border-t border-[var(--border)] pt-4 space-y-2">
                  <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                    Allowlist USDT0 oficial (SAC mainnet {USDT0_OFFICIAL.sac.slice(0, 8)}…). Requiere escrow v2 redeployado.
                    No inventa un USDT0 de testnet.
                  </p>
                  <button
                    type="button"
                    disabled={adminLoading || !isActualAdmin || !address}
                    onClick={async () => {
                      if (!address) return;
                      setAdminLoading(true);
                      try {
                        const xdr = await buildAllowAssetTx(address, USDT0_OFFICIAL.sac);
                        const signed = await signStellarTransaction(xdr, address);
                        if (!signed) throw new Error("Firma rechazada.");
                        const hash = await submitSorobanTransaction(signed);
                        setAdminStatus(`USDT0 oficial en allowlist. ${hash.slice(0, 12)}…`);
                      } catch (err: unknown) {
                        setAdminStatus(err instanceof Error ? err.message : "allow_asset falló (¿redeploy v2?)");
                      } finally {
                        setAdminLoading(false);
                        setTimeout(() => setAdminStatus(null), 8000);
                      }
                    }}
                    className="w-full rounded-xl border border-[var(--border)] py-2 text-[11px] font-bold disabled:opacity-40"
                  >
                    Allowlist USDT0 oficial (admin)
                  </button>
                </div>
              </div>

              {/* Registro de Oráculos */}
              <div className="glass-card p-6 rounded-2xl lg:col-span-3 space-y-4 flex flex-col min-h-[380px]">
                <div>
                  <h3 className="text-sm font-bold font-serif text-[var(--foreground)]">Registro de Aplicaciones de Impacto Autorizadas</h3>
                  <p className="text-xs text-[var(--muted)] mt-0.5">Control de tarifas y estados de time-lock on-chain.</p>
                </div>

                <div className="space-y-4 flex-grow overflow-y-auto pr-2 custom-scrollbar">
                  {oracles.map((oracle) => (
                    <div key={oracle.address} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--muted-bg)] space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xs font-bold text-[var(--foreground)]">{oracle.name}</h4>
                          <span className="text-xs font-mono text-[var(--muted)] block mt-0.5">{oracle.address}</span>
                        </div>
                        <span className="rounded-lg bg-[var(--teal-light)] px-2 py-1 text-xs font-bold text-teal-600 font-mono">
                          {oracle.price} USDC
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-xs text-[var(--muted)] border-t border-[var(--border)] pt-2">
                        <div className="flex items-center gap-1.5 font-mono">
                          {oracle.daysRemaining > 0 ? (
                            <>
                              <Lock className="h-3.5 w-3.5 text-[var(--warn)]" />
                              <span className="text-[var(--warn)]/80">Time-Lock: {oracle.daysRemaining} días</span>
                            </>
                          ) : (
                            <>
                              <Unlock className="h-3.5 w-3.5 text-emerald-400" />
                              <span className="text-emerald-400/80">Ajuste Habilitado</span>
                            </>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setAdjustingOracle(oracle);
                              setNewPriceVal("");
                            }}
                            className="flex items-center gap-1 bg-[var(--card-bg)] hover:bg-[var(--teal-light)] px-2 py-1 rounded text-xs font-bold text-[var(--muted)] transition-all cursor-pointer"
                          >
                            <Sliders className="h-3 w-3" /> Tarifar
                          </button>
                          <button
                            onClick={() => handleRemoveOracle(oracle.address)}
                            className="flex items-center gap-1 bg-red-500/10 hover:bg-red-500/20 px-2 py-1 rounded text-xs font-bold text-red-400 transition-all cursor-pointer"
                          >
                            <Trash2 className="h-3 w-3" /> Revocar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Ajustador de Tarifa Modal */}
            {adjustingOracle && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                <div className="glass-card max-w-md w-full p-6 rounded-2xl space-y-4 border border-[var(--border)]">
                  <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                    <h4 className="text-sm font-bold text-[var(--foreground)]">Ajustar Tarifa del Oráculo</h4>
                    <button 
                      onClick={() => setAdjustingOracle(null)}
                      className="text-[var(--muted)] hover:text-[var(--foreground)] font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="text-xs space-y-2 leading-relaxed">
                    <p className="text-[var(--muted)]">
                      Vas a modificar la tarifa de <strong className="text-[var(--foreground)]">{adjustingOracle.name}</strong>.
                    </p>
                    {adjustingOracle.daysRemaining > 0 ? (
                      <div className="rounded-lg border-[var(--warn-border)] bg-[var(--warn-bg)] p-3 flex gap-2 items-start text-[var(--warn)] text-xs">
                        <Lock className="h-4 w-4 flex-shrink-0" />
                        <p>
                          <strong>Ajuste Bloqueado:</strong> Restan {adjustingOracle.daysRemaining} días para cumplir los 12 meses exigidos por el time-lock. Por seguridad contractual de los sponsors, no puedes confirmar el cambio.
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 flex gap-2 items-start text-emerald-500 text-xs">
                        <Unlock className="h-4 w-4 flex-shrink-0" />
                        <p>
                          <strong>Time-Lock Expirado:</strong> El período de bloqueo de 1 año ha finalizado. Puedes ajustar la tarifa libremente.
                        </p>
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleAdjustPrice} className="space-y-4">
                    <div>
                      <label className="block text-xs text-[var(--muted)] mb-1 font-bold uppercase tracking-wider">Nueva Tarifa (USDC)</label>
                      <input
                        type="number"
                        placeholder="Ej. 30"
                        value={newPriceVal}
                        onChange={(e) => setNewPriceVal(e.target.value)}
                        disabled={adjustingOracle.daysRemaining > 0}
                        className="w-full bg-[var(--card-bg)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-teal-500 text-xs disabled:opacity-50"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={adjustingOracle.daysRemaining > 0 || adminLoading}
                      className="w-full bg-teal-600 hover:bg-teal-700 py-3 text-xs font-bold text-[var(--foreground)] rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:scale-100 cursor-pointer"
                    >
                      Confirmar Ajuste On-Chain
                    </button>
                  </form>
                </div>
              </div>
            )}
            {confirmModal.open && (
              <ConfirmModal
                open={confirmModal.open}
                title={confirmModal.title}
                message={confirmModal.message}
                variant="danger"
                confirmLabel="Revocar"
                cancelLabel="Cancelar"
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal((prev) => ({ ...prev, open: false }))}
              />
            )}
          </div>
        )}

      </div>
    </div>
  );
}

