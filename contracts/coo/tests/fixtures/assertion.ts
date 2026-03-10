import { sha256 } from "@noble/hashes/sha2.js";
import {
	BufferCV,
	Cl,
	ClarityType,
	OptionalCV,
	UIntCV,
} from "@stacks/transactions";

export const DEFAULT_LIVENESS = Cl.uint(1440);

export function computeAssertionId(
	identifierCv: BufferCV,
	claimCv: BufferCV,
	bondSats: UIntCV,
	liveness: OptionalCV<UIntCV>,
) {
	const resolvedLiveness =
		liveness.type === ClarityType.OptionalNone
			? DEFAULT_LIVENESS
			: liveness.value;

	const preimage = [
		identifierCv.value,
		claimCv.value,
		Cl.serialize(bondSats),
		Cl.serialize(resolvedLiveness),
	].join("");

	return Cl.buffer(sha256(Buffer.from(preimage, "hex")));
}
