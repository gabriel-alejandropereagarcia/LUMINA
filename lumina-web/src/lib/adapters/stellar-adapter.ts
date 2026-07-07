import { ChainAdapter, WalletInfo, TxResult } from "./chain-adapter";
import { StellarWalletsKit } from "@creit.tech/stellar-wallets-kit";
import {
  getEscrowBalance,
  getImpactScore,
  getUsdcAllowance,
  buildApproveTx,
  buildDepositTx,
  buildWithdrawTx,
  submitSorobanTransaction,
  config
} from "@/lib/stellar";

export class StellarAdapter implements ChainAdapter {
  readonly chainId = "stellar-testnet";
  readonly chainName = "Stellar Network";
  readonly nativeSymbol = "XLM";

  async connect(): Promise<WalletInfo | null> {
    try {
      if (typeof window === "undefined") return null;
      
      const res = await StellarWalletsKit.authModal();
      if (res && res.address) {
        return { address: res.address };
      }
      return null;
    } catch (e: any) {
      console.error("Error al conectar Freighter:", e);
      return null;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await StellarWalletsKit.disconnect();
    } catch (e) {
      console.error("Error al desconectar Freighter:", e);
    }
  }

  async isConnected(): Promise<boolean> {
    if (typeof window === "undefined") return false;
    const address = localStorage.getItem("lumina_wallet_address");
    return !!address;
  }

  async getEscrowBalance(address: string): Promise<number> {
    return getEscrowBalance(address);
  }

  async getImpactScore(address: string): Promise<number> {
    return getImpactScore(address);
  }

  async getAllowance(sponsor: string): Promise<number> {
    return getUsdcAllowance(sponsor);
  }

  async approve(sponsor: string, amount: number): Promise<TxResult> {
    try {
      const xdr = await buildApproveTx(sponsor, amount);
      const { signTransaction } = require("@stellar/freighter-api");
      const { signedTxXdr } = await signTransaction(xdr, {
        networkPassphrase: config.networkPassphrase,
      });
      
      if (!signedTxXdr) throw new Error("Firma de transacción rechazada por el usuario.");
      const hash = await submitSorobanTransaction(signedTxXdr);
      return { success: true, hash };
    } catch (e: any) {
      return { success: false, error: e.message || "Error al procesar la aprobación de USDC en Stellar." };
    }
  }

  async deposit(sponsor: string, amount: number): Promise<TxResult> {
    try {
      const xdr = await buildDepositTx(sponsor, amount);
      const { signTransaction } = require("@stellar/freighter-api");
      const { signedTxXdr } = await signTransaction(xdr, {
        networkPassphrase: config.networkPassphrase,
      });

      if (!signedTxXdr) throw new Error("Firma de transacción rechazada por el usuario.");
      const hash = await submitSorobanTransaction(signedTxXdr);
      return { success: true, hash };
    } catch (e: any) {
      return { success: false, error: e.message || "Error al procesar el depósito en Stellar." };
    }
  }

  async withdraw(sponsor: string, amount: number): Promise<TxResult> {
    try {
      const xdr = await buildWithdrawTx(sponsor, amount);
      const { signTransaction } = require("@stellar/freighter-api");
      const { signedTxXdr } = await signTransaction(xdr, {
        networkPassphrase: config.networkPassphrase,
      });

      if (!signedTxXdr) throw new Error("Firma de transacción rechazada por el usuario.");
      const hash = await submitSorobanTransaction(signedTxXdr);
      return { success: true, hash };
    } catch (e: any) {
      return { success: false, error: e.message || "Error al procesar el retiro en Stellar." };
    }
  }
}
