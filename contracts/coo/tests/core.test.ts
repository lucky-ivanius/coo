import { Cl } from "@stacks/transactions";
import { describe, expect, it } from "vitest";
import { computeAssertionId } from "./fixtures/assertion";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

const sbtcToken = "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token";
const identifier = Cl.bufferFromHex("aa".repeat(32));
const claim = Cl.bufferFromHex("cc".repeat(64));

describe("Core", () => {
	const contractName = "coo-core";

	describe("protocol params", () => {
		it("get-default-liveness returns 144", () => {
			const { result } = simnet.callReadOnlyFn(
				contractName,
				"get-default-liveness",
				[],
				deployer,
			);
			expect(result).toBeUint(144);
		});

		it("get-min-bond-sats returns 10000", () => {
			const { result } = simnet.callReadOnlyFn(
				contractName,
				"get-min-bond-sats",
				[],
				deployer,
			);
			expect(result).toBeUint(10_000);
		});
	});

	describe("assert", () => {
		it("returns expected assertionId when liveness is omitted (defaults to DEFAULT_LIVENESS)", () => {
			const liveness = Cl.none();
			const expectedId = computeAssertionId(
				identifier,
				claim,
				Cl.uint(10_000),
				liveness,
			);

			const { result } = simnet.callPublicFn(
				contractName,
				"assert",
				[identifier, claim, Cl.uint(10_000), liveness],
				wallet1,
			);

			expect(result).toBeOk(expectedId);
		});

		it("returns expected assertionId when explicit liveness is provided", () => {
			const liveness = Cl.some(Cl.uint(200));
			const expectedId = computeAssertionId(
				identifier,
				claim,
				Cl.uint(10_000),
				liveness,
			);

			const { result } = simnet.callPublicFn(
				contractName,
				"assert",
				[identifier, claim, Cl.uint(10_000), liveness],
				wallet1,
			);

			expect(result).toBeOk(expectedId);
		});

		it("transfers sBTC bond from caller to contract", () => {
			const balanceBefore = simnet.callReadOnlyFn(
				sbtcToken,
				"get-balance",
				[Cl.standardPrincipal(wallet1)],
				wallet1,
			);

			simnet.callPublicFn(
				contractName,
				"assert",
				[identifier, claim, Cl.uint(10_000), Cl.none()],
				wallet1,
			);

			const balanceAfter = simnet.callReadOnlyFn(
				sbtcToken,
				"get-balance",
				[Cl.standardPrincipal(wallet1)],
				wallet1,
			);

			expect(balanceBefore.result).toBeOk(Cl.uint(1_000_000_000));
			expect(balanceAfter.result).toBeOk(Cl.uint(1_000_000_000 - 10_000));
		});

		it("rejects bond below MIN_BOND_SATS", () => {
			const { result } = simnet.callPublicFn(
				contractName,
				"assert",
				[identifier, claim, Cl.uint(9_999), Cl.none()],
				wallet1,
			);
			expect(result).toBeErr(Cl.uint(103)); // ERR_BOND_TOO_LOW
		});

		it("rejects duplicate submission — same inputs produce same assertionId", () => {
			const args = [identifier, claim, Cl.uint(10_000), Cl.none()];
			simnet.callPublicFn(contractName, "assert", args, wallet1);
			const { result } = simnet.callPublicFn(
				contractName,
				"assert",
				args,
				wallet1,
			);
			expect(result).toBeErr(Cl.uint(101)); // ERR_ALREADY_SUBMITTED
		});

		it("rejects (some u0) liveness with ERR_INVALID_LIVENESS", () => {
			const { result } = simnet.callPublicFn(
				contractName,
				"assert",
				[identifier, claim, Cl.uint(10_000), Cl.some(Cl.uint(0))],
				wallet1,
			);
			expect(result).toBeErr(Cl.uint(109)); // ERR_INVALID_LIVENESS
		});

		it("different identifier with same claim produces different assertionIds — both succeed", () => {
			const id2 = Cl.bufferFromHex("bb".repeat(32));
			const liveness = Cl.none();

			const expectedId1 = computeAssertionId(
				identifier,
				claim,
				Cl.uint(10_000),
				liveness,
			);
			const expectedId2 = computeAssertionId(
				id2,
				claim,
				Cl.uint(10_000),
				liveness,
			);
			expect(expectedId1).not.toBe(expectedId2);

			const { result: result1 } = simnet.callPublicFn(
				contractName,
				"assert",
				[identifier, claim, Cl.uint(10_000), liveness],
				wallet1,
			);
			const { result: result2 } = simnet.callPublicFn(
				contractName,
				"assert",
				[id2, claim, Cl.uint(10_000), liveness],
				wallet2,
			);

			expect(result1).toBeOk(expectedId1);
			expect(result2).toBeOk(expectedId2);
		});
	});
});
