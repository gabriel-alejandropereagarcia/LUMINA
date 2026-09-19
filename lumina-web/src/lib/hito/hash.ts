import { createHash } from "crypto";
import {
  canonicalFact,
  type HitoFact,
  uniquenessKeys,
} from "./fact";

const HEX64 = /^[0-9a-fA-F]{64}$/;

export function hashCanonical(canonical: string): string {
  return createHash("sha256").update(canonical).digest("hex");
}

export function hashFact(fact: HitoFact): { canonical: string; reportHash: string } {
  const canonical = canonicalFact(fact);
  return { canonical, reportHash: hashCanonical(canonical) };
}

export function subjectCommitment(parts: string[]): string {
  return createHash("sha256").update(parts.join(":")).digest("hex");
}

export function parseFact(body: unknown): HitoFact | null {
  if (!body || typeof body !== "object") return null;
  const raw = body as Record<string, unknown>;
  const schemaId = typeof raw.schemaId === "string" ? raw.schemaId.trim() : "";
  const unitLabel = typeof raw.unitLabel === "string" ? raw.unitLabel.trim() : "";
  const period = typeof raw.period === "string" ? raw.period.trim() : "";
  const sponsorRef = typeof raw.sponsorRef === "string" ? raw.sponsorRef.trim() : "";
  const appId = typeof raw.appId === "string" ? raw.appId.trim() : "";
  const quantity = Number(raw.quantity);
  const amountUsd = Number(raw.amountUsd);
  const commitments = Array.isArray(raw.subjectCommitments)
    ? raw.subjectCommitments.filter((item): item is string => typeof item === "string")
    : [];

  if (!schemaId || !unitLabel || !sponsorRef || !appId) return null;
  if (!/^\d{4}-\d{2}$/.test(period)) return null;
  if (!Number.isFinite(quantity) || quantity < 1 || quantity > 10_000) return null;
  if (!Number.isFinite(amountUsd) || amountUsd <= 0) return null;
  if (commitments.length !== quantity) return null;
  if (commitments.some((item) => !HEX64.test(item))) return null;

  return {
    protocol: "lumina",
    schemaId,
    unitLabel,
    quantity: Math.round(quantity),
    period,
    subjectCommitments: commitments.map((item) => item.toLowerCase()),
    sponsorRef,
    amountUsd: Number(amountUsd.toFixed(2)),
    appId,
  };
}

export function assertFact(fact: HitoFact): void {
  const unique = new Set(uniquenessKeys(fact));
  if (unique.size !== fact.subjectCommitments.length) {
    throw new Error("Hay subject_commitment repetidos en este hito.");
  }
}

export { uniquenessKeys };
