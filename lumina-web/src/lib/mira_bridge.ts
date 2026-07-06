import * as StellarSdk from "@stellar/stellar-sdk";
import { rpc, config, LUMINA_CONTRACT_ID } from "./stellar";

/**
 * Simula el proceso de completar una evaluación en MIRA:
 * 1. Genera un hash aleatorio de 32 bytes representando el PDF del reporte.
 * 2. Construye la transacción para invocar 'release_impact' en el contrato Lumina.
 * 3. Firma la transacción con la clave privada del Oráculo de MIRA.
 * 4. Envía la transacción a la red Stellar/Soroban Testnet.
 */
export async function simulateMiraScreening(
  sponsorAddress: string,
  amount: number,
  oracleSecret?: string
): Promise<{ hash: string; reportHashHex: string }> {
  // Si no se provee la clave secreta en el cliente (comportamiento por defecto en producción),
  // delegamos la firma y envío a nuestra API segura en el servidor.
  if (!oracleSecret) {
    const response = await fetch("/api/oracle/release", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sponsorAddress, amount }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(
        data.error || "Error al procesar la liberación de fondos desde el servidor."
      );
    }

    return {
      hash: data.hash,
      reportHashHex: data.reportHashHex,
    };
  }

  // Flujo local/backend: firmar localmente si se pasa la clave
  const oracleKeypair = StellarSdk.Keypair.fromSecret(oracleSecret);
  const oracleAddress = oracleKeypair.publicKey();

  // Generar hash de reporte aleatorio de 32 bytes (simulando reporte PDF)
  const reportHashBytes = new Uint8Array(32);
  if (typeof window !== "undefined" && window.crypto) {
    window.crypto.getRandomValues(reportHashBytes);
  } else {
    // Fallback para Node.js
    const cryptoNode = require("crypto");
    cryptoNode.randomFillSync(reportHashBytes);
  }
  const reportHashHex = Buffer.from(reportHashBytes).toString("hex");

  // Obtener cuenta del Oráculo
  const account = await rpc.getAccount(oracleAddress);
  const luminaContract = new StellarSdk.Contract(LUMINA_CONTRACT_ID);

  // USDC tiene 7 decimales en Stellar
  const amountBigInt = BigInt(Math.floor(amount * 10_000_000));

  const oracleVal = StellarSdk.Address.fromString(oracleAddress).toScVal();
  const sponsorVal = StellarSdk.Address.fromString(sponsorAddress).toScVal();
  const amountVal = StellarSdk.nativeToScVal(amountBigInt, { type: "i128" });
  const reportHashVal = StellarSdk.nativeToScVal(reportHashBytes, { type: "bytes" });

  // 3. Construir transacción
  let transaction = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: config.networkPassphrase,
  })
    .addOperation(luminaContract.call("release_impact", oracleVal, sponsorVal, amountVal, reportHashVal))
    .setTimeout(180)
    .build();

  // Simular transacción para calcular fees y recursos necesarios
  const simulation = await rpc.simulateTransaction(transaction);
  if (StellarSdk.rpc.Api.isSimulationError(simulation)) {
    throw new Error(`Simulación fallida: ${simulation.error}`);
  }

  transaction = StellarSdk.rpc.assembleTransaction(transaction, simulation).build();

  // Firmar con la clave privada del Oráculo MIRA
  transaction.sign(oracleKeypair);

  // 4. Enviar a la red Stellar RPC
  const response = await rpc.sendTransaction(transaction);
  if (response.status !== "PENDING") {
    throw new Error(`Fallo al enviar transacción. Estado del RPC: ${response.status}. Detalle: ${JSON.stringify(response)}`);
  }

  // Polling para esperar confirmación del ledger con límite de intentos (evita bucle infinito)
  let getResponse = await rpc.getTransaction(response.hash);
  let attempts = 0;
  const maxAttempts = 30;

  while (getResponse.status === "NOT_FOUND" && attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    getResponse = await rpc.getTransaction(response.hash);
    attempts++;
  }

  if (getResponse.status === "SUCCESS") {
    return {
      hash: response.hash,
      reportHashHex,
    };
  }

  if (getResponse.status === "NOT_FOUND") {
    throw new Error(`Tiempo de espera agotado. Transacción enviada pero no procesada en ledger (Hash: ${response.hash}).`);
  }

  throw new Error(`Transacción fallida con estado: ${getResponse.status}`);
}
