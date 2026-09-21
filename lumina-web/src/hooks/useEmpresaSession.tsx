"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { EmpresaSession } from "@/lib/empresa/types";

export type FiatRailPublic = {
  id: string;
  label: string;
  live: boolean;
  notes: string;
  companySeesWallet?: boolean;
};

type EmpresaSessionContextValue = {
  session: EmpresaSession | null;
  rail: FiatRailPublic | null;
  loading: boolean;
  refresh: () => Promise<EmpresaSession | null>;
  logout: () => Promise<void>;
  setSession: (session: EmpresaSession | null) => void;
};

const EmpresaSessionContext = createContext<EmpresaSessionContextValue | undefined>(undefined);

export function EmpresaSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<EmpresaSession | null>(null);
  const [rail, setRail] = useState<FiatRailPublic | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/empresa/session");
      const data = await response.json();
      const next = (data.session ?? null) as EmpresaSession | null;
      setSession(next);
      setRail(data.rail ?? null);
      return next;
    } catch {
      setSession(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    await fetch("/api/empresa/session", { method: "DELETE" });
    setSession(null);
  }, []);

  const value: EmpresaSessionContextValue = {
    session,
    rail,
    loading,
    refresh,
    logout,
    setSession,
  };

  return (
    <EmpresaSessionContext.Provider value={value}>
      {children}
    </EmpresaSessionContext.Provider>
  );
}

export function useEmpresaSession() {
  const value = useContext(EmpresaSessionContext);
  if (!value) {
    throw new Error("useEmpresaSession debe usarse dentro de EmpresaSessionProvider.");
  }
  return value;
}
