import { promises as fs } from "fs";
import path from "path";
import type { HitoFact } from "./fact";
import { uniquenessKeys } from "./fact";

const FILE = path.join(process.cwd(), ".data", "hitos.json");

type HitoDb = {
  used: string[];
  facts: Array<HitoFact & { reportHash: string; txHash?: string; recordedAt: string }>;
};

const empty = (): HitoDb => ({ used: [], facts: [] });

let cache: HitoDb | null = null;
let cacheMtime = 0;

async function readDb(): Promise<HitoDb> {
  try {
    const stat = await fs.stat(FILE);
    if (cache && stat.mtimeMs === cacheMtime) return cache;
    const raw = await fs.readFile(FILE, "utf8");
    cacheMtime = stat.mtimeMs;
    cache = JSON.parse(raw) as HitoDb;
    cache.used = cache.used ?? [];
    cache.facts = cache.facts ?? [];
    return cache;
  } catch {
    cache = empty();
    cacheMtime = 0;
    return cache;
  }
}

async function writeDb(next: HitoDb): Promise<void> {
  cache = next;
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(next, null, 2), "utf8");
  const stat = await fs.stat(FILE);
  cacheMtime = stat.mtimeMs;
}

export async function assertAvailable(fact: HitoFact): Promise<void> {
  const db = await readDb();
  const keys = uniquenessKeys(fact);
  const taken = keys.find((key) => db.used.includes(key));
  if (taken) {
    throw new Error("Ese hito ya fue certificado (mismo esquema, período y sujeto).");
  }
}

export async function claimCommitments(fact: HitoFact, reportHash: string, txHash?: string): Promise<void> {
  await assertAvailable(fact);
  const db = await readDb();
  const keys = uniquenessKeys(fact);
  const taken = keys.find((key) => db.used.includes(key));
  if (taken) {
    throw new Error("Ese hito ya fue certificado (mismo esquema, período y sujeto).");
  }
  db.used.push(...keys);
  db.facts.push({
    ...fact,
    reportHash,
    txHash,
    recordedAt: new Date().toISOString(),
  });
  await writeDb(db);
}
