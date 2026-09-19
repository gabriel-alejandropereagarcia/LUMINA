"use client";

import { ArrowRightLeft } from "lucide-react";
import { CCTP_SOURCE_DOMAINS, CCTP_STELLAR_DOMAIN, isCctpReady } from "@/lib/integrations/cctp";
import type { NetworkType } from "@/context/ChainContext";

type Props = {
  network: NetworkType;
};

export default function CctpHint({ network }: Props) {
  if (network === "stellar-testnet") return null;
  const sourceDomain = CCTP_SOURCE_DOMAINS[network];

  return (
    <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 text-xs text-blue-200 leading-relaxed flex gap-2.5 items-start">
      <ArrowRightLeft className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
      <div className="space-y-1">
        <p>
          <strong className="text-[var(--foreground)]">Circle CCTP:</strong> para mover USDC 1:1 desde{" "}
          {network === "base-sepolia" ? "Base" : "Avalanche"} (dominio {sourceDomain}) hacia Stellar
          (dominio {CCTP_STELLAR_DOMAIN}) hay que quemar en EVM con mintRecipient = CctpForwarder.
        </p>
        <p className="text-[var(--muted)]">
          {isCctpReady()
            ? "Forwarder configurado. El helper prepareCctpBurnToStellar arma hookData con tu wallet G…."
            : "Definí NEXT_PUBLIC_CCTP_FORWARDER con el contrato CctpForwarder de testnet antes de firmar burns."}
        </p>
      </div>
    </div>
  );
}
