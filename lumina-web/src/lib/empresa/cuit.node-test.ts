import assert from "node:assert/strict";
import { checkDigitCuit, digitsCuit, formatCuit, isValidCuit } from "./cuit";

const body = "3070967853";
const digit = checkDigitCuit(body);
assert.equal(typeof digit, "number");
const valid = `${body}${digit}`;
assert.equal(isValidCuit(valid), true);
assert.equal(isValidCuit(formatCuit(valid)), true);
assert.equal(digitsCuit("30-70967853-x").length, 10);
assert.equal(isValidCuit("20123456789"), false);
assert.equal(isValidCuit("30709678530"), isValidCuit("30709678530"));
assert.equal(isValidCuit(`${body}${(digit! + 1) % 10}`), false);
console.log("cuit ok", formatCuit(valid));
