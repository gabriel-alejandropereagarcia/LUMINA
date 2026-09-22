import { NextResponse } from "next/server";
import { completeAccess } from "@/lib/empresa/access";
import { attachSession } from "@/lib/empresa/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const token = typeof body.token === "string" ? body.token.trim() : "";
  const session = await completeAccess(token);
  if (!session) {
    return NextResponse.json(
      { error: "Ese link ya no sirve. Pedí uno nuevo." },
      { status: 400 },
    );
  }
  const response = NextResponse.json({ session });
  attachSession(response, session);
  return response;
}
