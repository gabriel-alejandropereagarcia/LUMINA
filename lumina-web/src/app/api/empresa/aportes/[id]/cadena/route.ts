import { NextResponse } from "next/server";
import { estadoCadena } from "@/lib/empresa/cadena";
import { readLiveSession } from "@/lib/empresa/session";
import { getAporte } from "@/lib/empresa/store";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await readLiveSession();
  if (!session) {
    return NextResponse.json({ error: "Iniciá sesión en Empresas en Lumina." }, { status: 401 });
  }
  const { id } = await context.params;
  const aporte = await getAporte(id);
  if (!aporte || aporte.empresaId !== session.id) {
    return NextResponse.json({ error: "Orden no encontrada." }, { status: 404 });
  }
  const cadena = await estadoCadena(aporte);
  return NextResponse.json({ cadena });
}
