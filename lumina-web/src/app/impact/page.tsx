"use client";

import { useEffect, useState } from "react";
import { useChain, NetworkType } from "@/context/ChainContext";
import { getExplorerUrls } from "@/lib/explorer";
import { 
  Activity, Users, Coins, Award, ExternalLink, 
  ArrowUpRight, Sparkles, Shield, TrendingUp, AlertCircle
} from "lucide-react";

interface SponsorData {
  address: string;
  balance: number;
  impactScore: number;
}

export default function PublicImpactDashboard() {
  const { adapter, selectedNetwork, setSelectedNetwork } = useChain();
  const [sponsors, setSponsors] = useState<SponsorData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const urls = getExplorerUrls(selectedNetwork);

  useEffect(() => {
    let isMounted = true;

    async function loadOnChainData() {
      setLoading(true);
      setError(null);
      try {
        const addresses = await adapter.getHistoricSponsors();
        
        // Cargar en paralelo datos reales de cada sponsor
        const sponsorsInfoPromises = addresses.map(async (addr) => {
          try {
            const balance = await adapter.getEscrowBalance(addr);
            const impactScore = await adapter.getImpactScore(addr);
            return {
              address: addr,
              balance: isNaN(balance) ? 0 : balance,
              impactScore: isNaN(impactScore) ? 0 : impactScore
            };
          } catch (e) {
            console.error(`Error al cargar datos del sponsor ${addr}:`, e);
            return { address: addr, balance: 0, impactScore: 0 };
          }
        });

        const results = await Promise.all(sponsorsInfoPromises);
        
        if (isMounted) {
          // Ordenar por Impact Score descendente (Reputación SBT)
          const sorted = results.sort((a, b) => b.impactScore - a.impactScore);
          setSponsors(sorted);
          setLoading(false);
        }
      } catch (err: any) {
        console.error("Error al cargar panel de impacto:", err);
        if (isMounted) {
          setError("No se pudo conectar a los nodos RPC de la red seleccionada.");
          setLoading(false);
        }
      }
    }

    loadOnChainData();

    return () => {
      isMounted = false;
    };
  }, [adapter, selectedNetwork]);

  // Cálculos globales agregados
  const totalBalance = sponsors.reduce((acc, s) => acc + s.balance, 0);
  const totalImpact = sponsors.reduce((acc, s) => acc + s.impactScore, 0);
  const totalSponsors = sponsors.length;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] py-12 px-4 sm:px-6 lg:px-8">
      {/* SEO & Header Title */}
      <div className="max-w-7xl mx-auto text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-400 text-xs font-semibold mb-4">
          <Activity className="h-3 w-3 animate-pulse" />
          Monitoreo de Impacto On-Chain en Tiempo Real
        </div>
        <h1 className="text-4xl font-serif font-bold tracking-tight bg-gradient-to-r from-teal-400 via-green-400 to-emerald-500 bg-clip-text text-transparent sm:text-5xl">
          Dashboard de Impacto Público
        </h1>
        <p className="mt-4 text-base text-[var(--muted)] max-w-2xl mx-auto">
          Métricas agregadas y ranking de reputación SBT de patrocinadores corporativos. Infraestructura ReFi transparente para el financiamiento de hitos sociales y ecológicos.
        </p>

        {/* Network Selector on Page */}
        <div className="mt-6 inline-flex items-center gap-3 bg-[var(--card-bg)] border border-[var(--border)] rounded-full px-4 py-2 shadow-lg backdrop-blur-md">
          <span className="text-xs font-medium text-[var(--muted)]">Explorar red:</span>
          <div className="flex gap-2">
            {(["stellar-testnet", "avalanche-fuji", "base-sepolia"] as NetworkType[]).map((net) => {
              const isActive = selectedNetwork === net;
              const labels: Record<NetworkType, string> = {
                "stellar-testnet": "⚡ Stellar",
                "avalanche-fuji": "🔺 Avalanche",
                "base-sepolia": "🔵 Base"
              };
              return (
                <button
                  key={net}
                  onClick={() => setSelectedNetwork(net)}
                  id={`btn-select-net-${net}`}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    isActive 
                      ? "bg-gradient-to-r from-teal-600 to-green-600 text-white shadow-md" 
                      : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--muted-bg)]"
                  }`}
                >
                  {labels[net]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-10">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Total Funded */}
          <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-6 shadow-xl hover:shadow-2xl transition-all duration-300 group">
            <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-teal-500/10 blur-2xl group-hover:bg-teal-500/20 transition-all"></div>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400">
                <Coins className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Garantía Activa Total</p>
                <h3 className="text-3xl font-bold font-mono tracking-tight text-[var(--foreground)] mt-1">
                  {loading ? "..." : `${totalBalance.toLocaleString()} USDC`}
                </h3>
              </div>
            </div>
            <p className="text-[10px] text-[var(--muted)] mt-4">
              Fondos en custodia inteligente listos para ser liberados ante cumplimiento verificado.
            </p>
          </div>

          {/* Card 2: Impact Score */}
          <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-6 shadow-xl hover:shadow-2xl transition-all duration-300 group">
            <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-green-500/10 blur-2xl group-hover:bg-green-500/20 transition-all"></div>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10 text-green-400">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Impact Score Acumulado</p>
                <h3 className="text-3xl font-bold font-mono tracking-tight text-[var(--foreground)] mt-1">
                  {loading ? "..." : totalImpact.toLocaleString()}
                </h3>
              </div>
            </div>
            <p className="text-[10px] text-[var(--muted)] mt-4">
              Puntaje acumulado de reputación social mediante tokens Soulbound (SBT).
            </p>
          </div>

          {/* Card 3: Total Sponsors */}
          <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-6 shadow-xl hover:shadow-2xl transition-all duration-300 group">
            <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-emerald-500/10 blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Sponsors Activos</p>
                <h3 className="text-3xl font-bold font-mono tracking-tight text-[var(--foreground)] mt-1">
                  {loading ? "..." : totalSponsors}
                </h3>
              </div>
            </div>
            <p className="text-[10px] text-[var(--muted)] mt-4">
              Empresas y organizaciones financiando hitos de impacto de forma directa.
            </p>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 max-w-2xl mx-auto">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Leaderboard Section */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-serif font-bold text-[var(--foreground)] flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                SBT Leaderboard: Reputación de Sponsors
              </h2>
              <p className="text-xs text-[var(--muted)] mt-1">
                Clasificación de patrocinadores por contribución real de impacto emitida on-chain.
              </p>
            </div>
            <div className="text-xs text-[var(--muted)] bg-[var(--muted-bg)] px-3 py-1.5 rounded-lg border border-[var(--border)]">
              Red Activa: <span className="font-semibold text-teal-400">{urls.name}</span>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
              <p className="text-xs text-[var(--muted)]">Leyendo datos on-chain en tiempo real...</p>
            </div>
          ) : sponsors.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-sm text-[var(--muted)]">No se encontraron patrocinadores con fondos en esta red.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                    <th className="py-4 px-4 w-16">Puesto</th>
                    <th className="py-4 px-4">Sponsor (Wallet Address)</th>
                    <th className="py-4 px-4 text-right">Garantía Activa</th>
                    <th className="py-4 px-4 text-right">Soulbound Impact Score</th>
                    <th className="py-4 px-4 w-20 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {sponsors.map((sponsor, index) => {
                    const isTopThree = index < 3;
                    const placeColors = ["text-yellow-500", "text-slate-400", "text-amber-600"];
                    const explorerUrl = selectedNetwork === "stellar-testnet"
                      ? `https://stellar.expert/explorer/testnet/account/${sponsor.address}`
                      : selectedNetwork === "avalanche-fuji"
                        ? `https://testnet.snowtrace.io/address/${sponsor.address}`
                        : `https://sepolia.basescan.org/address/${sponsor.address}`;

                    return (
                      <tr 
                        key={sponsor.address} 
                        className="text-sm hover:bg-[var(--muted-bg)]/30 transition-colors"
                      >
                        <td className="py-4 px-4 font-bold">
                          {isTopThree ? (
                            <span className={`text-lg ${placeColors[index]}`}>🏆 {index + 1}</span>
                          ) : (
                            <span className="text-[var(--muted)] pl-2">{index + 1}</span>
                          )}
                        </td>
                        <td className="py-4 px-4 font-mono text-xs text-[var(--foreground)]">
                          <span className="hidden sm:inline">{sponsor.address}</span>
                          <span className="sm:hidden">{sponsor.address.slice(0, 8)}...{sponsor.address.slice(-6)}</span>
                        </td>
                        <td className="py-4 px-4 text-right font-mono font-semibold text-[var(--foreground)]">
                          {sponsor.balance.toLocaleString()} USDC
                        </td>
                        <td className="py-4 px-4 text-right font-semibold">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-400 font-mono text-xs">
                            <Shield className="h-3 w-3 shrink-0" />
                            {sponsor.impactScore} SBT
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <a
                            href={explorerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--muted-bg)] hover:bg-teal-500/10 text-[var(--muted)] hover:text-teal-400 transition-all border border-[var(--border)]"
                            title="Ver en explorador de bloques"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
