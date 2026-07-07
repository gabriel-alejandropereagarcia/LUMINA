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

// Multi-chain Explorer Configurations
const LUMINA_EVM_CONTRACT = process.env.NEXT_PUBLIC_LUMINA_EVM_CONTRACT_ID || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const USDC_EVM_CONTRACT = process.env.NEXT_PUBLIC_USDC_EVM_CONTRACT_ID || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

export function getExplorerUrls(network: string) {
  if (network === "stellar-testnet") {
    const stellarContract = process.env.NEXT_PUBLIC_LUMINA_CONTRACT_ID || "CBLKDMO6M5GJZVNPKD2QRCAKGDFUHJCF27EG7MOFRAEHSNWMXAOOG6HA";
    const stellarUsdc = process.env.NEXT_PUBLIC_USDC_CONTRACT_ID || "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA";
    return {
      name: "Stellar Expert (Testnet)",
      contractAddress: stellarContract,
      usdcAddress: stellarUsdc,
      contractUrl: `https://stellar.expert/explorer/testnet/contract/${stellarContract}`,
      usdcUrl: `https://stellar.expert/explorer/testnet/contract/${stellarUsdc}`,
      contractLabel: `Lumina Escrow (${stellarContract.substring(0, 8)}...${stellarContract.substring(stellarContract.length - 4)})`,
      usdcLabel: `USDC Token (${stellarUsdc.substring(0, 8)}...${stellarUsdc.substring(stellarUsdc.length - 4)})`,
      txUrl: (hash: string) => `https://stellar.expert/explorer/testnet/tx/${hash}`
    };
  } else if (network === "avalanche-fuji") {
    return {
      name: "SnowTrace (Fuji)",
      contractAddress: LUMINA_EVM_CONTRACT,
      usdcAddress: USDC_EVM_CONTRACT,
      contractUrl: `https://testnet.snowtrace.io/address/${LUMINA_EVM_CONTRACT}`,
      usdcUrl: `https://testnet.snowtrace.io/address/${USDC_EVM_CONTRACT}`,
      contractLabel: `Lumina Escrow (${LUMINA_EVM_CONTRACT.substring(0, 8)}...${LUMINA_EVM_CONTRACT.substring(LUMINA_EVM_CONTRACT.length - 4)})`,
      usdcLabel: `USDC Token (${USDC_EVM_CONTRACT.substring(0, 8)}...${USDC_EVM_CONTRACT.substring(USDC_EVM_CONTRACT.length - 4)})`,
      txUrl: (hash: string) => `https://testnet.snowtrace.io/tx/${hash}`
    };
  } else {
    // base-sepolia
    return {
      name: "Basescan (Sepolia)",
      contractAddress: LUMINA_EVM_CONTRACT,
      usdcAddress: USDC_EVM_CONTRACT,
      contractUrl: `https://sepolia.basescan.org/address/${LUMINA_EVM_CONTRACT}`,
      usdcUrl: `https://sepolia.basescan.org/address/${USDC_EVM_CONTRACT}`,
      contractLabel: `Lumina Escrow (${LUMINA_EVM_CONTRACT.substring(0, 8)}...${LUMINA_EVM_CONTRACT.substring(LUMINA_EVM_CONTRACT.length - 4)})`,
      usdcLabel: `USDC Token (${USDC_EVM_CONTRACT.substring(0, 8)}...${USDC_EVM_CONTRACT.substring(USDC_EVM_CONTRACT.length - 4)})`,
      txUrl: (hash: string) => `https://sepolia.basescan.org/tx/${hash}`
    };
  }
}
