import { NextResponse } from "next/server";
import { readSession } from "@/lib/empresa/session";
import { listCertificados } from "@/lib/empresa/store";
import { aggregateBySchema } from "@/lib/hito/fact";

export const runtime = "nodejs";

export async function GET() {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: "Iniciá sesión en el portal Empresa." }, { status: 401 });
  }
  const certificados = await listCertificados(session.id);
  const totals = aggregateBySchema(certificados);
  return NextResponse.json({
    company: session.company,
    totals,
    certificados,
    sentence: totals
      .map(
        (row) =>
          `${row.quantity} ${row.unitLabel}${row.quantity === 1 ? "" : "s"} a través de ${row.appName}`,
      )
      .join("; "),
  });
}
