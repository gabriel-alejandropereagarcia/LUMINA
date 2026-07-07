import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const CONFIG_PATH = path.join(process.cwd(), "sponsor_notifications_config.json");

// Helper para leer el archivo de configuración
function readConfig(): Record<string, { email?: string; webhookUrl?: string }> {
  try {
    if (!fs.existsSync(CONFIG_PATH)) {
      return {};
    }
    const data = fs.readFileSync(CONFIG_PATH, "utf8");
    return JSON.parse(data || "{}");
  } catch (e) {
    console.error("Error al leer configuración de sponsors:", e);
    return {};
  }
}

// Helper para escribir el archivo de configuración
function writeConfig(config: Record<string, { email?: string; webhookUrl?: string }>) {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), "utf8");
  } catch (e) {
    console.error("Error al escribir configuración de sponsors:", e);
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json({ error: "Falta dirección de wallet (address)." }, { status: 400 });
    }

    const config = readConfig();
    const sponsorConfig = config[address.toLowerCase()] || { email: "", webhookUrl: "" };

    return NextResponse.json({ success: true, ...sponsorConfig });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Error interno." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { address, email, webhookUrl } = body;

    if (!address) {
      return NextResponse.json({ error: "Falta la dirección de wallet del sponsor." }, { status: 400 });
    }

    const config = readConfig();
    config[address.toLowerCase()] = {
      email: email || "",
      webhookUrl: webhookUrl || ""
    };

    writeConfig(config);

    return NextResponse.json({ success: true, message: "Configuración guardada correctamente." });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Error interno." }, { status: 500 });
  }
}
