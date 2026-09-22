import type { Aporte, Certificado } from "./types";

export type ReciboPaso = {
  key: "paid" | "chose" | "charged";
  label: string;
  hash?: string;
};

export type ReciboVivo = {
  hash: string;
  at?: string;
  amountUsd?: number;
};

export function etiquetaVivo(vivo?: ReciboVivo): string {
  if (!vivo?.at && !vivo?.amountUsd) return "";
  const fecha = vivo.at
    ? new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" }).format(new Date(vivo.at))
    : "";
  const monto =
    typeof vivo.amountUsd === "number" && Number.isFinite(vivo.amountUsd)
      ? new Intl.NumberFormat("es-AR", { style: "currency", currency: "USD" }).format(vivo.amountUsd)
      : "";
  return [fecha, monto].filter(Boolean).join(" · ");
}

export function pasosDeAporte(aporte: Aporte, certificado?: Certificado | null): ReciboPaso[] {
  return [
    {
      key: "paid",
      label: "La empresa pagó",
      hash: aporte.paidHash || (aporte.chargedHash ? undefined : aporte.txHash),
    },
    {
      key: "chose",
      label: `La empresa eligió ${aporte.appName}`,
      hash: aporte.choseHash,
    },
    {
      key: "charged",
      label: `${aporte.appName} cobró el 97,5%`,
      hash: aporte.chargedHash || certificado?.txHash,
    },
  ];
}

export function pasosDeCertificado(certificado: Certificado, aporte?: Aporte | null): ReciboPaso[] {
  if (aporte) return pasosDeAporte(aporte, certificado);
  return [
    { key: "paid", label: "La empresa pagó" },
    { key: "chose", label: `La empresa eligió ${certificado.appName}` },
    {
      key: "charged",
      label: `${certificado.appName} cobró el 97,5%`,
      hash: certificado.txHash,
    },
  ];
}
