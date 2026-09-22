import * as StellarSdk from "@stellar/stellar-sdk";
import {
  buildApproveTx,
  buildAssignOracleTx,
  buildDepositTx,
  config,
  submitSorobanTransaction,
  USDC_CONTRACT_ID,
} from "@/lib/stellar";
import { getImpactApp } from "@/lib/impact-apps";
import { isTreasuryDepositEnabled } from "./rails";
import type { Aporte } from "./types";

/**
 * Tesorería Lumina reserva el pago con la app que la empresa eligió (aporte.appId).
 */
export async function maybeTreasuryDeposit(aporte: Aporte): Promise<{
  attempted: boolean;
  hash?: string;
  assignHash?: string;
  sponsor?: string;
  error?: string;
}> {
  if (!isTreasuryDepositEnabled()) {
    return { attempted: false };
  }
  const secret = process.env.TREASURY_SECRET || process.env.SPONSOR_SECRET;
  if (!secret) return { attempted: false, error: "Sin TREASURY_SECRET." };

  const app = getImpactApp(aporte.appId);
  const oracle = aporte.oracleAddress || app?.oracleAddress || "";
  if (!oracle.startsWith("G")) {
    return { attempted: false, error: "Esa app todavía no tiene cuenta que confirma." };
  }

  try {
    const keypair = StellarSdk.Keypair.fromSecret(secret);
    const sponsor = keypair.publicKey();

    await signAndSubmit(await buildApproveTx(sponsor, aporte.amountUsd), keypair);
    const hash = await signAndSubmit(await buildDepositTx(sponsor, aporte.amountUsd), keypair);

    let assignHash: string | undefined;
    try {
      assignHash = await signAndSubmit(
        await buildAssignOracleTx(sponsor, USDC_CONTRACT_ID, oracle),
        keypair,
      );
    } catch (error) {
      console.error("assign_oracle tesorería (no bloquea el depósito):", error);
    }

    return { attempted: true, hash, assignHash, sponsor };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Fallo tesorería.";
    console.error("maybeTreasuryDeposit:", message);
    return { attempted: true, error: message };
  }
}

async function signAndSubmit(xdr: string, keypair: StellarSdk.Keypair): Promise<string> {
  const tx = StellarSdk.TransactionBuilder.fromXDR(
    xdr,
    config.networkPassphrase,
  ) as StellarSdk.Transaction;
  tx.sign(keypair);
  return submitSorobanTransaction(tx.toXDR());
}
