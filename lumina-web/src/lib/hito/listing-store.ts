import { promises as fs } from "fs";
import { randomUUID } from "crypto";
import path from "path";

export type ListingStatus = "pending" | "listed" | "paused";

export type AppListing = {
  id: string;
  name: string;
  schemaId: string;
  unitLabel: string;
  valueMethod: string;
  lockPriceUsd: number;
  hashIncludes: string;
  hashExcludes: string;
  postReleasePromise: string;
  oracle: string;
  payout: string;
  milestone: string;
  hitoDocumento: string;
  status: ListingStatus;
  createdAt: string;
  acceptedToSAt?: string;
};

type ListingDb = { listings: AppListing[] };

const FILE = path.join(process.cwd(), ".data", "listings.json");
const empty = (): ListingDb => ({ listings: [] });

let cache: ListingDb | null = null;
let cacheMtime = 0;

async function readDb(): Promise<ListingDb> {
  try {
    const stat = await fs.stat(FILE);
    if (cache && stat.mtimeMs === cacheMtime) return cache;
    const raw = await fs.readFile(FILE, "utf8");
    cacheMtime = stat.mtimeMs;
    cache = JSON.parse(raw) as ListingDb;
    cache.listings = cache.listings ?? [];
    return cache;
  } catch {
    cache = empty();
    cacheMtime = 0;
    return cache;
  }
}

async function writeDb(next: ListingDb): Promise<void> {
  cache = next;
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(next, null, 2), "utf8");
  const stat = await fs.stat(FILE);
  cacheMtime = stat.mtimeMs;
}

export async function listListings(): Promise<AppListing[]> {
  const db = await readDb();
  return [...db.listings].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createListing(
  input: Omit<AppListing, "id" | "status" | "createdAt" | "acceptedToSAt">,
): Promise<AppListing> {
  const db = await readDb();
  const listing: AppListing = {
    ...input,
    id: `lst-${randomUUID().replace(/-/g, "").slice(0, 8)}`,
    status: "pending",
    createdAt: new Date().toISOString(),
    acceptedToSAt: new Date().toISOString(),
  };
  db.listings.unshift(listing);
  await writeDb(db);
  return listing;
}

export async function setListingStatus(id: string, status: ListingStatus): Promise<AppListing> {
  const db = await readDb();
  const listing = db.listings.find((item) => item.id === id);
  if (!listing) throw new Error("Alta no encontrada.");
  listing.status = status;
  await writeDb(db);
  return listing;
}

export async function isSchemaPaused(schemaId: string): Promise<boolean> {
  const db = await readDb();
  return db.listings.some((item) => item.schemaId === schemaId && item.status === "paused");
}
