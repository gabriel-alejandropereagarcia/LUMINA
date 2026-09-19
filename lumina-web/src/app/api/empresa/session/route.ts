import { NextResponse } from "next/server";
import { attachSession, clearSession, isValidEmail, readSession } from "@/lib/empresa/session";
import { upsertEmpresa } from "@/lib/empresa/store";
import { detectFiatRail } from "@/lib/empresa/rails";

export const runtime = "nodejs";

export async function GET() {
  const session = await readSession();
  const rail = detectFiatRail();
  return NextResponse.json({
    session: session ?? null,
    rail: {
      id: rail.id,
      label: rail.label,
      live: rail.live,
      notes: rail.notes,
      companySeesWallet: rail.companySeesWallet,
    },
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email : "";
  const company = typeof body.company === "string" ? body.company : "";

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Ingresá un email corporativo válido." }, { status: 400 });
  }
  if (company.trim().length < 2 || company.trim().length > 80) {
    return NextResponse.json({ error: "El nombre de la empresa debe tener entre 2 y 80 caracteres." }, { status: 400 });
  }

  const empresa = await upsertEmpresa(email, company);
  const session = { id: empresa.id, email: empresa.email, company: empresa.company };
  const response = NextResponse.json({ session });
  attachSession(response, session);
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  clearSession(response);
  return response;
}
