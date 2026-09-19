"use client";

import { useState } from "react";
import { ArrowRight, Building, Loader2, Mail, Wallet } from "lucide-react";
import { openKoyweOnramp } from "@/lib/integrations/koywe";
import { useToast } from "@/context/ToastContext";

type Props = {
  address: string | null;
  isConnected: boolean;
  onConnect: () => void;
};

export default function KoyweOnramp({ address, isConnected, onConnect }: Props) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleOpen = async () => {
    setLoading(true);
    try {
      await openKoyweOnramp({
        address: address || undefined,
        email: email.trim() || undefined,
        currencies: ["ARS", "CLP", "COP", "MXN", "PEN", "BRL"],
        tokens: ["USDC", "USDC Stellar"],
        testing: true,
      });
      toast({
        type: "info",
        title: "Widget Koywe abierto",
        message: "Cuando el USDC llegue a tu wallet, volvé a la pestaña Web3 y depositalo en el escrow de Lumina.",
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "No se pudo abrir Koywe.";
      toast({ type: "error", title: "On-ramp Koywe", message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-teal-600/20 bg-teal-600/5 p-4 text-xs text-teal-500 leading-relaxed flex gap-2.5 items-start">
        <Building className="h-4 w-4 text-teal-500 flex-shrink-0 mt-0.5" />
        <div className="space-y-1.5">
          <p>
            <strong className="text-[var(--foreground)]">On-ramp LATAM (Koywe):</strong> rieles locales
            (ARS, CLP, COP, MXN, PEN, BRL) hacia USDC. Está en la lista oficial SCF Integration Track.
          </p>
          <p className="text-[var(--muted)]">
            El widget corre en modo test. El USDC llega a tu wallet; el escrow de Lumina se carga después
            con la pestaña Web3. No simulamos acreditación.
          </p>
        </div>
      </div>

      {!isConnected && (
        <button
          onClick={onConnect}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-green-600 px-4 py-3 text-sm font-semibold text-white shadow-md hover:from-teal-700 hover:to-green-700 transition-all cursor-pointer"
        >
          <Wallet className="h-4 w-4" />
          Conectá una wallet Stellar para prellenar el destino
        </button>
      )}

      <div>
        <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">
          Email corporativo (OTP de Koywe)
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)]" />
          <input
            type="email"
            placeholder="finanzas@empresa.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[var(--card-bg)] border border-[var(--border)] rounded-xl pl-10 pr-4 py-3 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
          />
        </div>
      </div>

      {address && (
        <p className="text-xs text-[var(--muted)] font-mono break-all">
          Destino: {address}
        </p>
      )}

      <button
        onClick={handleOpen}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 px-6 py-4 text-base font-semibold text-white shadow-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Abriendo Koywe...
          </>
        ) : (
          <>
            Abrir on-ramp Koywe
            <ArrowRight className="h-5 w-5" />
          </>
        )}
      </button>
    </div>
  );
}
