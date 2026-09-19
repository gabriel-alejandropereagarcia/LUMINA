/**
 * Demo Scale: certificar un hito con unidad (no un hash suelto).
 *   npx tsx examples/certify.ts
 *
 * Carga lumina-web/.env.local si existe. LUMINA_SPONSOR tiene que ser la G que depositó.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadLocalEnv(): void {
  const candidates = [
    resolve("lumina-web/.env.local"),
    resolve("../lumina-web/.env.local"),
  ];
  for (const file of candidates) {
    try {
      const raw = readFileSync(file, "utf8");
      for (const line of raw.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eq = trimmed.indexOf("=");
        if (eq < 1) continue;
        const key = trimmed.slice(0, eq).trim();
        let value = trimmed.slice(eq + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        if (process.env[key] === undefined) process.env[key] = value;
      }
      return;
    } catch {
      /* next candidate */
    }
  }
}

loadLocalEnv();

const BASE = process.env.LUMINA_URL || "http://localhost:3000";
const SPONSOR = process.env.LUMINA_SPONSOR || process.env.NEXT_PUBLIC_SPONSOR_ADDRESS || "";
const AMOUNT = Number(process.env.LUMINA_AMOUNT || "40");
const SECRET = process.env.LUMINA_CERTIFY_SECRET || process.env.ORACLE_SECRET || "";
const ORACLE = process.env.NEXT_PUBLIC_ORACLE_ADDRESS || "";
const APP_ID = process.env.LUMINA_APP_ID || "mira";
const SCHEMA_ID = process.env.LUMINA_SCHEMA_ID || "mira.cribado.v1";
const UNIT_LABEL = process.env.LUMINA_UNIT_LABEL || "cribado M-CHAT-R/F";

function sha256Hex(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

function canonicalFact(fact: {
  schemaId: string;
  unitLabel: string;
  quantity: number;
  period: string;
  subjectCommitments: string[];
  sponsorRef: string;
  amountUsd: number;
  appId: string;
}): string {
  const commitments = [...fact.subjectCommitments].map((item) => item.toLowerCase()).sort();
  return JSON.stringify({
    protocol: "lumina",
    schemaId: fact.schemaId,
    unitLabel: fact.unitLabel,
    quantity: fact.quantity,
    period: fact.period,
    subjectCommitments: commitments,
    sponsorRef: fact.sponsorRef,
    amountUsd: fact.amountUsd,
    appId: fact.appId,
  });
}

async function main() {
  if (!SPONSOR) {
    console.error("Set LUMINA_SPONSOR=G...");
    process.exit(1);
  }
  if (!SECRET) {
    console.error("Set ORACLE_SECRET o LUMINA_CERTIFY_SECRET (secret de la app).");
    process.exit(1);
  }

  const period = new Date().toISOString().slice(0, 7);
  const fact = {
    schemaId: SCHEMA_ID,
    unitLabel: UNIT_LABEL,
    quantity: 1,
    period,
    subjectCommitments: [sha256Hex(`lumina-connect-demo:${Date.now()}`)],
    sponsorRef: SPONSOR,
    amountUsd: AMOUNT,
    appId: APP_ID,
  };
  const reportHash = sha256Hex(canonicalFact(fact));

  const res = await fetch(`${BASE}/api/v1/certify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SECRET}`,
    },
    body: JSON.stringify({
      oracle: ORACLE || undefined,
      sponsor: SPONSOR,
      amount: AMOUNT,
      reportHash,
      fact,
    }),
  });
  const json = await res.json();
  console.log(JSON.stringify(json, null, 2));
  if (!res.ok) process.exit(1);
  const tx = typeof json.hash === "string" ? json.hash : "";
  if (tx) {
    console.log(`jury: ${BASE}/jury?release=${tx}&hash=${reportHash}`);
  }
}

main();
