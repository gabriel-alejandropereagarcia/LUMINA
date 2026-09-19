import { NextResponse } from "next/server";
import { settleFiatAporte } from "@/lib/empresa/settle";
import { findAporteByReferencia } from "@/lib/empresa/store";
import {
  bearerOrRaw,
  extractLumReferencia,
  verifySharedSecret,
} from "@/lib/empresa/webhooks";

export const runtime = "nodejs";

/**
 * Circle Mint: wire USD de la HQ. La SA argentina no es clienta.
 * Evento típico: transfers.completed / payout.completed con trackingRef = LUM-XXXX.
 */
function isCompleted(payload: Record<string, unknown>): boolean {
  const type = typeof payload.type === "string" ? payload.type : "";
  const status = typeof payload.status === "string" ? payload.status : "";
  return /completed|complete|received/i.test(`${type} ${status}`);
}

export async function POST(request: Request) {
  const secret = process.env.CIRCLE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      {
        error: "Riel no live. Configurá CIRCLE_WEBHOOK_SECRET para acreditar wires reales.",
        simulation: true,
      },
      { status: 503 },
    );
  }

  const header =
    request.headers.get("x-webhook-secret") ||
    request.headers.get("circle-signature") ||
    request.headers.get("authorization");
  if (!verifySharedSecret(bearerOrRaw(header), secret)) {
    return NextResponse.json({ error: "Firma de webhook inválida." }, { status: 401 });
  }

  const payload = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  if (!isCompleted(payload)) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const referencia = extractLumReferencia(payload);
  if (!referencia) {
    return NextResponse.json({ error: "Sin referencia LUM-XXXX." }, { status: 400 });
  }

  const match = await findAporteByReferencia(referencia);
  if (!match) {
    return NextResponse.json({ error: "Aporte no encontrado.", referencia }, { status: 404 });
  }
  if (match.status === "en_escrow" || match.status === "certificado") {
    return NextResponse.json({ ok: true, already: match.status });
  }

  const { aporte, chain } = await settleFiatAporte(match.id, match.empresaId);
  return NextResponse.json({ ok: true, aporte, chain });
}
