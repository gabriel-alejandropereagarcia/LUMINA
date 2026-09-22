import { NextResponse } from "next/server";
import { requestAccess } from "@/lib/empresa/access";
import { readLiveSession } from "@/lib/empresa/session";

export const runtime = "nodejs";

function originOf(request: Request): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    request.headers.get("origin") ||
    new URL(request.url).origin
  );
}

export async function POST(request: Request) {
  const session = await readLiveSession();
  if (!session) {
    return NextResponse.json({ error: "Iniciá sesión en Empresas en Lumina." }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email : "";

  const result = await requestAccess({
    cuit: session.cuit,
    email,
    purpose: "invitar",
    origin: originOf(request),
    empresaId: session.id,
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    ok: true,
    sent: result.sent,
    mailReady: result.mailReady,
    entrarUrl: result.entrarUrl,
  });
}
