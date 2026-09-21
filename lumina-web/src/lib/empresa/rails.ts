/**
 * Marco legal del riel fiat.
 *
 * La empresa NUNCA es clienta de un exchange. Paga un servicio de RSE
 * (factura / PAYIN). Quien convierte cripto es un PSAV inscripto o Circle
 * (sociedad afuera). Lumina deposita USDC propio.
 *
 * CosmosPay-Wallet y BlindPay como onramp-a-la-empresa quedan fuera:
 * volverían a ponerle cripto en el balance a tesorería.
 */
export type FiatRailId =
  | "simulation"
  | "koywe-payin"
  | "circle-mint"
  | "koywe-hop"
  | "blindpay-stellar";

export type FiatRail = {
  id: FiatRailId;
  label: string;
  live: boolean;
  settlesOnStellar: boolean;
  companySeesWallet: boolean;
  legalRank: number;
  notes: string;
};

export function isKoywePayinConfigured(): boolean {
  return Boolean(
    process.env.KOYWE_API_KEY &&
      process.env.KOYWE_SECRET &&
      process.env.KOYWE_ORG_ID &&
      process.env.KOYWE_MERCHANT_ID,
  );
}

export function isCircleMintConfigured(): boolean {
  return Boolean(process.env.CIRCLE_API_KEY || process.env.CIRCLE_MINT_API_KEY);
}

export function isTreasuryDepositEnabled(): boolean {
  return (
    process.env.TREASURY_DEPOSIT_ENABLED === "true" &&
    Boolean(process.env.TREASURY_SECRET || process.env.SPONSOR_SECRET)
  );
}

export function detectFiatRail(): FiatRail {
  if (isKoywePayinConfigured()) {
    return {
      id: "koywe-payin",
      label: "Cobro en pesos (Koywe)",
      live: true,
      settlesOnStellar: false,
      companySeesWallet: false,
      legalRank: 1,
      notes: "La empresa paga pesos a Lumina. No compra cripto. El cobrador recibe por nosotros.",
    };
  }
  if (isCircleMintConfigured()) {
    return {
      id: "circle-mint",
      label: "Circle Mint (casa matriz)",
      live: true,
      settlesOnStellar: true,
      companySeesWallet: false,
      legalRank: 1,
      notes: "Wire USD de la HQ. La SA argentina no toca cripto.",
    };
  }
  if (process.env.BLINDPAY_API_KEY && process.env.BLINDPAY_INSTANCE_ID) {
    return {
      id: "blindpay-stellar",
      label: "BlindPay (Stellar nativo, dictamen pendiente)",
      live: true,
      settlesOnStellar: true,
      companySeesWallet: false,
      legalRank: 3,
      notes: "Técnicamente el hop más corto. No vender a compliance minero sin razón social PSAV.",
    };
  }
  if (process.env.NEXT_PUBLIC_KOYWE_CLIENT_ID) {
    return {
      id: "koywe-hop",
      label: "Koywe widget (onramp, no usar con empresas)",
      live: false,
      settlesOnStellar: false,
      companySeesWallet: true,
      legalRank: 9,
      notes: "Eso pide Freighter. Quedó en /invest, no en /empresa.",
    };
  }
  return {
    id: "simulation",
    label: "Cobro ARS · en trabajo",
    live: false,
    settlesOnStellar: false,
    companySeesWallet: false,
    legalRank: 0,
      notes: "Orden de ejemplo. No transferir pesos. Cobro ARS: en trabajo.",
  };
}
