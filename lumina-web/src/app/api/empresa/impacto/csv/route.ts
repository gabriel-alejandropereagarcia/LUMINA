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
  const header = [
    "id",
    "app",
    "schemaId",
    "unitLabel",
    "quantity",
    "period",
    "amountUsd",
    "reportHash",
    "txHash",
    "issuedAt",
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
        item.txHash ?? "",
        item.issuedAt,
      ].join(","),
    ),
  ];
  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="lumina-impacto-${session.company.replace(/\s+/g, "-").toLowerCase()}.csv"`,
    },
  });
}

function csv(value: string): string {
  if (value.includes(",") || value.includes('"')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
