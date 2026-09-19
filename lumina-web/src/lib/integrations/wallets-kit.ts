import { StellarWalletsKit } from "@creit.tech/stellar-wallets-kit";
import { defaultModules } from "@creit.tech/stellar-wallets-kit/modules/utils";
import { Networks } from "@creit.tech/stellar-wallets-kit/types";
import { config } from "@/lib/stellar";

let initialized = false;

export async function initWalletsKit(): Promise<void> {
  if (typeof window === "undefined" || initialized) return;

  try {
    StellarWalletsKit.init({
      modules: defaultModules(),
      network: config.networkPassphrase === Networks.PUBLIC ? Networks.PUBLIC : Networks.TESTNET,
    });
  } catch (error) {
    console.warn("Stellar Wallets Kit init omitido:", error);
  }

  initialized = true;
}

export async function connectStellarWallet(): Promise<string | null> {
  await initWalletsKit();
  const res = await StellarWalletsKit.authModal();
  return res?.address ?? null;
}

export async function getConnectedStellarAddress(): Promise<string | null> {
  await initWalletsKit();
  try {
    const res = await StellarWalletsKit.getAddress();
    return res?.address ?? null;
  } catch {
    return null;
  }
}

export async function disconnectStellarWallet(): Promise<void> {
  await initWalletsKit();
  try {
    await StellarWalletsKit.disconnect();
  } catch (error) {
    console.warn("Error al desconectar Stellar Wallets Kit:", error);
  }
}

export async function signStellarTransaction(
  xdr: string,
  address?: string,
  networkPassphrase: string = config.networkPassphrase
): Promise<string> {
  await initWalletsKit();

  try {
    const { signedTxXdr } = await StellarWalletsKit.signTransaction(xdr, {
      networkPassphrase,
      address,
    });
    if (signedTxXdr) return signedTxXdr;
  } catch (error) {
    console.warn("Firma via Wallets Kit falló, usando Freighter Connect:", error);
  }

  const { signTransaction } = await import("@stellar/freighter-api");
  const { signedTxXdr } = await signTransaction(xdr, { networkPassphrase });
  if (!signedTxXdr) {
    throw new Error("Firma de transacción rechazada por el usuario.");
  }
  return signedTxXdr;
}
