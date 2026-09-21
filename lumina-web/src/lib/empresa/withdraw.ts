import * as StellarSdk from "@stellar/stellar-sdk";
import { buildWithdrawTx, config, submitSorobanTransaction } from "@/lib/stellar";
import { getImpactApp } from "@/lib/impact-apps";
import { quantityFromLock } from "@/lib/hito/fact";
import type { Aporte } from "./types";

export function remainingUsd(aporte: Aporte): number {
  const app = getImpactApp(aporte.appId);
  const lockPrice = aporte.lockPriceUsd || app?.priceUsdc || 0;
  const used = (aporte.certifiedUnits ?? 0) * lockPrice;
  return Math.max(0, Number((aporte.amountUsd - used).toFixed(2)));
}

export function lockExpired(aporte: Aporte, now = new Date()): boolean {
  return now.getTime() >= new Date(aporte.lockUntil).getTime();
}

export async function maybeTreasuryWithdraw(aporte: Aporte): Promise<{
  attempted: boolean;
  hash?: string;
  error?: string;
}> {
  const secret = process.env.TREASURY_SECRET || process.env.SPONSOR_SECRET;
  if (!secret) return { attempted: false, error: "Sin TREASURY_SECRET." };

  const amount = remainingUsd(aporte);
  if (amount <= 0) return { attempted: false, error: "No queda saldo para devolver." };

  try {
    const keypair = StellarSdk.Keypair.fromSecret(secret);
    const sponsor = keypair.publicKey();
    if (aporte.sponsorAddress && aporte.sponsorAddress !== sponsor) {
      return { attempted: false, error: "Este pago no lo reservó esta tesorería." };
    }

    const xdr = await buildWithdrawTx(sponsor, amount);
    const tx = StellarSdk.TransactionBuilder.fromXDR(
      xdr,
      config.networkPassphrase,
    ) as StellarSdk.Transaction;
    tx.sign(keypair);
    const hash = await submitSorobanTransaction(tx.toXDR());
    return { attempted: true, hash };
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo devolver.";
    return { attempted: true, error: message };
  }
}

export function expectedQuantity(aporte: Aporte): number {
  const app = getImpactApp(aporte.appId);
  return quantityFromLock(aporte.amountUsd, aporte.lockPriceUsd || app?.priceUsdc || 40);
}
