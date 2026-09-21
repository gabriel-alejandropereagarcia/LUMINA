import { NextResponse } from "next/server";
import { getImpactApp, IMPACT_APPS } from "@/lib/impact-apps";
import { hashFact } from "@/lib/hito/hash";
import { assertAvailable, claimCommitments } from "@/lib/hito/registry";
import { factForAporteUnit, pendingUnits } from "@/lib/hito/aporte-fact";
import { authorizeCertify, oracleKeypair, releaseImpactAsset } from "@/lib/hito/release";
import { getAporte, listReservedForApp, recordWorkRelease } from "@/lib/empresa/store";
import { isSchemaPaused } from "@/lib/hito/listing-store";

export const runtime = "nodejs";

function findAppByOracle(oracle: string) {
  return IMPACT_APPS.find((app) => app.oracleAddress && app.oracleAddress === oracle);
}

export async function GET(request: Request) {
  if (!authorizeCertify(request)) {
    return NextResponse.json({ trabajos: [] });
  }
  const oracle = request.headers.get("x-app-oracle") || oracleKeypair()?.publicKey() || "";
  const app = findAppByOracle(oracle);
  if (!app) {
    return NextResponse.json({ trabajos: [] });
  }
  const aportes = await listReservedForApp(app.id);
  return NextResponse.json({
    app: { id: app.id, name: app.name, unitLabel: app.unitLabel },
    trabajos: aportes.map((item) => ({
      id: item.id,
      referencia: item.referencia,
      amountUsd: item.amountUsd,
      unitLabel: item.unitLabel || app.unitLabel,
      pending: pendingUnits(item),
      certifiedUnits: item.certifiedUnits ?? 0,
      reserved: Boolean(item.sponsorAddress || item.txHash),
      lockUntil: item.lockUntil,
    })),
  });
}

export async function POST(request: Request) {
  try {
    if (!authorizeCertify(request)) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const aporteId = typeof body.aporteId === "string" ? body.aporteId : "";
    const aporte = await getAporte(aporteId);
    if (!aporte || aporte.status !== "en_escrow") {
      return NextResponse.json({ error: "No hay un pago reservado para confirmar." }, { status: 404 });
    }

    const app = getImpactApp(aporte.appId);
    if (!app) {
      return NextResponse.json({ error: "Esa app ya no está en Lumina." }, { status: 400 });
    }
    if (app.paused || (await isSchemaPaused(app.schemaId))) {
      return NextResponse.json({ error: "Esa app está pausada." }, { status: 403 });
    }

    const signer = oracleKeypair()?.publicKey();
    if (!signer || signer !== app.oracleAddress) {
      return NextResponse.json(
        { error: "Esta app todavía no puede confirmar desde Lumina. Falta la cuenta que firma." },
        { status: 403 },
      );
    }

    const sponsor = aporte.sponsorAddress;
    if (!sponsor) {
      return NextResponse.json(
        { error: "Lumina todavía no reservó este pago. Cuando la tesorería deposite, podés confirmar." },
        { status: 409 },
      );
    }

    const unitIndex = aporte.certifiedUnits ?? 0;
    if (pendingUnits(aporte) <= 0) {
      return NextResponse.json({ error: "Ya se confirmaron todos los trabajos de este pago." }, { status: 409 });
    }

    const fact = factForAporteUnit(aporte, unitIndex);
    await assertAvailable(fact);
    const { canonical, reportHash } = hashFact(fact);
    const released = await releaseImpactAsset({
      sponsor,
      amount: fact.amountUsd,
      reportHash,
      oracleHint: app.oracleAddress,
    });
    await claimCommitments(fact, reportHash, released.hash);
    const certificado = await recordWorkRelease({
      aporteId: aporte.id,
      reportHash,
      txHash: released.hash,
      canonical,
      period: fact.period,
      subjectCommitments: fact.subjectCommitments,
    });

    return NextResponse.json({
      success: true,
      hash: released.hash,
      reportHash,
      certificado,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "No se pudo confirmar el trabajo.";
    const status = message.includes("ya fue certificado") ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
