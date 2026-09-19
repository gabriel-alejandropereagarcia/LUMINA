export type HitoFact = {
  protocol: "lumina";
  schemaId: string;
  unitLabel: string;
  quantity: number;
  period: string;
  subjectCommitments: string[];
  sponsorRef: string;
  amountUsd: number;
  appId: string;
};

export const LUMINA_CLAIMS =
  "Lumina registra el pago, la unicidad del hash y que la ficha de la app estaba publicada. No visita el aula y no sigue el CBU.";

export const APP_CLAIMS =
  "La app de impacto afirma que el hecho ocurrió, según su ficha. Lumina no avala el gasto posterior del 97,5%.";

export function currentPeriod(date = new Date()): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function quantityFromLock(amountUsd: number, lockPriceUsd: number): number {
  if (!Number.isFinite(amountUsd) || !Number.isFinite(lockPriceUsd) || lockPriceUsd <= 0) {
    return 1;
  }
  return Math.max(1, Math.floor(amountUsd / lockPriceUsd + 1e-9));
}

export function canonicalFact(fact: HitoFact): string {
  const commitments = [...fact.subjectCommitments].map((item) => item.toLowerCase()).sort();
  return JSON.stringify({
    protocol: "lumina",
    schemaId: fact.schemaId,
    unitLabel: fact.unitLabel,
    quantity: fact.quantity,
    period: fact.period,
    subjectCommitments: commitments,
    sponsorRef: fact.sponsorRef,
    amountUsd: fact.amountUsd,
    appId: fact.appId,
  });
}

export function uniquenessKeys(fact: HitoFact): string[] {
  return fact.subjectCommitments.map(
    (commitment) => `${fact.schemaId}|${fact.period}|${commitment.toLowerCase()}`,
  );
}

export type ImpactTotalsRow = {
  schemaId: string;
  appId: string;
  appName: string;
  unitLabel: string;
  quantity: number;
  amountUsd: number;
};

export function aggregateBySchema(
  rows: Array<{
    schemaId?: string;
    appId: string;
    appName: string;
    unitLabel?: string;
    quantity?: number;
    amountUsd: number;
  }>,
): ImpactTotalsRow[] {
  const map = new Map<string, ImpactTotalsRow>();
  for (const row of rows) {
    if (!row.schemaId || !row.unitLabel || !row.quantity) continue;
    const current = map.get(row.schemaId) ?? {
      schemaId: row.schemaId,
      appId: row.appId,
      appName: row.appName,
      unitLabel: row.unitLabel,
      quantity: 0,
      amountUsd: 0,
    };
    current.quantity += row.quantity;
    current.amountUsd += row.amountUsd;
    map.set(row.schemaId, current);
  }
  return [...map.values()].sort((a, b) => b.quantity - a.quantity);
}
