import { NextResponse } from "next/server";
import * as StellarSdk from "@stellar/stellar-sdk";
import { rpc, config, LUMINA_CONTRACT_ID } from "@/lib/stellar";
import fs from "fs";
import path from "path";

const CONFIG_PATH = path.join(process.cwd(), "sponsor_notifications_config.json");

async function sendNotifications(sponsorAddress: string, amount: number, txHash: string, reportHashHex: string) {
  try {
    if (!fs.existsSync(CONFIG_PATH)) return;
    const data = fs.readFileSync(CONFIG_PATH, "utf8");
    const configs = JSON.parse(data || "{}");
    const sponsorConfig = configs[sponsorAddress.toLowerCase()];

    if (!sponsorConfig) {
      console.log(`No se encontró configuración de notificaciones para el sponsor: ${sponsorAddress}`);
      return;
    }

    const { email, webhookUrl } = sponsorConfig;

    // 1. Enviar Email vía Resend
    if (email && process.env.RESEND_API_KEY) {
      console.log(`Enviando notificación por correo a: ${email}`);
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: "Lumina Protocol <noreply@lumina.earth>",
          to: email,
          subject: "¡Hito de Impacto Verificado y USDC Liberado!",
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 12px;">
              <h2 style="color: #0d9488; border-bottom: 2px solid #0d9488; padding-bottom: 10px;">Lumina Impact Protocol</h2>
              <p>Hola Patrocinador,</p>
              <p>Te informamos que la aplicación verificadora ha certificado con éxito un hito de impacto on-chain para tu fondo en Lumina.</p>
              <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Monto Liberado:</strong> ${amount} USDC</p>
                <p style="margin: 5px 0;"><strong>Dirección del Patrocinador:</strong> <span style="font-family: monospace; font-size: 13px;">${sponsorAddress}</span></p>
                <p style="margin: 5px 0;"><strong>Hash del Reporte de Impacto:</strong> <span style="font-family: monospace; font-size: 13px;">${reportHashHex}</span></p>
                <p style="margin: 5px 0;"><strong>Hash de Transacción:</strong> <span style="font-family: monospace; font-size: 13px;">${txHash}</span></p>
              </div>
              <p>Los fondos han sido transferidos de manera irrevocable a la cuenta del proveedor del proyecto.</p>
              <p style="margin-top: 30px; font-size: 12px; color: #666; border-top: 1px solid #eaeaea; padding-top: 15px;">
                Este es un mensaje automático de producción enviado por Lumina Impact Protocol.
              </p>
            </div>
          `
        })
      });
      if (res.ok) {
        console.log("Correo enviado con éxito por Resend.");
      } else {
        const errText = await res.text();
        console.error("Fallo al enviar correo por Resend:", errText);
      }
    } else {
      console.log("No se pudo enviar correo: Falta email o RESEND_API_KEY en variables de entorno.");
    }

    // 2. Disparar Webhook
    if (webhookUrl) {
      console.log(`Disparando webhook del sponsor a: ${webhookUrl}`);
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Lumina-Event": "milestone.released"
        },
        body: JSON.stringify({
          event: "milestone.released",
          timestamp: new Date().toISOString(),
          sponsorAddress,
          amount,
          reportHashHex,
          txHash
        }),
        signal: AbortSignal.timeout(5000)
      });
      if (res.ok) {
        console.log("Webhook disparado y recibido con éxito por el sponsor.");
      } else {
        console.error(`Fallo en webhook: código de estado ${res.status}`);
      }
    }
  } catch (err) {
    console.error("Error al procesar notificaciones:", err);
  }
}

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
      // Disparar notificaciones en segundo plano
      sendNotifications(sponsorAddress, amount, response.hash, targetReportHashHex);

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
