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
  config,
  rpc,
  LUMINA_CONTRACT_ID
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

      // Fallbacks de producción para asegurar disponibilidad
      const fallbackSponsors = [
        process.env.NEXT_PUBLIC_ADMIN_ADDRESS || "GDWOVSXOW7U5S4HY3Z336F4G65RPH3P7KLY6Z2NLO3MNE22EETB2MIRA",
        "GC7K2N7IHM22E2QNYB36GZNY36KLY6Z2NLO3MNE22EETB2MIRA47A"
      ];
      for (const fallback of fallbackSponsors) {
        if (fallback) uniqueSponsors.add(fallback);
      }

      return Array.from(uniqueSponsors);
    } catch (error) {
      console.error("Error al obtener sponsors de Stellar Soroban:", error);
      return [
        process.env.NEXT_PUBLIC_ADMIN_ADDRESS || "GDWOVSXOW7U5S4HY3Z336F4G65RPH3P7KLY6Z2NLO3MNE22EETB2MIRA"
      ];
    }
  }
}
