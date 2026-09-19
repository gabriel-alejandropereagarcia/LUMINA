import * as StellarSdk from "@stellar/stellar-sdk";
import {
  buildApproveTx,
  buildAssignOracleTx,
  buildDepositTx,
  config,
  submitSorobanTransaction,
  USDC_CONTRACT_ID,
} from "@/lib/stellar";
import { isTreasuryDepositEnabled } from "./rails";
import type { Aporte } from "./types";

/**
 * Tesorería Lumina firma el depósito. La empresa no tiene key.
 * Opt-in: TREASURY_DEPOSIT_ENABLED=true + TREASURY_SECRET.
 */
export async function maybeTreasuryDeposit(aporte: Aporte): Promise<{
  attempted: boolean;
  hash?: string;
  error?: string;
}> {
  if (!isTreasuryDepositEnabled()) {
    return { attempted: false };
  }
  const secret = process.env.TREASURY_SECRET || process.env.SPONSOR_SECRET;
  if (!secret) return { attempted: false, error: "Sin TREASURY_SECRET." };

  try {
    const keypair = StellarSdk.Keypair.fromSecret(secret);
    const sponsor = keypair.publicKey();
    const oracle =
      process.env.NEXT_PUBLIC_ORACLE_ADDRESS ||
      process.env.ORACLE_ADDRESS ||
      "";

    await signAndSubmit(await buildApproveTx(sponsor, aporte.amountUsd), keypair);
    const hash = await signAndSubmit(await buildDepositTx(sponsor, aporte.amountUsd), keypair);

    if (oracle) {
      try {
        await signAndSubmit(
          await buildAssignOracleTx(sponsor, USDC_CONTRACT_ID, oracle),
          keypair,
        );
      } catch (error) {
        console.error("assign_oracle tesorería (no bloquea el depósito):", error);
      }
    }

    return { attempted: true, hash };
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
