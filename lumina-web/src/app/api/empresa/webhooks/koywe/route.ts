import { NextResponse } from "next/server";
import { settleFiatAporte } from "@/lib/empresa/settle";
import {
  findAporteByProviderOrderId,
  findAporteByReferencia,
} from "@/lib/empresa/store";
import {
  bearerOrRaw,
  extractLumReferencia,
  extractProviderOrderId,
  verifySharedSecret,
} from "@/lib/empresa/webhooks";

export const runtime = "nodejs";

/**
 * Webhook Koywe PAYIN. La empresa pagó ARS a Lumina.
 * order.completed / PAYIN completed → tesorería deposita.
 */
function isPayinCompleted(payload: Record<string, unknown>): boolean {
  const type = typeof payload.type === "string" ? payload.type : "";
  const event = typeof payload.event === "string" ? payload.event : "";
  const status = typeof payload.status === "string" ? payload.status : "";
  const data =
    payload.data && typeof payload.data === "object"
      ? (payload.data as Record<string, unknown>)
      : null;
  const nestedStatus = data && typeof data.status === "string" ? data.status : "";
  const nestedType = data && typeof data.type === "string" ? data.type : "";
  const haystack = `${type} ${event} ${status} ${nestedType} ${nestedStatus}`;
  return /order\.completed|payin\.complete|payin\.completed/i.test(haystack)
    || /^(completed|complete|paid|success)$/i.test(status)
    || /^(completed|complete|paid|success)$/i.test(nestedStatus);
}

export async function POST(request: Request) {
  const secret = process.env.KOYWE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      {
        error: "Riel no live. Configurá KOYWE_WEBHOOK_SECRET para acreditar PAYIN reales.",
        simulation: true,
      },
      { status: 503 },
    );
  }

  const header =
    request.headers.get("x-webhook-secret") ||
    request.headers.get("x-koywe-signature") ||
    request.headers.get("authorization");
  if (!verifySharedSecret(bearerOrRaw(header), secret)) {
    return NextResponse.json({ error: "Firma de webhook inválida." }, { status: 401 });
  }

  const payload = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  if (!isPayinCompleted(payload)) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const referencia = extractLumReferencia(payload);
  const orderId = extractProviderOrderId(payload);
  const match = referencia
    ? await findAporteByReferencia(referencia)
    : orderId
      ? await findAporteByProviderOrderId(orderId)
      : undefined;

  if (!match) {
    return NextResponse.json(
      { error: "Aporte no encontrado.", referencia, orderId },
      { status: 404 },
    );
  }
  if (match.status === "en_escrow" || match.status === "certificado") {
    return NextResponse.json({ ok: true, already: match.status });
  }

  const { aporte, chain } = await settleFiatAporte(match.id, match.empresaId);
  return NextResponse.json({ ok: true, aporte, chain });
}
