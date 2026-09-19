import { StrKey } from "@stellar/stellar-sdk";

/** Domain ID oficial de Circle para Stellar (CCTP v2). */
export const CCTP_STELLAR_DOMAIN = 27;

export const CCTP_SOURCE_DOMAINS = {
  "avalanche-fuji": 1,
  "base-sepolia": 6,
} as const;

export type CctpEvmNetwork = keyof typeof CCTP_SOURCE_DOMAINS;

export const CCTP_FORWARDER_TESTNET =
  process.env.NEXT_PUBLIC_CCTP_FORWARDER || "";

export function isCctpReady(): boolean {
  return Boolean(CCTP_FORWARDER_TESTNET);
}

export function contractStrkeyToBytes32(strkey: string): `0x${string}` {
  if (!StrKey.isValidContract(strkey)) {
    throw new Error(`Invalid contract strkey: ${strkey}`);
  }
  return `0x${Buffer.from(StrKey.decodeContract(strkey)).toString("hex")}`;
}

export function buildCctpForwarderHookData(forwardRecipientStrkey: string): `0x${string}` {
  const isValid =
    StrKey.isValidEd25519PublicKey(forwardRecipientStrkey) ||
    StrKey.isValidContract(forwardRecipientStrkey) ||
    StrKey.isValidMed25519PublicKey(forwardRecipientStrkey);

  if (!isValid) {
    throw new Error(`Destinatario Stellar inválido: ${forwardRecipientStrkey}`);
  }

  const recipientBytes = Buffer.from(forwardRecipientStrkey, "utf8");
  const hookData = Buffer.alloc(32 + recipientBytes.length);
  hookData.writeUInt32BE(0, 24);
  hookData.writeUInt32BE(recipientBytes.length, 28);
  recipientBytes.copy(hookData, 32);
  return `0x${hookData.toString("hex")}`;
}

export function prepareCctpBurnToStellar(params: {
  amount: bigint;
  forwardRecipient: string;
  burnToken: `0x${string}`;
  maxFee?: bigint;
  minFinalityThreshold?: number;
  forwarder?: string;
}) {
  const forwarder = params.forwarder || CCTP_FORWARDER_TESTNET;
  if (!forwarder) {
    throw new Error("Configurá NEXT_PUBLIC_CCTP_FORWARDER con el CctpForwarder de testnet.");
  }

  const forwarderHex = contractStrkeyToBytes32(forwarder);
  return {
    amount: params.amount,
    destinationDomain: CCTP_STELLAR_DOMAIN,
    mintRecipient: forwarderHex,
    burnToken: params.burnToken,
    destinationCaller: forwarderHex,
    maxFee: params.maxFee ?? BigInt(0),
    minFinalityThreshold: params.minFinalityThreshold ?? 1000,
    hookData: buildCctpForwarderHookData(params.forwardRecipient),
  };
}
