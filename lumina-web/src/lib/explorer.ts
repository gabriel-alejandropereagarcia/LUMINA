import { NETWORK } from "./stellar";

// We'll fallback to "testnet" if NETWORK is not defined or is anything else than "mainnet"
const currentNetwork = typeof NETWORK !== "undefined" ? NETWORK : "testnet";

const BASE_URL = currentNetwork === "mainnet"
  ? "https://stellar.expert/explorer/public"
  : "https://stellar.expert/explorer/testnet";

export function txUrl(hash: string): string {
  return `${BASE_URL}/tx/${hash}`;
}

export function contractUrl(contractId: string): string {
  return `${BASE_URL}/contract/${contractId}`;
}

export function accountUrl(address: string): string {
  return `${BASE_URL}/account/${address}`;
}
