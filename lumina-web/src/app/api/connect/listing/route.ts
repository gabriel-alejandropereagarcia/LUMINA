import { NextResponse } from "next/server";
import { createListing, listListings, setListingStatus } from "@/lib/hito/listing-store";
import { IMPACT_APPS } from "@/lib/impact-apps";

export const runtime = "nodejs";

export async function GET() {
  const listings = await listListings();
  return NextResponse.json({
    catalog: IMPACT_APPS.map((app) => ({
      id: app.id,
      name: app.name,
      schemaId: app.schemaId,
      unitLabel: app.unitLabel,
      valueMethod: app.valueMethod,
      lockPriceUsd: app.priceUsdc,
      hashIncludes: app.hashIncludes,
      hashExcludes: app.hashExcludes,
      postReleasePromise: app.postReleasePromise,
      status: app.paused ? "paused" : app.status,
      milestone: app.milestone,
    })),
    altas: listings,
  });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const schemaId = typeof body.schemaId === "string" ? body.schemaId.trim() : "";
  const unitLabel = typeof body.unitLabel === "string" ? body.unitLabel.trim() : "";
  const valueMethod = typeof body.valueMethod === "string" ? body.valueMethod.trim() : "";
  const lockPriceUsd = Number(body.lockPriceUsd ?? body.price);
  const oracle = typeof body.oracle === "string" ? body.oracle.trim() : "";
  const payout = typeof body.payout === "string" ? body.payout.trim() : oracle;
  const milestone = typeof body.milestone === "string" ? body.milestone.trim() : unitLabel;
  const hashIncludes = typeof body.hashIncludes === "string" ? body.hashIncludes.trim() : "";
  const hashExcludes = typeof body.hashExcludes === "string" ? body.hashExcludes.trim() : "";
  const postReleasePromise =
    typeof body.postReleasePromise === "string" ? body.postReleasePromise.trim() : "";

  if (!name || !schemaId || !unitLabel || !valueMethod || !oracle) {
    return NextResponse.json(
      { error: "Obligatorios: name, schemaId, unitLabel, valueMethod, oracle." },
      { status: 400 },
    );
  }
  if (!oracle.startsWith("G") || oracle.length < 56) {
    return NextResponse.json({ error: "oracle tiene que ser una G… válida." }, { status: 400 });
  }
  if (!Number.isFinite(lockPriceUsd) || lockPriceUsd <= 0) {
    return NextResponse.json({ error: "lockPriceUsd inválido." }, { status: 400 });
  }
  if (body.acceptedToS !== true) {
    return NextResponse.json(
      { error: "Tenés que aceptar los términos de listing (Lumina no avala el gasto post-release ni el aula)." },
      { status: 400 },
    );
  }

  const listing = await createListing({
    name,
    schemaId,
    unitLabel,
    valueMethod,
    lockPriceUsd,
    hashIncludes: hashIncludes || "schema, período, quantity, subject_commitment, sponsor, monto",
    hashExcludes: hashExcludes || "DNI, CUD, diagnóstico, escuela",
    postReleasePromise: postReleasePromise || "La app paga al beneficiario en fiat. Lumina no lo ejecuta.",
    oracle,
    payout: payout || oracle,
    milestone,
  });

  return NextResponse.json(
    {
      listing,
      next: "El admin firma add_oracle on-chain después de la auditoría chica. Hasta entonces la alta queda pending.",
    },
    { status: 201 },
  );
}

export async function PATCH(request: Request) {
  const expected = process.env.CERTIFY_SECRET || process.env.ORACLE_SECRET;
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!expected || token !== expected) {
    return NextResponse.json({ error: "Solo el admin del listing puede pausar." }, { status: 401 });
  }
  const body = (await request.json().catch(() => ({}))) as { id?: string; status?: string };
  if (!body.id || (body.status !== "listed" && body.status !== "paused" && body.status !== "pending")) {
    return NextResponse.json({ error: "Requeridos: id, status listed|paused|pending." }, { status: 400 });
  }
  try {
    const listing = await setListingStatus(body.id, body.status);
    return NextResponse.json({ listing });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo actualizar.";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
