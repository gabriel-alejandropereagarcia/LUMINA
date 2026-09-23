import { NextResponse } from "next/server";
import { readLiveSession as readSession } from "@/lib/empresa/session";
import { listAportes, listCertificados } from "@/lib/empresa/store";

export const runtime = "nodejs";

export async function GET() {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: "Iniciá sesión en el portal Empresa." }, { status: 401 });
  }
  const certificados = await listCertificados(session.id);
  const aportes = await listAportes(session.id);
  const byAporte = new Map(aportes.map((item) => [item.id, item]));
  const fileId = session.cuit || session.company.replace(/\s+/g, "-").toLowerCase();
  const header = [
    "id",
    "app",
    "schemaId",
    "unitLabel",
    "quantity",
    "period",
    "amountUsd",
    "reportHash",
    "paidHash",
    "choseHash",
    "chargedHash",
    "txHash",
    "issuedAt",
    "estado",
  ];
  const lines = [
    header.join(","),
    ...certificados.map((item) =>
      [
        item.id,
        csv(item.appName),
        item.schemaId ?? "",
        csv(item.unitLabel ?? ""),
        String(item.quantity ?? ""),
        item.period ?? "",
        String(item.amountUsd),
        item.reportHash,
        byAporte.get(item.aporteId)?.paidHash ?? "",
        byAporte.get(item.aporteId)?.choseHash ?? "",
        byAporte.get(item.aporteId)?.chargedHash ?? item.txHash ?? "",
        item.txHash ?? "",
        item.issuedAt,
        item.simulation ? "en trabajo" : "la ayuda llegó",
      ].join(","),
    ),
  ];
  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="lumina-impacto-${fileId}.csv"`,
    },
  });
}

function csv(value: string): string {
  if (value.includes(",") || value.includes('"')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
