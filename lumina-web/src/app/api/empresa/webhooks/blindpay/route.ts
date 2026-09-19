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
 * Webhook de producción: BlindPay payin.complete.
 * Demoted vs Koywe PAYIN: no vender a compliance minero sin razón social PSAV.
 * Sin BLINDPAY_WEBHOOK_SECRET no acredita.
 */
function isCompleted(payload: Record<string, unknown>): boolean {
  const type = typeof payload.type === "string" ? payload.type : "";
  const status = typeof payload.status === "string" ? payload.status : "";
  const nested = payload.data && typeof payload.data === "object" ? (payload.data as Record<string, unknown>) : null;
  const nestedStatus = nested && typeof nested.status === "string" ? nested.status : "";
  return (
    type === "payin.complete" ||
    type === "payin.completed" ||
    status === "complete" ||
    status === "completed" ||
    nestedStatus === "complete" ||
    nestedStatus === "completed"
  );
}

export async function POST(request: Request) {
  const secret = process.env.BLINDPAY_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      {
        error: "Riel no live. Configurá BLINDPAY_WEBHOOK_SECRET para acreditar aportes de verdad.",
        simulation: true,
      },
      { status: 503 },
    );
  }

  const header = request.headers.get("x-webhook-secret") || request.headers.get("authorization");
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
