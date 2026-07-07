"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { ChainAdapter } from "@/lib/adapters/chain-adapter";
import { StellarAdapter } from "@/lib/adapters/stellar-adapter";
import { EvmAdapter } from "@/lib/adapters/evm-adapter";

export type NetworkType = "stellar-testnet" | "avalanche-fuji" | "base-sepolia";

interface ChainContextType {
  selectedNetwork: NetworkType;
  setSelectedNetwork: (network: NetworkType) => void;
  adapter: ChainAdapter;
}

const ChainContext = createContext<ChainContextType | undefined>(undefined);

export function ChainProvider({ children }: { children: React.ReactNode }) {
  const [selectedNetwork, setSelectedNetworkState] = useState<NetworkType>("stellar-testnet");

  // Leer red guardada en localStorage al montar
  useEffect(() => {
    const savedNetwork = localStorage.getItem("lumina_selected_network") as NetworkType;
    if (savedNetwork && ["stellar-testnet", "avalanche-fuji", "base-sepolia"].includes(savedNetwork)) {
      setSelectedNetworkState(savedNetwork);
    }
  }, []);

  const setSelectedNetwork = (network: NetworkType) => {
    setSelectedNetworkState(network);
    localStorage.setItem("lumina_selected_network", network);
  };

  const adapter = useMemo(() => {
    switch (selectedNetwork) {
      case "avalanche-fuji":
        return new EvmAdapter("avalanche-fuji", "Avalanche Fuji");
      case "base-sepolia":
        return new EvmAdapter("base-sepolia", "Base Sepolia");
      case "stellar-testnet":
      default:
        return new StellarAdapter();
    }
  }, [selectedNetwork]);

  return (
    <ChainContext.Provider value={{ selectedNetwork, setSelectedNetwork, adapter }}>
      {children}
    </ChainContext.Provider>
  );
}

export function useChain() {
  const context = useContext(ChainContext);
  if (context === undefined) {
    throw new Error("useChain debe ser usado dentro de un ChainProvider");
  }
  return context;
}
