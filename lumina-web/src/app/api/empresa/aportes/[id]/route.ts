import { NextResponse } from "next/server";
import { readSession } from "@/lib/empresa/session";
import { confirmTransfer, getAporte, issueCertificado } from "@/lib/empresa/store";
import { settleFiatAporte } from "@/lib/empresa/settle";

export const runtime = "nodejs";

type Action = "confirmar" | "acreditar" | "certificar";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: "Iniciá sesión en el portal Empresa." }, { status: 401 });
  }
  const { id } = await context.params;
  const aporte = await getAporte(id);
  if (!aporte || aporte.empresaId !== session.id) {
    return NextResponse.json({ error: "Aporte no encontrado." }, { status: 404 });
  }
  return NextResponse.json({ aporte });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: "Iniciá sesión en el portal Empresa." }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const action = (typeof body.action === "string" ? body.action : "") as Action;

  try {
    if (action === "confirmar") {
      const aporte = await confirmTransfer(id, session.id);
      return NextResponse.json({ aporte });
    }
    if (action === "acreditar") {
      const { aporte, chain } = await settleFiatAporte(id, session.id);
      return NextResponse.json({ aporte, chain });
    }
    if (action === "certificar") {
      const certificado = await issueCertificado(id, session.id);
      const aporte = await getAporte(id);
      return NextResponse.json({ aporte, certificado });
    }
    return NextResponse.json(
      { error: "Acción inválida. Usá confirmar, acreditar o certificar." },
      { status: 400 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo actualizar el aporte.";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
