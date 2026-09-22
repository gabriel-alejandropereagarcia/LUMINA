import { NextResponse } from "next/server";
import { requestAccess } from "@/lib/empresa/access";
import { detectFiatRail } from "@/lib/empresa/rails";
import { luminaOps } from "@/lib/empresa/ops";
import { clearSession, readLiveSession } from "@/lib/empresa/session";
import { getEmpresa } from "@/lib/empresa/store";

export const runtime = "nodejs";

function originOf(request: Request): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    request.headers.get("origin") ||
    new URL(request.url).origin
  );
}

export async function GET() {
  const session = await readLiveSession();
  const empresa = session ? await getEmpresa(session.id) : undefined;
  const rail = detectFiatRail();
  const response = NextResponse.json({
    session,
    emails: empresa?.emails ?? [],
    rail: {
      id: rail.id,
      label: rail.label,
      live: rail.live,
      notes: rail.notes,
      companySeesWallet: rail.companySeesWallet,
    },
    ops: luminaOps(),
    caminoPublico: Boolean(empresa?.caminoPublico),
  });
  if (!session) clearSession(response);
  return response;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email : "";
  const cuit = typeof body.cuit === "string" ? body.cuit : "";
  const reset = body.reset === true || body.purpose === "reset";

  const result = await requestAccess({
    cuit,
    email,
    purpose: reset ? "reset" : "entrar",
    origin: originOf(request),
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    ok: true,
    sent: result.sent,
    mailReady: result.mailReady,
    entrarUrl: result.entrarUrl,
    message: result.mailReady
      ? "Si el mail es de esa empresa, te llega un link."
      : "El envío de mail está en trabajo. Pedí el link de nuevo cuando Lumina tenga el correo conectado.",
  });
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  clearSession(response);
  return response;
}
