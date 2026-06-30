import * as StellarSdk from "@stellar/stellar-sdk";

// Red y URLs de configuración (Testnet por defecto)
export const NETWORK = process.env.NEXT_PUBLIC_STELLAR_NETWORK || "testnet";
export const LUMINA_CONTRACT_ID = process.env.NEXT_PUBLIC_LUMINA_CONTRACT_ID || "CBLKDMO6M5GJZVNPKD2QRCAKGDFUHJCF27EG7MOFRAEHSNWMXAOOG6HA";
export const USDC_CONTRACT_ID = process.env.NEXT_PUBLIC_USDC_CONTRACT_ID || "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA";

if (LUMINA_CONTRACT_ID.startsWith("CAAAAAAA")) {
  console.error("⚠️ LUMINA_CONTRACT_ID no configurado — usando placeholder. Las transacciones on-chain fallarán.");
}

export const config = {
  testnet: {
    horizonUrl: "https://horizon-testnet.stellar.org",
    rpcUrl: "https://soroban-testnet.stellar.org",
    networkPassphrase: StellarSdk.Networks.TESTNET,
  },
  mainnet: {
    horizonUrl: "https://horizon.stellar.org",
    rpcUrl: process.env.NEXT_PUBLIC_STELLAR_MAINNET_RPC_URL || "https://mainnet.stellar.validationcloud.io/v1/your-api-key",
    networkPassphrase: StellarSdk.Networks.PUBLIC,
  },
}[NETWORK] || {
  horizonUrl: "https://horizon-testnet.stellar.org",
  rpcUrl: "https://soroban-testnet.stellar.org",
  networkPassphrase: StellarSdk.Networks.TESTNET,
};

export const horizon = new StellarSdk.Horizon.Server(config.horizonUrl);
export const rpc = new StellarSdk.rpc.Server(config.rpcUrl);

// Cuenta dummy utilizada para simular llamadas de lectura
const DUMMY_SOURCE = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";

/**
 * Convierte un monto float de USDC a su valor entero en Stroops (7 decimales) de forma segura.
 */
export function usdcToStroops(amount: number): bigint {
  const parts = amount.toFixed(7).split(".");
  const integerPart = parts[0];
  const fractionalPart = parts[1] || "";
  return BigInt(integerPart + fractionalPart);
}

/**
 * Invoca un método de lectura del contrato Soroban de Lumina mediante simulación (gratis, sin gas).
 */
export async function invokeReadOnly(method: string, args: StellarSdk.xdr.ScVal[] = []) {
  try {
    const account = new StellarSdk.Account(DUMMY_SOURCE, "0");
    const contract = new StellarSdk.Contract(LUMINA_CONTRACT_ID);

    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: "100",
      networkPassphrase: config.networkPassphrase,
    })
      .addOperation(contract.call(method, ...args))
      .setTimeout(30)
      .build();

    const simulation = await rpc.simulateTransaction(transaction);

    if (StellarSdk.rpc.Api.isSimulationSuccess(simulation)) {
      if (simulation.result && simulation.result.retval) {
        return StellarSdk.scValToNative(simulation.result.retval);
      }
      return null;
    } else {
      console.error(`Error de simulación en método ${method}:`, simulation);
      return null;
    }
  } catch (error) {
    console.error(`Error al invocar lectura ${method}:`, error);
    return null;
  }
}

/**
 * Retorna el saldo en garantía de USDC para un sponsor.
 */
export async function getEscrowBalance(sponsorAddress: string): Promise<number> {
  const sponsorVal = StellarSdk.Address.fromString(sponsorAddress).toScVal();
  const res = await invokeReadOnly("get_escrow_balance", [sponsorVal]);
  if (res === null) return 0;
  // Convertir de i128 de Soroban (BigInt) a número JS (con 7 decimales de USDC en Stellar)
  return Number(res) / 10_000_000;
}

/**
 * Obtiene la cantidad de USDC aprobada para el Lumina Contract de parte del sponsor.
 */
export async function getUsdcAllowance(sponsorAddress: string): Promise<number> {
  try {
    const fromVal = StellarSdk.Address.fromString(sponsorAddress).toScVal();
    const spenderVal = StellarSdk.Address.fromString(LUMINA_CONTRACT_ID).toScVal();

    const account = new StellarSdk.Account(DUMMY_SOURCE, "0");
    const usdcContract = new StellarSdk.Contract(USDC_CONTRACT_ID);

    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: "100",
      networkPassphrase: config.networkPassphrase,
    })
      .addOperation(usdcContract.call("allowance", fromVal, spenderVal))
      .setTimeout(30)
      .build();

    const simulation = await rpc.simulateTransaction(transaction);

    if (StellarSdk.rpc.Api.isSimulationSuccess(simulation)) {
      if (simulation.result && simulation.result.retval) {
        const val = StellarSdk.scValToNative(simulation.result.retval);
        return Number(val) / 10_000_000;
      }
    }
    return 0;
  } catch (error) {
    console.error("Error al obtener allowance de USDC:", error);
    return 0;
  }
}

/**
 * Retorna el score de impacto de un sponsor.
 */
export async function getImpactScore(sponsorAddress: string): Promise<number> {
  const sponsorVal = StellarSdk.Address.fromString(sponsorAddress).toScVal();
  const res = await invokeReadOnly("get_impact_score", [sponsorVal]);
  return res !== null ? Number(res) : 0;
}

/**
 * Verifica si un reporte MIRA ya está registrado on-chain.
 */
export async function isReportVerified(reportHashHex: string): Promise<boolean> {
  const reportBytes = Buffer.from(reportHashHex, "hex");
  const reportVal = StellarSdk.nativeToScVal(reportBytes, { type: "bytes" });
  const res = await invokeReadOnly("is_report_verified", [reportVal]);
  return !!res;
}

/**
 * Construye la transacción para aprobar al contrato Lumina a debitar USDC.
 */
export async function buildApproveTx(sponsorAddress: string, amount: number): Promise<string> {
  const account = await rpc.getAccount(sponsorAddress);
  const usdcContract = new StellarSdk.Contract(USDC_CONTRACT_ID);

  let latestLedger = 10_000_000;
  try {
    const latestLedgerResponse = await rpc.getLatestLedger();
    latestLedger = latestLedgerResponse.sequence;
  } catch (e) {
    console.warn("No se pudo obtener el ledger actual, usando fallback", e);
  }

  const amountBigInt = usdcToStroops(amount);
  const fromVal = StellarSdk.Address.fromString(sponsorAddress).toScVal();
  const spenderVal = StellarSdk.Address.fromString(LUMINA_CONTRACT_ID).toScVal();
  const amountVal = StellarSdk.nativeToScVal(amountBigInt, { type: "i128" });
  const expirationVal = StellarSdk.nativeToScVal(latestLedger + 120_000, { type: "u32" }); // Válido por ~7 días (a 5s/ledger)

  let transaction = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: config.networkPassphrase,
  })
    .addOperation(usdcContract.call("approve", fromVal, spenderVal, amountVal, expirationVal))
    .setTimeout(180)
    .build();

  const simulation = await rpc.simulateTransaction(transaction);
  if (StellarSdk.rpc.Api.isSimulationError(simulation)) {
    throw new Error(`Simulación de aprobación fallida: ${simulation.error}`);
  }

  transaction = StellarSdk.rpc.assembleTransaction(transaction, simulation).build();
  return transaction.toXDR();
}

/**
 * Construye la transacción para depositar USDC en el contrato de custodia Lumina.
 */
export async function buildDepositTx(sponsorAddress: string, amount: number): Promise<string> {
  const account = await rpc.getAccount(sponsorAddress);
  const luminaContract = new StellarSdk.Contract(LUMINA_CONTRACT_ID);

  // USDC tiene 7 decimales en Stellar
  const amountBigInt = usdcToStroops(amount);
  
  const sponsorVal = StellarSdk.Address.fromString(sponsorAddress).toScVal();
  const amountVal = StellarSdk.nativeToScVal(amountBigInt, { type: "i128" });

  let transaction = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: config.networkPassphrase,
  })
    .addOperation(luminaContract.call("deposit", sponsorVal, amountVal))
    .setTimeout(180)
    .build();

  const simulation = await rpc.simulateTransaction(transaction);
  if (StellarSdk.rpc.Api.isSimulationError(simulation)) {
    throw new Error(`Simulación de depósito fallida: ${simulation.error}`);
  }

  transaction = StellarSdk.rpc.assembleTransaction(transaction, simulation).build();
  return transaction.toXDR();
}

/**
 * Envía una transacción firmada a la red Soroban RPC y espera la confirmación.
 */
export async function submitSorobanTransaction(signedXdr: string): Promise<string> {
  const transaction = StellarSdk.TransactionBuilder.fromXDR(
    signedXdr,
    config.networkPassphrase
  ) as StellarSdk.Transaction;

  const response = await rpc.sendTransaction(transaction);

  if (response.status !== "PENDING") {
    throw new Error(`Fallo al enviar transacción. Estado del RPC: ${response.status}. Detalle: ${JSON.stringify(response)}`);
  }

  // Polling para esperar la inclusión en el ledger con límite de intentos (evita bucle infinito)
  let getResponse = await rpc.getTransaction(response.hash);
  let attempts = 0;
  const maxAttempts = 30; // 30 segundos de espera máxima

  while (getResponse.status === "NOT_FOUND" && attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    getResponse = await rpc.getTransaction(response.hash);
    attempts++;
  }

  if (getResponse.status === "SUCCESS") {
    return response.hash;
  }

  if (getResponse.status === "NOT_FOUND") {
    throw new Error(`Tiempo de espera agotado. Transacción enviada pero aún no procesada en ledger (Hash: ${response.hash}).`);
  }

  throw new Error(`Transacción fallida con estado: ${getResponse.status}`);
}
