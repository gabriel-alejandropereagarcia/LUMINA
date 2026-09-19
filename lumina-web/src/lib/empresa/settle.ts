import { creditAporte, patchAporte } from "./store";
import { maybeTreasuryDeposit } from "./treasury";
import type { Aporte } from "./types";

/** Acredita el fiat y, si está habilitado, deposita on-chain con tesorería Lumina. */
export async function settleFiatAporte(
  id: string,
  empresaId: string,
): Promise<{ aporte: Aporte; chain: Awaited<ReturnType<typeof maybeTreasuryDeposit>> }> {
  let aporte = await creditAporte(id, empresaId);
  const chain = await maybeTreasuryDeposit(aporte);
  if (chain.hash || chain.error) {
    aporte = await patchAporte(id, {
      txHash: chain.hash,
      treasuryError: chain.error,
    });
  }
  return { aporte, chain };
}
