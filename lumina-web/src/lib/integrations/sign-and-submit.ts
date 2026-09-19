import { submitSorobanTransaction } from "@/lib/stellar";
import { signStellarTransaction } from "./wallets-kit";

export async function signAndSubmitStellarXdr(xdr: string, address?: string): Promise<string> {
  const signedTxXdr = await signStellarTransaction(xdr, address);
  return submitSorobanTransaction(signedTxXdr);
}
