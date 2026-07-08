"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWallet } from "@/context/WalletContext";
import { useState, useEffect } from "react";
import { Wallet, LogOut, Sparkles, AlertTriangle, RefreshCw } from "lucide-react";
import { isConnected as isFreighterInstalled } from "@stellar/freighter-api";
import ThemeToggle from "@/components/ThemeToggle";
import { useChain, NetworkType } from "@/context/ChainContext";


export default function Navbar() {
  const pathname = usePathname();
  const { address, isConnected, connect, disconnect, loading } = useWallet();
  const { selectedNetwork, setSelectedNetwork } = useChain();
  const [hasFreighter, setHasFreighter] = useState<boolean>(true);

  useEffect(() => {
    const checkFreighter = async () => {
      try {
        const installed = await isFreighterInstalled();
        setHasFreighter(!!installed);
      } catch (e) {
        setHasFreighter(false);
      }
    };
    checkFreighter();
  }, []);

  const ADMIN_ADDRESS = process.env.NEXT_PUBLIC_ADMIN_ADDRESS || "";

  const navLinks = [
    { name: "Inicio", path: "/" },
    { name: "Impacto", path: "/impact" },
    { name: "Mi Panel", path: "/sponsor" },
    { name: "Invertir", path: "/invest" },
    ...(isConnected && address === ADMIN_ADDRESS ? [{ name: "Gobernanza", path: "/admin" }] : []),
    { name: "Libro Blanco", path: "/presentation" },
    { name: "Arbitraje", path: "/jury" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-[var(--background)]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-teal-600 to-green-600 shadow-md group-hover:opacity-90 transition-opacity">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="font-serif text-xl font-bold tracking-tight text-[var(--foreground)]">
            Lumina
          </span>
        </Link>

        <nav className="hidden md:flex space-x-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link
                key={link.path}
                href={link.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[var(--teal-light)] text-[var(--teal)] font-semibold"
                    : "text-[var(--muted)] hover:bg-[var(--muted-bg)] hover:text-[var(--foreground)]"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <select
            value={selectedNetwork}
            onChange={(e) => setSelectedNetwork(e.target.value as NetworkType)}
            className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg px-2 py-1.5 text-xs font-semibold text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer hidden sm:block"
          >
            <option value="stellar-testnet">⚡ Stellar</option>
            <option value="avalanche-fuji">🔺 Avalanche</option>
            <option value="base-sepolia">🔵 Base</option>
          </select>

          <ThemeToggle />
          {!hasFreighter && !isConnected && selectedNetwork === "stellar-testnet" && (
            <a
              href="https://www.freighter.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full border border-[var(--gold-light)] bg-[var(--gold-light)] text-[var(--gold)] text-xs font-semibold hover:opacity-80 transition-all"
              title="Obtener extensión de Freighter"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              Instalar Freighter
            </a>
          )}

          {isConnected && address ? (
            <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card-bg)] pl-3 pr-1 py-1">
              <span className="text-xs font-mono text-[var(--foreground)]" id="wallet-address-display">
                {address.slice(0, 4)}...{address.slice(-4)}
              </span>
              <button
                onClick={disconnect}
                id="btn-disconnect-wallet"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                title="Desconectar Billetera"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={connect}
              disabled={loading}
              id="btn-connect-wallet"
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-teal-600 to-green-600 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:from-teal-700 hover:to-green-700 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Wallet className="h-4 w-4" />
              )}
              {loading ? "Conectando..." : "Conectar Wallet"}
            </button>

          )}
        </div>
      </div>
    </header>
  );
}
