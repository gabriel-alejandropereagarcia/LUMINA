import { ChainAdapter, WalletInfo, TxResult } from "./chain-adapter";
import {
  connectStellarWallet,
  disconnectStellarWallet,
  signStellarTransaction,
} from "@/lib/integrations/wallets-kit";
import {
  getEscrowBalance,
  getImpactScore,
  getUsdcAllowance,
  buildApproveTx,
  buildDepositTx,
  buildWithdrawTx,
  submitSorobanTransaction,
  rpc,
  LUMINA_CONTRACT_ID
} from "@/lib/stellar";

async function signAndSubmit(xdr: string, address: string): Promise<string> {
  const signedTxXdr = await signStellarTransaction(xdr, address);
  if (!signedTxXdr) throw new Error("Firma de transacción rechazada por el usuario.");
  return submitSorobanTransaction(signedTxXdr);
}

export class StellarAdapter implements ChainAdapter {
  readonly chainId = "stellar-testnet";
  readonly chainName = "Stellar Network";
  readonly nativeSymbol = "XLM";

  async connect(): Promise<WalletInfo | null> {
    try {
      if (typeof window === "undefined") return null;
      const address = await connectStellarWallet();
      return address ? { address } : null;
    } catch (e: any) {
      console.error("Error al conectar wallet Stellar:", e);
      return null;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await disconnectStellarWallet();
    } catch (e) {
      console.error("Error al desconectar wallet Stellar:", e);
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
      const hash = await signAndSubmit(xdr, sponsor);
      return { success: true, hash };
    } catch (e: any) {
      return { success: false, error: e.message || "Error al procesar la aprobación de USDC en Stellar." };
    }
  }

  async deposit(sponsor: string, amount: number): Promise<TxResult> {
    try {
      const xdr = await buildDepositTx(sponsor, amount);
      const hash = await signAndSubmit(xdr, sponsor);
      return { success: true, hash };
    } catch (e: any) {
      return { success: false, error: e.message || "Error al procesar el depósito en Stellar." };
    }
  }

  async withdraw(sponsor: string, amount: number): Promise<TxResult> {
    try {
      const xdr = await buildWithdrawTx(sponsor, amount);
      const hash = await signAndSubmit(xdr, sponsor);
      return { success: true, hash };
    } catch (e: any) {
      return { success: false, error: e.message || "Error al procesar el retiro en Stellar." };
    }
  }

  async getHistoricSponsors(): Promise<string[]> {
    try {
      // Usar imports dinámicos o referencias ya presentes
      const latestLedger = await rpc.getLatestLedger();
      const startLedger = Math.max(1, latestLedger.sequence - 50000);
      
      const StellarSdk = require("@stellar/stellar-sdk");
      const eventsRes = await rpc.getEvents({
        startLedger,
        filters: [
          {
            type: "contract",
            contractIds: [LUMINA_CONTRACT_ID]
          }
        ],
        limit: 100
      });

      const uniqueSponsors = new Set<string>();

      if (eventsRes && eventsRes.events) {
        for (const event of eventsRes.events) {
          try {
            const topics = event.topic;
            if (topics && topics.length >= 2) {
              const eventTypeVal = StellarSdk.xdr.ScVal.fromXDR(topics[0], "base64");
              if (eventTypeVal.arm() === "sym" && eventTypeVal.sym().toString() === "deposit") {
                const sponsorVal = StellarSdk.ScVal.fromXDR(topics[1], "base64");
                const sponsorAddress = StellarSdk.Address.fromScVal(sponsorVal).toString();
                if (sponsorAddress) {
                  uniqueSponsors.add(sponsorAddress);
                }
              }
            }
          } catch (e) {
            // Ignorar errores de parsing
          }
        }
      }

      return Array.from(uniqueSponsors);
    } catch (error) {
      console.error("Error al obtener sponsors de Stellar Soroban:", error);
      return [];
    }
  }
}
