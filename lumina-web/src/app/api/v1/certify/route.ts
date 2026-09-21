import { NextResponse } from "next/server";
import * as StellarSdk from "@stellar/stellar-sdk";
import { rpc, config, LUMINA_CONTRACT_ID, usdcToStroops } from "@/lib/stellar";
import { USDC_TESTNET_SAC } from "@/lib/official-assets";
import { hashFact, parseFact } from "@/lib/hito/hash";
import { claimCommitments, assertAvailable } from "@/lib/hito/registry";
import { getImpactApp, getImpactAppBySchema } from "@/lib/impact-apps";
import { isSchemaPaused } from "@/lib/hito/listing-store";
import { stampCertificadoTx } from "@/lib/empresa/store";

function authorize(request: Request): boolean {
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
  return Boolean(token && token === expected);
}

/**
 * La app certifica un hito. Si manda `fact`, el hash es el del hecho
 * (unidad + commitments) y el panel de la empresa puede sumar. Sin fact
 * queda el path legado (solo reportHash).
 */
export async function POST(request: Request) {
  try {
    if (!authorize(request)) {
      return NextResponse.json(
        { error: "No autorizado. Enviá Authorization: Bearer <secret de la app>." },
        { status: 401 },
      );
    }

    const body = await request.json();
    const oracleHint = typeof body.oracle === "string" ? body.oracle : "";
    const sponsor = typeof body.sponsor === "string" ? body.sponsor : body.sponsorAddress;
    const amount = Number(body.amount);
    let reportHash = typeof body.reportHash === "string" ? body.reportHash : body.reportHashHex;
    const asset = typeof body.asset === "string" && body.asset ? body.asset : USDC_TESTNET_SAC;
    const fact = parseFact(body.fact ?? body);

    if (!sponsor || !amount) {
      return NextResponse.json({ error: "Requeridos: sponsor, amount." }, { status: 400 });
    }

    if (fact) {
      const app = getImpactApp(fact.appId) ?? getImpactAppBySchema(fact.schemaId);
      if (!app) {
        return NextResponse.json({ error: "schemaId / appId no está en el catálogo curado." }, { status: 400 });
      }
      if (app.paused || (await isSchemaPaused(fact.schemaId))) {
        return NextResponse.json({ error: "Esa app está pausada." }, { status: 403 });
      }
      if (fact.unitLabel !== app.unitLabel || fact.schemaId !== app.schemaId) {
        return NextResponse.json(
          { error: "La unidad no coincide con la ficha listada. No se puede cambiar después del alta." },
          { status: 400 },
        );
      }
      const hashed = hashFact(fact);
      if (reportHash && reportHash.toLowerCase() !== hashed.reportHash) {
        return NextResponse.json(
          { error: "reportHash no coincide con el fact canónico." },
          { status: 400 },
        );
      }
      reportHash = hashed.reportHash;
      await assertAvailable(fact);
    }

    if (!reportHash || !/^[0-9a-fA-F]{64}$/.test(reportHash)) {
      return NextResponse.json(
        { error: "Requeridos: fact (unidad + commitments) o reportHash SHA-256 (64 hex)." },
        { status: 400 },
      );
    }

    const oracleSecret = process.env.ORACLE_SECRET;
    if (!oracleSecret) {
      return NextResponse.json({ error: "ORACLE_SECRET no configurada." }, { status: 500 });
    }

    const oracleKeypair = StellarSdk.Keypair.fromSecret(oracleSecret);
    const oracleAddress = oracleKeypair.publicKey();
    if (oracleHint && oracleHint !== oracleAddress) {
      return NextResponse.json(
        { error: "oracle no coincide con la app que firma este secret." },
        { status: 403 },
      );
    }

    const reportHashBytes = new Uint8Array(Buffer.from(reportHash, "hex"));
    const account = await rpc.getAccount(oracleAddress);
    const luminaContract = new StellarSdk.Contract(LUMINA_CONTRACT_ID);
    const amountBigInt = usdcToStroops(amount);

    const args = [
      StellarSdk.Address.fromString(oracleAddress).toScVal(),
      StellarSdk.Address.fromString(sponsor).toScVal(),
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
      return NextResponse.json(
        { error: `Fallo en la simulación de Soroban: ${simulation.error}` },
        { status: 400 },
      );
    }

    transaction = StellarSdk.rpc.assembleTransaction(transaction, simulation).build();
    transaction.sign(oracleKeypair);

    const response = await rpc.sendTransaction(transaction);
    if (response.status !== "PENDING") {
      return NextResponse.json(
        { error: `Fallo al enviar transacción. Estado: ${response.status}` },
        { status: 500 },
      );
    }

    let getResponse = await rpc.getTransaction(response.hash);
    let attempts = 0;
    while (getResponse.status === "NOT_FOUND" && attempts < 30) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      getResponse = await rpc.getTransaction(response.hash);
      attempts++;
    }

    if (getResponse.status === "SUCCESS") {
      if (fact) {
        await claimCommitments(fact, reportHash, response.hash);
      }
      await stampCertificadoTx(reportHash, response.hash);
      return NextResponse.json({
        success: true,
        hash: response.hash,
        reportHash,
        oracle: oracleAddress,
        asset,
        payout: "97.5% a la wallet de la app (OracleConfig.payout)",
        unitLabel: fact?.unitLabel,
        quantity: fact?.quantity,
        schemaId: fact?.schemaId,
      });
    }

    if (getResponse.status === "NOT_FOUND") {
      return NextResponse.json(
        { error: `Timeout esperando ledger (Hash: ${response.hash}).` },
        { status: 504 },
      );
    }

    return NextResponse.json(
      { error: `Transacción falló: ${getResponse.status}` },
      { status: 500 },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error interno.";
    const status = message.includes("ya fue certificado") ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
