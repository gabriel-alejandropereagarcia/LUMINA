import { NextResponse } from "next/server";
import { resetEmpresaAccess } from "@/lib/empresa/access";
import { clearSession, readLiveSession } from "@/lib/empresa/session";

export const runtime = "nodejs";

export async function POST() {
  const session = await readLiveSession();
  if (!session) {
    return NextResponse.json({ error: "Iniciá sesión en Empresas en Lumina." }, { status: 401 });
  }
  await resetEmpresaAccess(session.id);
  const response = NextResponse.json({ ok: true });
  clearSession(response);
  return response;
}
