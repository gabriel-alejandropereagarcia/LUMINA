import assert from "node:assert/strict";
import {
  EMPRESA_ANONIMA,
  etiquetaEmpresa,
  grafoHoy,
  grafoHorizonte,
  iluminadosDe,
  lucesPublicas,
  reciboDeSeleccion,
} from "./camino";

const luces = lucesPublicas();
assert.equal(luces.length, 1);
assert.equal(luces[0].quantity, 1);
assert.equal(luces[0].companyPublic, false);
assert.equal(etiquetaEmpresa(luces[0]), "Empresa anónima");
assert.equal("dni" in luces[0], false);
assert.equal("nombre" in luces[0], false);
assert.ok(luces[0].chargedHash);
assert.equal(luces[0].paidHash?.length, 64);

const hoy = grafoHoy();
assert.equal(hoy.nodos.length, 5);
const cribadoHoy = iluminadosDe("e2e-19-9", hoy);
assert.ok(cribadoHoy.has("emp-hoy"));
assert.ok(cribadoHoy.has("lumina"));
assert.ok(cribadoHoy.has("mira"));
assert.equal(cribadoHoy.has("puente"), false);
assert.ok(reciboDeSeleccion("e2e-19-9", hoy)?.paidHash);
assert.ok(reciboDeSeleccion("emp-hoy", hoy)?.chargedHash);
assert.equal(reciboDeSeleccion("puente", hoy), null);

const horizonte = grafoHorizonte();
const empresas = horizonte.nodos.filter((item) => item.kind === "empresa");
const appsHz = horizonte.nodos.filter((item) => item.kind === "app");
const lucesHz = horizonte.nodos.filter((item) => item.kind === "trabajo");
assert.ok(empresas.length >= 30);
assert.ok(appsHz.length >= 8);
assert.ok(lucesHz.length >= 200);
assert.ok(horizonte.nodos.length > 240);
assert.ok(appsHz.some((item) => item.id === "mira"));
assert.ok(appsHz.some((item) => item.id === "aula"));
assert.equal(
  horizonte.nodos.some((item) => Boolean(item.paidHash) || Boolean(item.chargedHash)),
  false,
);
const unaLuz = iluminadosDe("cribado-0", horizonte);
assert.ok(unaLuz.has("lumina"));
assert.ok(unaLuz.has("mira"));
assert.ok(unaLuz.has("emp-0"));
assert.ok(unaLuz.size < 10);
assert.equal(reciboDeSeleccion("cribado-0", horizonte), null);
const unaEmpresa = iluminadosDe("emp-0", horizonte);
assert.ok([...unaEmpresa].some((id) => horizonte.nodos.find((item) => item.id === id)?.kind === "trabajo"));
assert.ok([...unaEmpresa].some((id) => horizonte.nodos.find((item) => item.id === id)?.kind === "app"));
assert.equal(etiquetaEmpresa(luces[0]), EMPRESA_ANONIMA);
console.log(
  "camino ok",
  luces[0].unitLabel,
  "horizonte",
  horizonte.nodos.length,
  "empresas",
  empresas.length,
  "apps",
  appsHz.length,
  "luces",
  lucesHz.length,
);
