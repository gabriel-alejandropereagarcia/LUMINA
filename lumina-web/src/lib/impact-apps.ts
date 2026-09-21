export type ImpactCategory = "salud" | "ambiental" | "educacion" | "deporte";
export type AppStatus = "wip" | "live" | "next";

export type ImpactApp = {
  id: string;
  name: string;
  category: ImpactCategory;
  categoryLabel: string;
  tagline: string;
  milestone: string;
  description: string;
  priceUsdc: number;
  status: AppStatus;
  statusLabel: string;
  image: string;
  imageAlt: string;
  /** Firma certify / assign_oracle. No es la wallet de cobro. */
  oracleAddress: string;
  /** Cobra el 97.5% (OracleConfig.payout). Puede ser distinta del signer. */
  payoutAddress: string;
  schemaId: string;
  unitLabel: string;
  valueMethod: string;
  hashIncludes: string;
  hashExcludes: string;
  postReleasePromise: string;
  paused?: boolean;
};

/**
 * Catálogo curado. La unidad del hito (niño-mes, cribado) es lo que
 * suma el panel de la empresa.
 */
export const IMPACT_APPS: ImpactApp[] = [
  {
    id: "mira",
    name: "MIRA AI",
    category: "salud",
    categoryLabel: "Salud",
    tagline: "App de impacto · en trabajo",
    milestone: "1 cribado M-CHAT-R/F completado",
    description:
      "Cribado temprano (M-CHAT-R/F + informe). Lumina no es la clínica: MIRA hace el trabajo y cobra cuando se hizo. El informe queda en MIRA.",
    priceUsdc: 40,
    status: "wip",
    statusLabel: "En trabajo",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=300&fit=crop",
    imageAlt: "MIRA AI — app de impacto en trabajo",
    oracleAddress:
      process.env.NEXT_PUBLIC_ORACLE_ADDRESS ||
      process.env.NEXT_PUBLIC_MIRA_ORACLE_ADDRESS ||
      "GBJJCKJBEF2ILRD5LGWXGH5BQIKZ6EYFDS3RHQZQ5KBCOV4XHSDESM7W",
    payoutAddress:
      process.env.NEXT_PUBLIC_MIRA_PAYOUT_ADDRESS ||
      "GDWOBCG7XPQZOMO7FAOJB73RDDJX4TV3OHP5CIBRYPI3TXMWRYMJ6FHV",
    schemaId: "mira.cribado.v1",
    unitLabel: "cribado M-CHAT-R/F",
    valueMethod: "1 trabajo = 1 informe de cribado. No es un diagnóstico.",
    hashIncludes: "schema, período, quantity, subject_commitment ciego, sponsor, monto",
    hashExcludes: "DNI, clínica, nombre del niño, escuela",
    postReleasePromise: "El informe queda en MIRA. Lumina no ve el PDF.",
  },
  {
    id: "puentemae",
    name: "PuenteMAE",
    category: "educacion",
    categoryLabel: "Educación",
    tagline: "Ayuda social a docentes de inclusión",
    milestone: "1 niño-mes de apoyo a la inclusión",
    description:
      "Ayuda social con plata de la empresa. El docente cobra en pesos a su cuenta. La familia no paga. Lumina no factura obras sociales.",
    priceUsdc: 40,
    status: "wip",
    statusLabel: "En trabajo",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=300&fit=crop",
    imageAlt: "PuenteMAE — apoyo a la inclusión",
    oracleAddress: process.env.NEXT_PUBLIC_PUENTEMAE_ORACLE_ADDRESS || "",
    payoutAddress: process.env.NEXT_PUBLIC_PUENTEMAE_PAYOUT_ADDRESS || "",
    schemaId: "puentemae.nino-mes.v1",
    unitLabel: "niño-mes de apoyo a la inclusión",
    valueMethod:
      "1 trabajo = 1 niño-mes. Referencia nomenclador Res. 2775/2026 hora MAE $16.068,31 (ilustrativo, no liquidación de obra social).",
    hashIncludes: "schema, período, quantity, subject_commitment ciego, sponsor, monto",
    hashExcludes: "DNI, CUD, diagnóstico, escuela, CBU",
    postReleasePromise: "La app paga en pesos a la cuenta del docente. Lumina no ejecuta ni atestigua ese pago.",
  },
];

export function getImpactApp(id: string): ImpactApp | undefined {
  return IMPACT_APPS.find((item) => item.id === id);
}

export function getImpactAppBySchema(schemaId: string): ImpactApp | undefined {
  return IMPACT_APPS.find((item) => item.schemaId === schemaId);
}

export function listedForAssign(): ImpactApp[] {
  return IMPACT_APPS.filter((app) => app.oracleAddress.startsWith("G") && !app.paused);
}

export function cheapestHitoPrice(): number {
  const apps = listedForAssign();
  const pool = apps.length > 0 ? apps : IMPACT_APPS;
  if (pool.length === 0) return 0;
  return Math.min(...pool.map((app) => app.priceUsdc));
}
