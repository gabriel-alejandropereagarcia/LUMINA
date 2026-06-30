"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { StellarWalletsKit } from "@creit.tech/stellar-wallets-kit";
import { Networks } from "@creit.tech/stellar-wallets-kit/types";
import { defaultModules } from "@creit.tech/stellar-wallets-kit/modules/utils";
import { FREIGHTER_ID } from "@creit.tech/stellar-wallets-kit/modules/freighter";
import { getEscrowBalance, getImpactScore } from "@/lib/stellar";

interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  escrowBalance: number;
  impactScore: number;
  loading: boolean;
  connect: () => Promise<string | null>;
  disconnect: () => Promise<void>;
  refreshBalances: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Inicializar el kit de billeteras Stellar de forma estática (versión 2)
if (typeof window !== "undefined") {
  StellarWalletsKit.init({
    network: Networks.TESTNET,
    selectedWalletId: FREIGHTER_ID,
    modules: defaultModules(),
  });
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [escrowBalance, setEscrowBalance] = useState<number>(0);
  const [impactScore, setImpactScore] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const refreshBalances = useCallback(async () => {
    if (!address) return;
    try {
      const balance = await getEscrowBalance(address);
      const score = await getImpactScore(address);
      setEscrowBalance(balance);
      setImpactScore(score);
    } catch (e) {
      console.error("Error al actualizar balances de wallet:", e);
    }
  }, [address]);

  // Intentar reconectar si hay sesión guardada en localStorage
  useEffect(() => {
    const savedAddress = localStorage.getItem("lumina_wallet_address");
    if (savedAddress) {
      setAddress(savedAddress);
    }
  }, []);

  // Actualizar balances cuando se conecta una dirección
  useEffect(() => {
    if (address) {
      refreshBalances();
      const interval = setInterval(refreshBalances, 15000);
      return () => clearInterval(interval);
    }
  }, [address, refreshBalances]);

  const connect = async () => {
    setLoading(true);
    try {
      // Abre el modal de selección de billetera y retorna la dirección conectada
      const res = await StellarWalletsKit.authModal();
      if (res && res.address) {
        setAddress(res.address);
        localStorage.setItem("lumina_wallet_address", res.address);
        return res.address;
      }
      return null;
    } catch (error) {
      console.error("Error al conectar wallet:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const disconnect = async () => {
    try {
      await StellarWalletsKit.disconnect();
    } catch (e) {
      console.error("Error al desconectar kit:", e);
    }
    setAddress(null);
    setEscrowBalance(0);
    setImpactScore(0);
    localStorage.removeItem("lumina_wallet_address");
  };

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected: !!address,
        escrowBalance,
        impactScore,
        loading,
        connect,
        disconnect,
        refreshBalances,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet debe ser usado dentro de un WalletProvider");
  }
  return context;
}
