import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import type { Aporte, Certificado, Empresa, EmpresaDb } from "./types";
import { APP_CLAIMS, LUMINA_CLAIMS, quantityFromLock } from "@/lib/hito/fact";
import { getImpactApp } from "@/lib/impact-apps";
import { DEMO_PAYMENT } from "./payment";

const DATA_DIR = path.join(process.cwd(), ".data");
const FILE = path.join(DATA_DIR, "empresa.json");

const emptyDb = (): EmpresaDb => ({
  empresas: [],
  aportes: [],
  certificados: [],
});

let cache: EmpresaDb | null = null;
let cacheMtime = 0;
let writeQueue: Promise<void> = Promise.resolve();

async function readDb(): Promise<EmpresaDb> {
  try {
    const stat = await fs.stat(FILE);
    if (cache && stat.mtimeMs === cacheMtime) return cache;
    const raw = await fs.readFile(FILE, "utf8");
    const parsed = JSON.parse(raw) as EmpresaDb;
    cacheMtime = stat.mtimeMs;
    cache = {
      empresas: parsed.empresas ?? [],
      aportes: parsed.aportes ?? [],
      certificados: parsed.certificados ?? [],
    };
    return cache;
  } catch {
    cache = emptyDb();
    cacheMtime = 0;
    return cache;
  }
}

async function writeDb(next: EmpresaDb): Promise<void> {
  cache = next;
  writeQueue = writeQueue.then(async () => {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(next, null, 2), "utf8");
    const stat = await fs.stat(FILE);
    cacheMtime = stat.mtimeMs;
  });
  try {
    await writeQueue;
  } catch {
    // En serverless el disco no persiste; el cache en memoria alcanza para el proceso.
  }
}

function shortId(prefix: string): string {
  return `${prefix}-${randomUUID().replace(/-/g, "").slice(0, 8)}`;
}

export async function upsertEmpresa(email: string, company: string): Promise<Empresa> {
  const db = await readDb();
  const normalized = email.trim().toLowerCase();
  const name = company.trim();
  const existing = db.empresas.find((item) => item.email === normalized);
  if (existing) {
    if (name && existing.company !== name) {
      existing.company = name;
      await writeDb(db);
    }
    return existing;
  }
  const created: Empresa = {
    id: shortId("emp"),
    email: normalized,
    company: name,
    createdAt: new Date().toISOString(),
  };
  db.empresas.push(created);
  await writeDb(db);
  return created;
}

export async function getEmpresa(id: string): Promise<Empresa | undefined> {
  const db = await readDb();
  return db.empresas.find((item) => item.id === id);
}

export async function listAportes(empresaId: string): Promise<Aporte[]> {
  const db = await readDb();
  return db.aportes
    .filter((item) => item.empresaId === empresaId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getAporte(id: string): Promise<Aporte | undefined> {
  const db = await readDb();
  return db.aportes.find((item) => item.id === id);
}

export async function findAporteByReferencia(referencia: string): Promise<Aporte | undefined> {
  const db = await readDb();
  const needle = referencia.trim().toUpperCase();
  return db.aportes.find((item) => item.referencia === needle);
}

export async function findAporteByProviderOrderId(orderId: string): Promise<Aporte | undefined> {
  const db = await readDb();
  return db.aportes.find((item) => item.providerOrderId === orderId);
}

export async function createAporte(input: {
  empresaId: string;
  amountUsd: number;
  amountArs: number;
  appId: string;
  appName: string;
  schemaId: string;
  unitLabel: string;
  lockPriceUsd: number;
  oracleAddress?: string;
}): Promise<Aporte> {
  const db = await readDb();
  const id = shortId("apo");
  const lock = new Date();
  lock.setMonth(lock.getMonth() + 12);
  const aporte: Aporte = {
    id,
    empresaId: input.empresaId,
    amountUsd: input.amountUsd,
    amountArs: input.amountArs,
    appId: input.appId,
    appName: input.appName,
    referencia: `LUM-${id.slice(-8).toUpperCase()}`,
    status: "orden",
    createdAt: new Date().toISOString(),
    lockUntil: lock.toISOString(),
    provider: "simulation",
    schemaId: input.schemaId,
    unitLabel: input.unitLabel,
    lockPriceUsd: input.lockPriceUsd,
    oracleAddress: input.oracleAddress,
    paymentInstructions: {
      kind: "simulation",
      beneficiary: DEMO_PAYMENT.beneficiary,
      license: DEMO_PAYMENT.license,
      alias: DEMO_PAYMENT.alias,
      cbu: DEMO_PAYMENT.cbu,
      bankLabel: DEMO_PAYMENT.bankLabel,
    },
  };
  db.aportes.push(aporte);
  await writeDb(db);
  return aporte;
}

export async function patchAporte(
  id: string,
  patch: Partial<Omit<Aporte, "id" | "empresaId">>,
): Promise<Aporte> {
  const db = await readDb();
  const aporte = db.aportes.find((item) => item.id === id);
  if (!aporte) throw new Error("Aporte no encontrado.");
  Object.assign(aporte, patch);
  await writeDb(db);
  return aporte;
}

export async function confirmTransfer(id: string, empresaId: string): Promise<Aporte> {
  const db = await readDb();
  const aporte = db.aportes.find((item) => item.id === id && item.empresaId === empresaId);
  if (!aporte) throw new Error("Aporte no encontrado.");
  if (aporte.status !== "orden") throw new Error("Este aporte ya no espera transferencia.");
  aporte.status = "pendiente_psav";
  aporte.transferConfirmedAt = new Date().toISOString();
  await writeDb(db);
  return aporte;
}

export async function creditAporte(id: string, empresaId: string): Promise<Aporte> {
  const db = await readDb();
  const aporte = db.aportes.find((item) => item.id === id && item.empresaId === empresaId);
  if (!aporte) throw new Error("Aporte no encontrado.");
  if (aporte.status !== "pendiente_psav" && aporte.status !== "orden") {
    throw new Error("Todavía no se puede acreditar este pago.");
  }
  if (aporte.status === "orden") {
    aporte.transferConfirmedAt = aporte.transferConfirmedAt ?? new Date().toISOString();
  }
  aporte.status = "en_escrow";
  aporte.creditedAt = new Date().toISOString();
  await writeDb(db);
  return aporte;
}

export async function listCertificados(empresaId: string): Promise<Certificado[]> {
  const db = await readDb();
  return db.certificados
    .filter((item) => item.empresaId === empresaId)
    .sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));
}

export async function getCertificado(id: string): Promise<Certificado | undefined> {
  const db = await readDb();
  return db.certificados.find((item) => item.id === id);
}

export async function listReservedForApp(appId: string): Promise<Aporte[]> {
  const db = await readDb();
  return db.aportes
    .filter((item) => item.appId === appId && item.status === "en_escrow")
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

/** La app confirmó un trabajo. Un certificado por unidad cobrada. */
export async function recordWorkRelease(input: {
  aporteId: string;
  reportHash: string;
  txHash: string;
  canonical: string;
  period: string;
  subjectCommitments: string[];
}): Promise<Certificado | null> {
  const db = await readDb();
  const aporte = db.aportes.find((item) => item.id === input.aporteId);
  if (!aporte) return null;
  if (aporte.status !== "en_escrow") {
    throw new Error("Este pago ya no espera un trabajo.");
  }

  const existing = db.certificados.find((item) => item.reportHash === input.reportHash);
  if (existing) {
    existing.txHash = input.txHash;
    existing.simulation = false;
    await writeDb(db);
    return existing;
  }

  const empresa = db.empresas.find((item) => item.id === aporte.empresaId);
  if (!empresa) throw new Error("Empresa no encontrada.");
  const app = getImpactApp(aporte.appId);
  if (!app) throw new Error("La app de este aporte ya no está en el catálogo.");

  const lockPriceUsd = aporte.lockPriceUsd || app.priceUsdc;
  const total = quantityFromLock(aporte.amountUsd, lockPriceUsd);
  const nextUnits = (aporte.certifiedUnits ?? 0) + 1;

  const certId = shortId("cer");
  const certificado: Certificado = {
    id: certId,
    empresaId: aporte.empresaId,
    aporteId: aporte.id,
    company: empresa.company,
    appName: aporte.appName,
    appId: aporte.appId,
    amountUsd: lockPriceUsd,
    payoutAppUsd: Number((lockPriceUsd * 0.975).toFixed(2)),
    feeUsd: Number((lockPriceUsd * 0.025).toFixed(2)),
    reportHash: input.reportHash,
    issuedAt: new Date().toISOString(),
    txHash: input.txHash,
    simulation: false,
    schemaId: app.schemaId,
    unitLabel: app.unitLabel,
    quantity: 1,
    period: input.period,
    subjectCommitments: input.subjectCommitments,
    canonical: input.canonical,
    valueMethod: app.valueMethod,
    lockPriceUsd,
    scopeLumina: LUMINA_CLAIMS,
    scopeApp: APP_CLAIMS,
  };
  db.certificados.push(certificado);
  aporte.certifiedUnits = nextUnits;
  aporte.certificadoId = certId;
  aporte.txHash = input.txHash;
  if (nextUnits >= total) {
    aporte.status = "certificado";
  }
  await writeDb(db);
  return certificado;
}

export async function stampCertificadoTx(reportHash: string, txHash: string): Promise<void> {
  const db = await readDb();
  const certificado = db.certificados.find((item) => item.reportHash === reportHash);
  if (!certificado) return;
  certificado.txHash = txHash;
  certificado.simulation = false;
  const aporte = db.aportes.find((item) => item.id === certificado.aporteId);
  if (aporte) aporte.txHash = txHash;
  await writeDb(db);
}

export async function markRecovered(
  id: string,
  empresaId: string,
  txHash?: string,
): Promise<Aporte> {
  const db = await readDb();
  const aporte = db.aportes.find((item) => item.id === id && item.empresaId === empresaId);
  if (!aporte) throw new Error("Aporte no encontrado.");
  if (aporte.status !== "en_escrow") {
    throw new Error("Solo se recupera dinero que sigue reservado.");
  }
  aporte.status = "recuperado";
  aporte.recoveredAt = new Date().toISOString();
  if (txHash) aporte.txHash = txHash;
  await writeDb(db);
  return aporte;
}
