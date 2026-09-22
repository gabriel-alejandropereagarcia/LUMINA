import { NextResponse } from "next/server";
import { readLiveSession as readSession } from "@/lib/empresa/session";
import { confirmTransfer, getAporte, markRecovered } from "@/lib/empresa/store";
import { settleFiatAporte } from "@/lib/empresa/settle";
import { lockExpired, maybeTreasuryWithdraw, remainingUsd } from "@/lib/empresa/withdraw";

export const runtime = "nodejs";

type Action = "confirmar" | "acreditar" | "recuperar";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: "Iniciá sesión en Empresas en Lumina." }, { status: 401 });
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
    return NextResponse.json({ error: "Iniciá sesión en Empresas en Lumina." }, { status: 401 });
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
    if (action === "recuperar") {
      const current = await getAporte(id);
      if (!current || current.empresaId !== session.id) {
        return NextResponse.json({ error: "Aporte no encontrado." }, { status: 404 });
      }
      if (!lockExpired(current)) {
        return NextResponse.json(
          { error: "Todavía no pasaron los 12 meses. El dinero sigue reservado." },
          { status: 409 },
        );
      }
      if (remainingUsd(current) <= 0) {
        return NextResponse.json({ error: "No queda saldo para devolver." }, { status: 409 });
      }
      const chain = await maybeTreasuryWithdraw(current);
      if (chain.error && chain.attempted) {
        return NextResponse.json({ error: chain.error }, { status: 409 });
      }
      const aporte = await markRecovered(id, session.id, chain.hash);
      return NextResponse.json({ aporte, chain });
    }
    return NextResponse.json(
      { error: "Acción inválida. Usá confirmar, acreditar o recuperar." },
      { status: 400 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo actualizar el aporte.";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
