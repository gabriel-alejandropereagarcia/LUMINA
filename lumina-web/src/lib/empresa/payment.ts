/** Orden de pago de demostración. No es un CBU real. No transferir pesos. */
export const DEMO_PAYMENT = {
  beneficiary: "Lumina — cobrado por Alerce Argentina SRL",
  license: "PSAV CNV N°24 · cobrador de un servicio, no exchange de la empresa",
  alias: "lumina.rse.demo",
  cbu: "0000000000000000000000",
  bankLabel: "Cuenta del PSAV socio (simulación ABC)",
  fxNote: "1 USD = 1.400 ARS · tipo de cambio ilustrativo, no es una cotización live",
  usdToArs: 1400,
  legalNote:
    "Pagás un servicio de RSE a Lumina. No comprás cripto. El PSAV cobra para nosotros; tesorería Lumina deposita USDC propio.",
} as const;

export function arsFromUsd(amountUsd: number): number {
  return Math.round(amountUsd * DEMO_PAYMENT.usdToArs);
}

export function formatArs(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}
