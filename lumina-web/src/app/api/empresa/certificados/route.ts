import { NextResponse } from "next/server";
import { readSession } from "@/lib/empresa/session";
import { listCertificados } from "@/lib/empresa/store";

export const runtime = "nodejs";

export async function GET() {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: "Iniciá sesión en el portal Empresa." }, { status: 401 });
  }
  const certificados = await listCertificados(session.id);
  return NextResponse.json({ certificados });
}
