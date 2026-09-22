import assert from "node:assert/strict";
import { leerRecibo } from "./horizon-recibo";

const hash = "9fdbc2e8865a0a94339884d6345eb628c2d6ee16792ab5ebfe5f0a946765812f";

leerRecibo(hash)
  .then((vivo) => {
    assert.equal(vivo.hash, hash);
    assert.ok(vivo.at, "el pago del 19/9 tiene que tener fecha");
    console.log("horizon ok", vivo.at, vivo.amountUsd ?? "sin monto");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
