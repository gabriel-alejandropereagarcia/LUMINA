import { NextResponse } from "next/server";
import { getCertificado } from "@/lib/empresa/store";

export const runtime = "nodejs";

/** Público a propósito: el certificado es el documento que ve la empresa y el usuario de la app. Sin email. */
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const certificado = await getCertificado(id);
  if (!certificado) {
    return NextResponse.json({ error: "Certificado no encontrado." }, { status: 404 });
  }
  return NextResponse.json({ certificado });
}
