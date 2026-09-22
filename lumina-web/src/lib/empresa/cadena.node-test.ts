import assert from "node:assert/strict";
import { estadoCadena } from "./cadena";
import type { Aporte } from "./types";

const base = {
  id: "apo-test",
  empresaId: "emp-test",
  amountUsd: 40,
  amountArs: 40000,
  appId: "mira",
  appName: "MIRA AI",
  referencia: "LUM-TEST",
  createdAt: new Date().toISOString(),
  lockUntil: new Date().toISOString(),
} as Aporte;

void (async () => {
  const cobrado = await estadoCadena({
    ...base,
    status: "certificado",
    chargedHash: "cc".repeat(32),
  });
  assert.equal(cobrado.estado, "cobrado");

  const asignado = await estadoCadena({
    ...base,
    status: "en_escrow",
    choseHash: "bb".repeat(32),
  });
  assert.equal(asignado.estado, "asignado");

  const reservado = await estadoCadena({
    ...base,
    status: "en_escrow",
    paidHash: "aa".repeat(32),
  });
  assert.equal(reservado.estado, "reservado");

  const vacio = await estadoCadena({ ...base, status: "orden" });
  assert.equal(vacio.estado, "en_trabajo");

  console.log("cadena ok");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
