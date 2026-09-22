import { createHash, randomBytes } from "crypto";
import { digitsCuit, displayEmpresa, formatCuit, isValidCuit } from "./cuit";
import { isCorporateEmail, mailReady, normalizeEmail, sendEmpresaLink } from "./mail";
import {
  addAuthorizedEmail,
  bumpSessionEpoch,
  claimEmpresa,
  consumeAccessToken,
  createAccessToken,
  getEmpresa,
  getEmpresaByCuit,
  latestAccessRequestAt,
  revokeAccessTokens,
} from "./store";
import type { AccessPurpose, Empresa, EmpresaSession } from "./types";

const RATE_MS = 90_000;

export function hashAccessSecret(secret: string): string {
  return createHash("sha256").update(secret).digest("hex");
}

export function newAccessSecret(): string {
  return randomBytes(32).toString("hex");
}

export function toSession(empresa: Empresa, email: string): EmpresaSession {
  const normalized = normalizeEmail(email);
  return {
    id: empresa.id,
    email: normalized,
    company: displayEmpresa(empresa.cuit, empresa.company),
    cuit: empresa.cuit,
    epoch: empresa.sessionEpoch ?? 0,
  };
}

export async function liveSession(
  session: EmpresaSession | null,
): Promise<EmpresaSession | null> {
  if (!session?.id || !session.cuit || !session.email) return null;
  const empresa = await getEmpresa(session.id);
  if (!empresa || empresa.cuit !== digitsCuit(session.cuit)) return null;
  if ((empresa.sessionEpoch ?? 0) !== (session.epoch ?? 0)) return null;
  if (!empresa.emails.includes(normalizeEmail(session.email))) return null;
  return toSession(empresa, session.email);
}

export async function requestAccess(input: {
  cuit: string;
  email: string;
  purpose: AccessPurpose;
  origin: string;
  empresaId?: string;
}): Promise<{ ok: true; sent: boolean; mailReady: boolean; entrarUrl?: string } | { error: string; status: number }> {
  if (!isValidCuit(input.cuit)) {
    return { error: "Ingresá un CUIT válido.", status: 400 };
  }
  if (!isCorporateEmail(input.email)) {
    return { error: "Usá el mail de la empresa. No Gmail ni Hotmail.", status: 400 };
  }

  const cuit = digitsCuit(input.cuit);
  const email = normalizeEmail(input.email);
  const existing = await getEmpresaByCuit(cuit);

  if (input.purpose === "invitar") {
    if (!input.empresaId || existing?.id !== input.empresaId) {
      return { error: "No se puede sumar ese mail.", status: 403 };
    }
  } else if (input.purpose === "reset") {
    if (!existing || !existing.emails.includes(email)) {
      return genericOk();
    }
  } else if (existing && !existing.emails.includes(email)) {
    return genericOk();
  }

  const last = await latestAccessRequestAt(cuit, email);
  if (last && Date.now() - new Date(last).getTime() < RATE_MS) {
    return genericOk();
  }

  if (input.purpose === "reset" && existing) {
    await revokeAccessTokens(cuit, email);
  }

  const secret = newAccessSecret();
  await createAccessToken({
    cuit,
    email,
    purpose: input.purpose,
    empresaId: existing?.id ?? input.empresaId,
    hash: hashAccessSecret(secret),
  });

  const entrarUrl = `${input.origin.replace(/\/$/, "")}/empresa/entrar?token=${secret}`;
  const sent = await sendEmpresaLink({
    to: email,
    cuitLabel: formatCuit(cuit),
    entrarUrl,
    reset: input.purpose === "reset",
  });

  return {
    ok: true,
    sent: sent.sent,
    mailReady: mailReady(),
    entrarUrl: revealLink() ? entrarUrl : undefined,
  };
}

export async function completeAccess(secret: string): Promise<EmpresaSession | null> {
  if (!/^[a-f0-9]{64}$/i.test(secret)) return null;
  const token = await consumeAccessToken(hashAccessSecret(secret));
  if (!token) return null;

  if (token.purpose === "invitar" && token.empresaId) {
    const empresa = await addAuthorizedEmail(token.empresaId, token.email);
    return toSession(empresa, token.email);
  }

  const existing = await getEmpresaByCuit(token.cuit);
  if (!existing) {
    const created = await claimEmpresa(token.cuit, token.email);
    return toSession(created, token.email);
  }
  if (!existing.emails.includes(token.email)) return null;
  return toSession(existing, token.email);
}

export async function resetEmpresaAccess(empresaId: string): Promise<void> {
  const empresa = await getEmpresa(empresaId);
  if (!empresa) throw new Error("Empresa no encontrada.");
  await revokeAccessTokens(empresa.cuit);
  await bumpSessionEpoch(empresaId);
}

function genericOk(): { ok: true; sent: boolean; mailReady: boolean } {
  return { ok: true, sent: false, mailReady: mailReady() };
}

function revealLink(): boolean {
  return process.env.NODE_ENV !== "production" && !mailReady();
}
