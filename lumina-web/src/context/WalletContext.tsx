"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useChain } from "./ChainContext";

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

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { adapter, selectedNetwork } = useChain();
  const [address, setAddress] = useState<string | null>(null);
  const [escrowBalance, setEscrowBalance] = useState<number>(0);
  const [impactScore, setImpactScore] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const refreshBalances = useCallback(async () => {
    if (!address) return;
    try {
      const balance = await adapter.getEscrowBalance(address);
      const score = await adapter.getImpactScore(address);
      setEscrowBalance(balance);
      setImpactScore(score);
    } catch (e) {
      console.error("Error al actualizar balances de wallet:", e);
    }
  }, [address, adapter]);

  // Intentar reconectar si hay sesión guardada en localStorage
  useEffect(() => {
    const savedAddress = localStorage.getItem("lumina_wallet_address");
    if (savedAddress) {
      setAddress(savedAddress);
    }
  }, []);

  // Sincronizar cookie de sesión para validación server-side en el middleware
  useEffect(() => {
    if (address) {
      document.cookie = `admin_address=${address}; path=/; max-age=3600; SameSite=Strict`;
    } else {
      document.cookie = "admin_address=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
    }
  }, [address]);

  // Actualizar balances cuando se conecta una dirección o se cambia de red
  useEffect(() => {
    if (address) {
      refreshBalances();
      const interval = setInterval(refreshBalances, 15000);
      return () => clearInterval(interval);
    } else {
      setEscrowBalance(0);
      setImpactScore(0);
    }
  }, [address, selectedNetwork, refreshBalances]);

  const connect = async () => {
    setLoading(true);
    try {
      const walletInfo = await adapter.connect();
      if (walletInfo && walletInfo.address) {
        setAddress(walletInfo.address);
        localStorage.setItem("lumina_wallet_address", walletInfo.address);
        return walletInfo.address;
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
      await adapter.disconnect();
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
