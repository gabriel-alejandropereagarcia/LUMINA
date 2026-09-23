import { getImpactApp } from "@/lib/impact-apps";
import { currentPeriod, quantityFromLock, type HitoFact } from "@/lib/hito/fact";
import { subjectCommitment } from "@/lib/hito/hash";
import type { Aporte } from "@/lib/empresa/types";

export function pendingUnits(aporte: Aporte): number {
  const app = getImpactApp(aporte.appId);
  const lockPrice = aporte.lockPriceUsd || app?.priceUsdc || 40;
  const total = quantityFromLock(aporte.amountUsd, lockPrice);
  return Math.max(0, total - (aporte.certifiedUnits ?? 0));
}

export function factForAporteUnit(aporte: Aporte, unitIndex: number): HitoFact {
  const app = getImpactApp(aporte.appId);
  if (!app) throw new Error("La app de este pago ya no está en Lumina.");
  const lockPrice = aporte.lockPriceUsd || app.priceUsdc;
  return {
    protocol: "lumina",
    schemaId: app.schemaId,
    unitLabel: app.unitLabel,
    quantity: 1,
    period: currentPeriod(),
    // Código de reserva, no el del informe. La app viva reemplaza esto por el código del PDF que emitió.
    subjectCommitments: [subjectCommitment([aporte.id, String(unitIndex)])],
    sponsorRef: aporte.id,
    amountUsd: lockPrice,
    appId: app.id,
  };
}
