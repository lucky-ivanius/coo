import type { BufferCV, OptionalCV, UIntCV } from "@stacks/transactions";
import { sha256 } from "@noble/hashes/sha2.js";
import { Cl, ClarityType } from "@stacks/transactions";

export const DEFAULT_LIVENESS = Cl.uint(1440);

// Error codes
export const ERR_ASSERTION_ALREADY_EXISTS = Cl.uint(409100);
export const ERR_ASSERTION_BOND_TOO_LOW = Cl.uint(400103);
export const ERR_ASSERTION_INVALID_LIVENESS = Cl.uint(400104);
export const ERR_WINDOW_OPEN = Cl.uint(400001);
export const ERR_WINDOW_CLOSED = Cl.uint(400002);
export const ERR_INVALID_STATUS = Cl.uint(400003);
export const ERR_TRANSFER_FAILED = Cl.uint(400004);
export const ERR_UNAUTHORIZED = Cl.uint(401001);
export const ERR_ASSERTION_NOT_FOUND = Cl.uint(404101);
export const ERR_SERIALIZATION_FAILED = Cl.uint(500001);

export function computeAssertionId(identifierCv: BufferCV, claimCv: BufferCV, bondSats: UIntCV, liveness: OptionalCV<UIntCV>, assertedAtBlock: UIntCV) {
  const resolvedLiveness = liveness.type === ClarityType.OptionalNone ? DEFAULT_LIVENESS : liveness.value;

  const preimage = [identifierCv.value, claimCv.value, Cl.serialize(bondSats), Cl.serialize(resolvedLiveness), Cl.serialize(assertedAtBlock)].join("");

  return Cl.buffer(sha256(Buffer.from(preimage, "hex")));
}
