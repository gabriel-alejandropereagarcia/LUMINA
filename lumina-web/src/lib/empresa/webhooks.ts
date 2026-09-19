import { timingSafeEqual } from "crypto";

export function verifySharedSecret(header: string | null, secret: string): boolean {
  if (!header) return false;
  const given = Buffer.from(header);
  const expected = Buffer.from(secret);
  if (given.length !== expected.length) return false;
  return timingSafeEqual(given, expected);
}

export function bearerOrRaw(header: string | null): string | null {
  if (!header) return null;
  return header.startsWith("Bearer ") ? header.slice(7) : header;
}

export function extractLumReferencia(payload: Record<string, unknown>): string | null {
  const candidates: unknown[] = [
    payload.memo_code,
    payload.external_id,
    payload.externalId,
    payload.referencia,
  ];
  const data =
    payload.data && typeof payload.data === "object"
      ? (payload.data as Record<string, unknown>)
      : null;
  if (data) {
    candidates.push(
      data.memo_code,
      data.external_id,
      data.externalId,
      data.referencia,
    );
  }
  for (const value of candidates) {
    if (typeof value === "string" && /^LUM-[A-Z0-9]+$/i.test(value)) {
      return value.toUpperCase();
    }
  }
  return null;
}

export function extractProviderOrderId(payload: Record<string, unknown>): string | null {
  const data =
    payload.data && typeof payload.data === "object"
      ? (payload.data as Record<string, unknown>)
      : null;
  const candidates = [payload.id, payload.orderId, data?.id, data?.orderId];
  for (const value of candidates) {
    if (typeof value === "string" && value.length > 0) return value;
  }
  return null;
}
