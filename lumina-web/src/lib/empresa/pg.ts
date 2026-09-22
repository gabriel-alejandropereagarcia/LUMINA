import postgres from "postgres";
import type { EmpresaDb } from "./types";

const empty = (): EmpresaDb => ({
  empresas: [],
  aportes: [],
  certificados: [],
  accessTokens: [],
  accessEvents: [],
});

let client: ReturnType<typeof postgres> | null = null;

export function persistReady(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

function sql() {
  if (!process.env.DATABASE_URL) return null;
  if (!client) {
    client = postgres(process.env.DATABASE_URL, { max: 1, idle_timeout: 20, connect_timeout: 8 });
  }
  return client;
}

async function ensure(db: NonNullable<ReturnType<typeof sql>>) {
  await db`
    CREATE TABLE IF NOT EXISTS lumina_blob (
      id integer PRIMARY KEY,
      payload jsonb NOT NULL,
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `;
}

export async function readPg(): Promise<EmpresaDb | null> {
  const db = sql();
  if (!db) return null;
  try {
    await ensure(db);
    const rows = await db`SELECT payload FROM lumina_blob WHERE id = 1`;
    const payload = rows[0]?.payload as EmpresaDb | undefined;
    if (!payload) return empty();
    return {
      empresas: payload.empresas ?? [],
      aportes: payload.aportes ?? [],
      certificados: payload.certificados ?? [],
      accessTokens: payload.accessTokens ?? [],
      accessEvents: payload.accessEvents ?? [],
    };
  } catch (error) {
    console.error("readPg:", error);
    return null;
  }
}

export async function writePg(next: EmpresaDb): Promise<boolean> {
  const db = sql();
  if (!db) return false;
  try {
    await ensure(db);
    await db`
      INSERT INTO lumina_blob (id, payload, updated_at)
      VALUES (1, ${db.json(next)}, now())
      ON CONFLICT (id) DO UPDATE SET payload = excluded.payload, updated_at = now()
    `;
    return true;
  } catch (error) {
    console.error("writePg:", error);
    return false;
  }
}
