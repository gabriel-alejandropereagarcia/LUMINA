import { NextResponse } from "next/server";
import { hashFact, parseFact } from "@/lib/hito/hash";
import { claimCommitments, assertAvailable } from "@/lib/hito/registry";
import { getImpactApp, getImpactAppBySchema } from "@/lib/impact-apps";
import { isSchemaPaused } from "@/lib/hito/listing-store";
import { recordWorkRelease, stampCertificadoTx } from "@/lib/empresa/store";
import { authorizeCertify, releaseImpactAsset } from "@/lib/hito/release";

/**
 * La app confirma que el trabajo se hizo. Lumina cobra el 97,5% a la app.
 */
export async function POST(request: Request) {
  try {
    if (!authorizeCertify(request)) {
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
    const asset = typeof body.asset === "string" && body.asset ? body.asset : undefined;
    const fact = parseFact(body.fact ?? body);

    if (!sponsor || !amount) {
      return NextResponse.json({ error: "Requeridos: sponsor, amount." }, { status: 400 });
    }

    if (fact) {
      const app = getImpactApp(fact.appId) ?? getImpactAppBySchema(fact.schemaId);
      if (!app) {
        return NextResponse.json({ error: "Esa app no está en Lumina." }, { status: 400 });
      }
      if (app.paused || (await isSchemaPaused(fact.schemaId))) {
        return NextResponse.json({ error: "Esa app está pausada." }, { status: 403 });
      }
      if (fact.unitLabel !== app.unitLabel || fact.schemaId !== app.schemaId) {
        return NextResponse.json(
          { error: "La unidad no coincide con la ficha. No se puede cambiar después del alta." },
          { status: 400 },
        );
      }
      const hashed = hashFact(fact);
      if (reportHash && reportHash.toLowerCase() !== hashed.reportHash) {
        return NextResponse.json(
          { error: "El código del trabajo no coincide con el hecho." },
          { status: 400 },
        );
      }
      reportHash = hashed.reportHash;
      await assertAvailable(fact);
    }

    if (!reportHash || !/^[0-9a-fA-F]{64}$/.test(reportHash)) {
      return NextResponse.json(
        { error: "Requeridos: el hecho (unidad + cantidad) o el código del trabajo." },
        { status: 400 },
      );
    }

    const released = await releaseImpactAsset({
      sponsor,
      amount,
      reportHash,
      asset,
      oracleHint,
    });

    if (fact) {
      await claimCommitments(fact, reportHash, released.hash);
      if (fact.sponsorRef) {
        await recordWorkRelease({
          aporteId: fact.sponsorRef,
          reportHash,
          txHash: released.hash,
          canonical: hashFact(fact).canonical,
          period: fact.period,
          subjectCommitments: fact.subjectCommitments,
        });
      }
    } else {
      await stampCertificadoTx(reportHash, released.hash);
    }

    return NextResponse.json({
      success: true,
      hash: released.hash,
      reportHash,
      oracle: released.oracle,
      asset: released.asset,
      payout: "97,5% a la app",
      unitLabel: fact?.unitLabel,
      quantity: fact?.quantity,
      schemaId: fact?.schemaId,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error interno.";
    const status = message.includes("ya fue certificado") ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
