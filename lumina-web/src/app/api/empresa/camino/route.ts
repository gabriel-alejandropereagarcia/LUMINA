import { NextResponse } from "next/server";
import { readLiveSession } from "@/lib/empresa/session";
import { setCaminoPublico } from "@/lib/empresa/store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await readLiveSession();
  if (!session) {
    return NextResponse.json({ error: "Iniciá sesión en Empresas en Lumina." }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const publico = body.publico === true;
  const empresa = await setCaminoPublico(session.id, publico);
  return NextResponse.json({
    ok: true,
    caminoPublico: Boolean(empresa.caminoPublico),
  });
}
