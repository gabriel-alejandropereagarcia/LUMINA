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

export type LuminaOpsPublic = {
  treasuryReady: boolean;
  oracleReady: boolean;
  koyweReady: boolean;
  mailReady: boolean;
  persistReady: boolean;
};

type EmpresaSessionContextValue = {
  session: EmpresaSession | null;
  emails: string[];
  rail: FiatRailPublic | null;
  ops: LuminaOpsPublic | null;
  caminoPublico: boolean;
  loading: boolean;
  refresh: () => Promise<EmpresaSession | null>;
  logout: () => Promise<void>;
  setSession: (session: EmpresaSession | null) => void;
};

const EmpresaSessionContext = createContext<EmpresaSessionContextValue | undefined>(undefined);

export function EmpresaSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<EmpresaSession | null>(null);
  const [emails, setEmails] = useState<string[]>([]);
  const [rail, setRail] = useState<FiatRailPublic | null>(null);
  const [ops, setOps] = useState<LuminaOpsPublic | null>(null);
  const [caminoPublico, setCaminoPublico] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/empresa/session");
      const data = await response.json();
      const next = (data.session ?? null) as EmpresaSession | null;
      setSession(next);
      setEmails(Array.isArray(data.emails) ? data.emails : []);
      setRail(data.rail ?? null);
      setOps(data.ops ?? null);
      setCaminoPublico(Boolean(data.caminoPublico));
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
    setEmails([]);
    setCaminoPublico(false);
  }, []);

  const value: EmpresaSessionContextValue = {
    session,
    emails,
    rail,
    ops,
    caminoPublico,
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
