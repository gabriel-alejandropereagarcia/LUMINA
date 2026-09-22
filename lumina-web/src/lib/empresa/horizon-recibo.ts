import { horizon, config } from "@/lib/stellar";
import type { ReciboVivo } from "./recibos";

export type { ReciboVivo };

const cache = new Map<string, ReciboVivo>();

function horizonTxUrl(hash: string): string {
  const base = config.horizonUrl.replace(/\/$/, "");
  return `${base}/transactions/${hash}`;
}

export async function leerRecibo(hash: string): Promise<ReciboVivo> {
  const key = hash.toLowerCase();
  const hit = cache.get(key);
  if (hit) return hit;

  const empty: ReciboVivo = { hash: key };
  if (!/^[a-f0-9]{64}$/.test(key)) return empty;

  try {
    const tx = await horizon.transactions().transaction(key).call();
    const at = typeof tx.created_at === "string" ? tx.created_at : undefined;
    let amountUsd: number | undefined;

    try {
      const ops = await horizon.operations().forTransaction(key).limit(20).call();
      for (const op of ops.records) {
        const record = op as {
          type?: string;
          amount?: string;
          asset_code?: string;
          asset_type?: string;
        };
        if (record.amount && (record.asset_code === "USDC" || record.asset_type === "native")) {
          amountUsd = Number(record.amount);
          break;
        }
        if (record.amount && !amountUsd) amountUsd = Number(record.amount);
      }
    } catch {
      // Sin operaciones el recibo igual tiene fecha.
    }

    const vivo: ReciboVivo = { hash: key, at, amountUsd };
    cache.set(key, vivo);
    return vivo;
  } catch {
    try {
      const response = await fetch(horizonTxUrl(key));
      if (!response.ok) return empty;
      const tx = (await response.json()) as { created_at?: string };
      const vivo: ReciboVivo = { hash: key, at: tx.created_at };
      cache.set(key, vivo);
      return vivo;
    } catch {
      return empty;
    }
  }
}

export async function leerRecibos(hashes: string[]): Promise<ReciboVivo[]> {
  const unique = [...new Set(hashes.map((item) => item.trim().toLowerCase()).filter(Boolean))];
  return Promise.all(unique.map(leerRecibo));
}
