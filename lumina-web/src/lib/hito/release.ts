import * as StellarSdk from "@stellar/stellar-sdk";
import { rpc, config, LUMINA_CONTRACT_ID, usdcToStroops } from "@/lib/stellar";
import { USDC_TESTNET_SAC } from "@/lib/official-assets";

export function oracleKeypair(): StellarSdk.Keypair | null {
  const secret = process.env.ORACLE_SECRET;
  if (!secret) return null;
  return StellarSdk.Keypair.fromSecret(secret);
}

export function authorizeCertify(request: Request): boolean {
  if (
    process.env.NEXT_PUBLIC_STELLAR_NETWORK !== "mainnet" &&
    request.headers.get("x-lumina-demo") === "jury"
  ) {
    return Boolean(process.env.ORACLE_SECRET);
  }
  const expected = process.env.CERTIFY_SECRET || process.env.ORACLE_SECRET;
  if (!expected) return false;
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : request.headers.get("x-app-secret");
  if (token && token === expected) return true;

  const claimed = request.headers.get("x-app-oracle") || "";
  const keypair = oracleKeypair();
  return Boolean(keypair && claimed && claimed === keypair.publicKey());
}

export async function releaseImpactAsset(input: {
  sponsor: string;
  amount: number;
  reportHash: string;
  asset?: string;
  oracleHint?: string;
}): Promise<{ hash: string; oracle: string; asset: string }> {
  const keypair = oracleKeypair();
  if (!keypair) {
    throw new Error("ORACLE_SECRET no configurada.");
  }
  const oracleAddress = keypair.publicKey();
  if (input.oracleHint && input.oracleHint !== oracleAddress) {
    throw new Error("La cuenta que emite el informe no es la de esta app.");
  }

  const reportHash = input.reportHash.toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(reportHash)) {
    throw new Error("Código del informe inválido.");
  }

  const asset = input.asset || USDC_TESTNET_SAC;
  const reportHashBytes = new Uint8Array(Buffer.from(reportHash, "hex"));
  const account = await rpc.getAccount(oracleAddress);
  const luminaContract = new StellarSdk.Contract(LUMINA_CONTRACT_ID);
  const amountBigInt = usdcToStroops(input.amount);

  const args = [
    StellarSdk.Address.fromString(oracleAddress).toScVal(),
    StellarSdk.Address.fromString(input.sponsor).toScVal(),
    StellarSdk.Address.fromString(asset).toScVal(),
    StellarSdk.nativeToScVal(amountBigInt, { type: "i128" }),
    StellarSdk.nativeToScVal(reportHashBytes, { type: "bytes" }),
  ];

  let transaction = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: config.networkPassphrase,
  })
    .addOperation(luminaContract.call("release_impact_asset", ...args))
    .setTimeout(180)
    .build();

  const simulation = await rpc.simulateTransaction(transaction);
  if (StellarSdk.rpc.Api.isSimulationError(simulation)) {
    throw new Error(`No se pudo cobrar: ${simulation.error}`);
  }

  transaction = StellarSdk.rpc.assembleTransaction(transaction, simulation).build();
  transaction.sign(keypair);

  const response = await rpc.sendTransaction(transaction);
  if (response.status !== "PENDING") {
    throw new Error(`No se envió el cobro. Estado: ${response.status}`);
  }

  let getResponse = await rpc.getTransaction(response.hash);
  let attempts = 0;
  while (getResponse.status === "NOT_FOUND" && attempts < 30) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    getResponse = await rpc.getTransaction(response.hash);
    attempts++;
  }

  if (getResponse.status === "SUCCESS") {
    return { hash: response.hash, oracle: oracleAddress, asset };
  }
  if (getResponse.status === "NOT_FOUND") {
    throw new Error(`Timeout esperando el recibo (${response.hash}).`);
  }
  throw new Error(`El cobro falló: ${getResponse.status}`);
}
