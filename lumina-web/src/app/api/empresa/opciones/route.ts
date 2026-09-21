import { NextResponse } from "next/server";
import { readSession } from "@/lib/empresa/session";
import { listFundableOptions } from "@/lib/empresa/fundable";

export const runtime = "nodejs";

export async function GET() {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: "Iniciá sesión en Empresas en Lumina." }, { status: 401 });
  }
  const opciones = await listFundableOptions();
  return NextResponse.json({ opciones });
}
