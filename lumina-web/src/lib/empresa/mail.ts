import { promises as fs } from "fs";
import path from "path";

const PUBLIC_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "hotmail.com",
  "hotmail.es",
  "outlook.com",
  "outlook.es",
  "live.com",
  "msn.com",
  "yahoo.com",
  "yahoo.com.ar",
  "icloud.com",
  "me.com",
  "proton.me",
  "protonmail.com",
  "aol.com",
  "gmx.com",
  "yopmail.com",
]);

const OUTBOX = path.join(process.cwd(), ".data", "outbox.json");

export function mailReady(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export function isCorporateEmail(value: string): boolean {
  const email = value.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;
  const domain = email.split("@")[1] ?? "";
  return !PUBLIC_DOMAINS.has(domain);
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function mailFrom(): string {
  return process.env.RESEND_FROM?.trim() || "Lumina <noreply@lumina.earth>";
}

export async function sendEmpresaLink(input: {
  to: string;
  cuitLabel: string;
  entrarUrl: string;
  reset: boolean;
}): Promise<{ sent: boolean; error?: string }> {
  const subject = input.reset
    ? "Nuevo acceso a tu tablero en Lumina"
    : "Entrar a tu tablero en Lumina";
  const html = `
    <div style="font-family: Georgia, serif; padding: 24px; color: #1A232E; max-width: 560px;">
      <p style="font-size: 12px; letter-spacing: 0.16em; text-transform: uppercase; color: #0D5E6A; margin: 0 0 8px;">Lumina</p>
      <h1 style="font-size: 24px; margin: 0 0 16px;">Tu tablero</h1>
      <p style="line-height: 1.5;">Este mail abre el tablero de <strong>${escapeHtml(input.cuitLabel)}</strong>. El link vence en 15 minutos.</p>
      <p style="margin: 28px 0;">
        <a href="${escapeHtml(input.entrarUrl)}" style="background: #0D5E6A; color: #fff; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 700;">Entrar a Lumina</a>
      </p>
      <p style="font-size: 13px; color: #5A6B7A;">Si no lo pediste, ignorá este mail. Lumina no te pide una contraseña.</p>
    </div>
  `;

  await appendOutbox({
    to: input.to,
    subject,
    url: input.entrarUrl,
    at: new Date().toISOString(),
  });

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    return { sent: false, error: "RESEND_API_KEY" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: mailFrom(),
      to: input.to,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    return { sent: false, error: detail.slice(0, 200) || `Resend ${response.status}` };
  }
  return { sent: true };
}

async function appendOutbox(entry: { to: string; subject: string; url: string; at: string }) {
  try {
    await fs.mkdir(path.dirname(OUTBOX), { recursive: true });
    let rows: unknown[] = [];
    try {
      rows = JSON.parse(await fs.readFile(OUTBOX, "utf8")) as unknown[];
    } catch {
      rows = [];
    }
    const next = [entry, ...rows].slice(0, 30);
    await fs.writeFile(OUTBOX, JSON.stringify(next, null, 2), "utf8");
  } catch {
    // En serverless el disco no persiste; el envío por Resend es lo que cuenta.
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
