import assert from "node:assert/strict";
import { pasosDeAporte } from "./recibos";
import type { Aporte } from "./types";

const aporte = {
  appName: "MIRA AI",
  paidHash: "aa".repeat(32),
  choseHash: "bb".repeat(32),
  chargedHash: "cc".repeat(32),
} as Aporte;

const pasos = pasosDeAporte(aporte);
assert.equal(pasos[0].label, "La empresa pagó");
assert.equal(pasos[1].label.includes("MIRA"), true);
assert.equal(pasos[2].label.includes("97,5%"), true);
assert.equal(pasos[0].hash, aporte.paidHash);
console.log("recibos ok");
