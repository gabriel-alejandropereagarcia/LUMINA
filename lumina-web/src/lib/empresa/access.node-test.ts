import assert from "node:assert/strict";
import { hashAccessSecret, newAccessSecret } from "./access";
import { isValidCuit } from "./cuit";
import { isCorporateEmail } from "./mail";
import { persistReady } from "./pg";

const secret = newAccessSecret();
assert.equal(secret.length, 64);
assert.equal(hashAccessSecret(secret).length, 64);
assert.notEqual(hashAccessSecret(secret), secret);
assert.equal(isCorporateEmail("rse@arli.com.ar"), true);
assert.equal(isCorporateEmail("rse@gmail.com"), false);
assert.equal(isValidCuit("30-70967853-8"), true);
assert.equal(persistReady(), Boolean(process.env.DATABASE_URL));
console.log("access ok");
