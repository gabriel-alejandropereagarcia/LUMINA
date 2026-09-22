import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { liveSession } from "./access";
import type { EmpresaSession } from "./types";

export const EMPRESA_COOKIE = "lumina_empresa";

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 14,
  secure: process.env.NODE_ENV === "production",
};

export function attachSession(response: NextResponse, session: EmpresaSession): void {
  response.cookies.set(EMPRESA_COOKIE, JSON.stringify(session), COOKIE_OPTIONS);
}

export function clearSession(response: NextResponse): void {
  response.cookies.set(EMPRESA_COOKIE, "", { ...COOKIE_OPTIONS, maxAge: 0 });
}

export async function readSession(): Promise<EmpresaSession | null> {
  const jar = await cookies();
  const raw = jar.get(EMPRESA_COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as EmpresaSession;
    if (!parsed.id || !parsed.email || !parsed.cuit) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function readLiveSession(): Promise<EmpresaSession | null> {
  return liveSession(await readSession());
}
