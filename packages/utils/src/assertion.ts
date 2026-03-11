import type { BufferCV, UIntCV } from "@stacks/transactions";
import { sha256 } from "@noble/hashes/sha2.js";
import { Cl } from "@stacks/transactions";

export function computeAssertionId(identifier: BufferCV, claim: BufferCV, bondSats: UIntCV, liveness: UIntCV, assertedAtBlock: UIntCV) {
  const preimage = [identifier.value, claim.value, Cl.serialize(bondSats), Cl.serialize(liveness), Cl.serialize(assertedAtBlock)].join("");

  return Cl.buffer(sha256(Buffer.from(preimage, "hex")));
}
