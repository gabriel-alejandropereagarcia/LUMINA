"use client";

import { useState } from "react";
import { ArrowLeftRight, Loader2 } from "lucide-react";
import { signAndSubmitStellarXdr } from "@/lib/integrations/sign-and-submit";
import { useToast } from "@/context/ToastContext";

type Props = {
  address: string | null;
};

export default function SoroswapPanel({ address }: Props) {
  const { toast } = useToast();
  const [amount, setAmount] = useState("5");
  const [side, setSide] = useState<"xlm-to-usdc" | "usdc-to-xlm">("xlm-to-usdc");
  const [loading, setLoading] = useState(false);

  const handleSwap = async () => {
    if (!address) {
      toast({ type: "error", title: "Wallet requerida", message: "Conectá una wallet Stellar para swappear." });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/integrations/soroswap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount), from: address, side }),
      });
      const data = await res.json();

      if (!data.configured) {
        toast({
          type: "info",
          title: "Soroswap listo para conectar",
          message: data.error || "Agregá SOROSWAP_API_KEY para cotizar y firmar swaps reales.",
        });
        return;
      }

      if (!data.xdr) {
        throw new Error(data.error || "Soroswap no devolvió un XDR para firmar.");
      }

      const hash = await signAndSubmitStellarXdr(data.xdr, address);
      toast({
        type: "success",
        title: "Swap enviado",
        message: "Ruteado con Soroswap (Aquarius / Phoenix / SDEX).",
        txHash: hash,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "No se pudo completar el swap.";
      toast({ type: "error", title: "Soroswap", message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
          Fees / liquidez · Soroswap
        </span>
        <ArrowLeftRight className="h-4 w-4 text-teal-500" />
      </div>
      <p className="text-xs text-[var(--muted)] leading-relaxed">
        Si te falta XLM para fees o USDC para el escrow, el router SCF (Soroswap) agrega Soroban + Classic.
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <select
          value={side}
          onChange={(e) => setSide(e.target.value as "xlm-to-usdc" | "usdc-to-xlm")}
          className="bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs font-semibold"
        >
          <option value="xlm-to-usdc">XLM → USDC</option>
          <option value="usdc-to-xlm">USDC → XLM</option>
        </select>
        <input
          type="number"
          min="0.1"
          step="0.1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm"
        />
        <button
          onClick={handleSwap}
          disabled={loading || !address}
          className="rounded-lg bg-teal-600 hover:bg-teal-700 px-4 py-2 text-xs font-bold text-white disabled:opacity-50 cursor-pointer"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Swap"}
        </button>
      </div>
    </div>
  );
}
