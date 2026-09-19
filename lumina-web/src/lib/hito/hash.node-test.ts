import assert from "node:assert/strict";
import { canonicalFact, quantityFromLock, uniquenessKeys } from "./fact";
import { hashFact, subjectCommitment } from "./hash";

const fact = {
  protocol: "lumina" as const,
  schemaId: "puentemae.nino-mes.v1",
  unitLabel: "niño-mes de apoyo a la inclusión",
  quantity: 2,
  period: "2026-09",
  subjectCommitments: [
    subjectCommitment(["a"]),
    subjectCommitment(["b"]),
  ],
  sponsorRef: "apo-test",
  amountUsd: 80,
  appId: "puentemae",
};

const first = hashFact(fact);
const second = hashFact({
  ...fact,
  subjectCommitments: [...fact.subjectCommitments].reverse(),
});
assert.equal(first.reportHash, second.reportHash);
assert.equal(first.reportHash.length, 64);
assert.equal(quantityFromLock(400, 40), 10);
assert.equal(quantityFromLock(40, 40), 1);
assert.equal(uniquenessKeys(fact).length, 2);
assert.ok(canonicalFact(fact).includes("protocol"));
console.log("hito hash ok", first.reportHash.slice(0, 12));
