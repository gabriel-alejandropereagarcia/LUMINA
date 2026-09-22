import { NextResponse } from "next/server";
import { lucesPublicas } from "@/lib/empresa/camino";

export const runtime = "nodejs";

export async function GET() {
  const luces = lucesPublicas();
  return NextResponse.json({
    luces,
    trabajosCobrados: luces.reduce((sum, item) => sum + item.quantity, 0),
  });
}
