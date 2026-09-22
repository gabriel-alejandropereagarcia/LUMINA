import { getEscrowBalance } from "@/lib/stellar";
import type { Aporte } from "./types";

export type CadenaEstado = "en_trabajo" | "reservado" | "asignado" | "cobrado";

export type CadenaVista = {
  estado: CadenaEstado;
  label: string;
  reservadoUsd?: number;
};

export async function estadoCadena(aporte: Aporte): Promise<CadenaVista> {
  if (aporte.chargedHash || aporte.status === "certificado") {
    return { estado: "cobrado", label: "La app cobró el 97,5%" };
  }
  if (aporte.status === "recuperado") {
    return { estado: "en_trabajo", label: "Dinero devuelto" };
  }

  let reservadoUsd: number | undefined;
  if (aporte.sponsorAddress?.startsWith("G")) {
    try {
      reservadoUsd = await getEscrowBalance(aporte.sponsorAddress);
    } catch {
      reservadoUsd = undefined;
    }
  }

  if (aporte.choseHash || (aporte.oracleAddress && (aporte.paidHash || aporte.txHash))) {
    return {
      estado: "asignado",
      label: `Reservado para ${aporte.appName}`,
      reservadoUsd,
    };
  }

  if (aporte.paidHash || aporte.sponsorAddress || aporte.status === "en_escrow") {
    return {
      estado: "reservado",
      label: "Dinero reservado",
      reservadoUsd,
    };
  }

  return { estado: "en_trabajo", label: "En trabajo" };
}
