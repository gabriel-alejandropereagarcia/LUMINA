import { persistReady } from "./pg";

export type LuminaOps = {
  treasuryReady: boolean;
  oracleReady: boolean;
  koyweReady: boolean;
  mailReady: boolean;
  persistReady: boolean;
};

export function luminaOps(): LuminaOps {
  return {
    treasuryReady: Boolean(process.env.TREASURY_SECRET || process.env.SPONSOR_SECRET),
    oracleReady: Boolean(process.env.ORACLE_SECRET),
    koyweReady: Boolean(
      process.env.KOYWE_API_KEY &&
        process.env.KOYWE_SECRET &&
        process.env.KOYWE_ORG_ID &&
        process.env.KOYWE_MERCHANT_ID,
    ),
    mailReady: Boolean(process.env.RESEND_API_KEY),
    persistReady: persistReady(),
  };
}
