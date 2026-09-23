import { NextResponse } from "next/server";
import { lucesDesdeCobros } from "@/lib/empresa/camino";
import { cobrosParaCamino } from "@/lib/empresa/store";

export const runtime = "nodejs";

export async function GET() {
  const luces = lucesDesdeCobros(await cobrosParaCamino());
  return NextResponse.json({
    luces,
    trabajosCobrados: luces.reduce((sum, item) => sum + item.quantity, 0),
  });
}
