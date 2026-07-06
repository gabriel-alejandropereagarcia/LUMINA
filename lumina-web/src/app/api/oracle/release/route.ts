import { NextResponse } from "next/server";
import * as StellarSdk from "@stellar/stellar-sdk";
import { rpc, config, LUMINA_CONTRACT_ID } from "@/lib/stellar";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sponsorAddress, amount, reportHashHex } = body;

    if (!sponsorAddress || !amount) {
      return NextResponse.json(
        { error: "Faltan parámetros requeridos: sponsorAddress y amount." },
        { status: 400 }
      );
    }

    // Obtener la clave privada del oráculo del entorno del servidor
    const oracleSecret = process.env.ORACLE_SECRET;
    if (!oracleSecret) {
      console.error("⚠️ ORACLE_SECRET no está configurada en las variables de entorno del servidor.");
      return NextResponse.json(
        { error: "Error de configuración interna del servidor: Oráculo no configurado." },
        { status: 500 }
      );
    }

    // 1. Generar o convertir el hash de reporte de 32 bytes
    let reportHashBytes = new Uint8Array(32);
    let targetReportHashHex = reportHashHex;

    if (targetReportHashHex) {
      // Usar el hash enviado si está presente
      const buffer = Buffer.from(targetReportHashHex, "hex");
      reportHashBytes = new Uint8Array(buffer);
    } else {
      // Generar uno nuevo si no se provee
      const crypto = require("crypto");
      crypto.randomFillSync(reportHashBytes);
      targetReportHashHex = Buffer.from(reportHashBytes).toString("hex");
    }

    // 2. Cargar Keypair del Oráculo para firma criptográfica
    const oracleKeypair = StellarSdk.Keypair.fromSecret(oracleSecret);
    const oracleAddress = oracleKeypair.publicKey();

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
      return NextResponse.json(
        { error: `Fallo en la simulación de Soroban: ${simulation.error}` },
        { status: 400 }
      );
    }

    transaction = StellarSdk.rpc.assembleTransaction(transaction, simulation).build();

    // Firmar con la clave privada del Oráculo MIRA (almacenada segura server-side)
    transaction.sign(oracleKeypair);

    // 4. Enviar a la red Stellar RPC
    const response = await rpc.sendTransaction(transaction);
    if (response.status !== "PENDING") {
      return NextResponse.json(
        { error: `Fallo al enviar transacción al RPC de Stellar. Estado: ${response.status}` },
        { status: 500 }
      );
    }

    // Polling para esperar confirmación del ledger con límite de intentos
    let getResponse = await rpc.getTransaction(response.hash);
    let attempts = 0;
    const maxAttempts = 30;

    while (getResponse.status === "NOT_FOUND" && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      getResponse = await rpc.getTransaction(response.hash);
      attempts++;
    }

    if (getResponse.status === "SUCCESS") {
      return NextResponse.json({
        success: true,
        hash: response.hash,
        reportHashHex: targetReportHashHex,
      });
    }

    if (getResponse.status === "NOT_FOUND") {
      return NextResponse.json(
        { error: `Tiempo de espera agotado esperando inclusión en ledger (Hash: ${response.hash}).` },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: `Transacción falló con estado en ledger: ${getResponse.status}` },
      { status: 500 }
    );
  } catch (error: any) {
    console.error("Error en API de liberación de impacto:", error);
    return NextResponse.json(
      { error: error.message || "Error interno del servidor." },
      { status: 500 }
    );
  }
}
