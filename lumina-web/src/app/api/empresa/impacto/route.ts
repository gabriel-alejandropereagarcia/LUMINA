import { NextResponse } from "next/server";
import { readLiveSession as readSession } from "@/lib/empresa/session";
import { listAportes, listCertificados } from "@/lib/empresa/store";
import { aggregateBySchema } from "@/lib/hito/fact";

export const runtime = "nodejs";

export async function GET() {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: "Iniciá sesión en el portal Empresa." }, { status: 401 });
  }
  const certificados = await listCertificados(session.id);
  const aportes = await listAportes(session.id);
  const confirmados = certificados.filter((item) => !item.simulation);
  const totals = aggregateBySchema(confirmados);
  return NextResponse.json({
    company: session.company,
    cuit: session.cuit,
    totals,
    aportes,
    certificados,
    enTrabajo: certificados.length - confirmados.length,
    sentence: totals
      .map((row) => `${row.quantity} ${row.unitLabel} a través de ${row.appName}`)
      .join("; "),
  });
}
