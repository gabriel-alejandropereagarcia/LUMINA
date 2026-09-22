import { NextResponse } from "next/server";
import { leerRecibos } from "@/lib/empresa/horizon-recibo";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const raw = url.searchParams.get("h") || url.searchParams.get("hashes") || "";
  const hashes = raw.split(",").map((item) => item.trim()).filter(Boolean).slice(0, 12);
  const recibos = await leerRecibos(hashes);
  return NextResponse.json({ recibos });
}
