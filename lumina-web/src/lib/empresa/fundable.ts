import { IMPACT_APPS, getImpactApp, type ImpactApp } from "@/lib/impact-apps";
import { listListings, type AppListing } from "@/lib/hito/listing-store";
import type { FundableOption } from "./types";

export type { FundableOption };

function fromCatalog(app: ImpactApp): FundableOption {
  return {
    id: app.id,
    name: app.name,
    unitLabel: app.unitLabel,
    priceUsdc: app.priceUsdc,
    categoryLabel: app.categoryLabel,
    milestone: app.milestone,
    statusLabel: app.paused ? "Pausada" : app.statusLabel,
    oracleAddress: app.oracleAddress,
    payoutAddress: app.payoutAddress,
    schemaId: app.schemaId,
    valueMethod: app.valueMethod,
  };
}

function fromListing(listing: AppListing): FundableOption {
  return {
    id: listing.id,
    name: listing.name,
    unitLabel: listing.unitLabel,
    priceUsdc: listing.lockPriceUsd,
    categoryLabel: "En Lumina",
    milestone: listing.milestone || listing.unitLabel,
    statusLabel: "En Lumina",
    oracleAddress: listing.oracle,
    payoutAddress: listing.payout || listing.oracle,
    schemaId: listing.schemaId,
    valueMethod: listing.valueMethod,
  };
}

/** Catálogo de trabajos que una empresa puede financiar. */
export async function listFundableOptions(): Promise<FundableOption[]> {
  const catalog = IMPACT_APPS.filter((app) => !app.paused).map(fromCatalog);
  const knownSchemas = new Set(catalog.map((item) => item.schemaId));
  const listings = await listListings();
  const extras = listings
    .filter((item) => item.status === "listed" && !knownSchemas.has(item.schemaId))
    .map(fromListing);
  return [...catalog, ...extras];
}

export async function resolveFundable(id: string): Promise<FundableOption | undefined> {
  const fromStatic = getImpactApp(id);
  if (fromStatic && !fromStatic.paused) return fromCatalog(fromStatic);
  const options = await listFundableOptions();
  return options.find((item) => item.id === id || item.schemaId === id);
}
