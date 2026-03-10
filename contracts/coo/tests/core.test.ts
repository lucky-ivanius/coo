import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

const sbtcToken = "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token";
const statementId = Cl.bufferFromHex("aa".repeat(32));
const claimHash = Cl.bufferFromHex("bb".repeat(32));

describe("Core", () => {
	const contractName = "coo-core";

	describe("protocol params", () => {
		it("get-default-liveness returns correct value", () => {
			const { result } = simnet.callReadOnlyFn(
				contractName,
				"get-default-liveness",
				[],
				deployer,
			);
			expect(result).toBeUint(144);
		});

		it("get-min-bond-multiplier returns correct value", () => {
			const { result } = simnet.callReadOnlyFn(
				contractName,
				"get-min-bond-multiplier",
				[],
				deployer,
			);
			expect(result).toBeUint(2);
		});

		it("get-protocol-fee-bps returns correct value", () => {
			const { result } = simnet.callReadOnlyFn(
				contractName,
				"get-protocol-fee-bps",
				[],
				deployer,
			);
			expect(result).toBeUint(0);
		});
	});

	describe("request", () => {
		it("creates a request and stores it in request-map", () => {
			const { result } = simnet.callPublicFn(
				contractName,
				"request",
				[statementId, Cl.uint(10_000), Cl.uint(144)],
				wallet1,
			);
			expect(result).toBeOk(Cl.bool(true));
			const requestBlock = simnet.blockHeight;

			const entry = simnet.callReadOnlyFn(
				contractName,
				"get-request",
				[statementId],
				deployer,
			);
			expect(entry.result).toBeSome(
				Cl.tuple({
					requester: Cl.standardPrincipal(wallet1),
					"reward-sats": Cl.uint(10_000),
					liveness: Cl.uint(144),
					status: Cl.uint(1),
					"created-at-block": Cl.uint(requestBlock),
				}),
			);
		});

		it("transfers sBTC reward from requester to contract", () => {
			const balanceBefore = simnet.callReadOnlyFn(
				sbtcToken,
				"get-balance",
				[Cl.standardPrincipal(wallet1)],
				wallet1,
			);

			simnet.callPublicFn(
				contractName,
				"request",
				[statementId, Cl.uint(10_000), Cl.uint(144)],
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

		it("rejects request with reward = 0", () => {
			const { result } = simnet.callPublicFn(
				contractName,
				"request",
				[statementId, Cl.uint(0), Cl.uint(144)],
				wallet1,
			);
			expect(result).toBeErr(Cl.uint(109));
		});

		it("rejects request with liveness = 0", () => {
			const { result } = simnet.callPublicFn(
				contractName,
				"request",
				[statementId, Cl.uint(10_000), Cl.uint(0)],
				wallet1,
			);
			expect(result).toBeErr(Cl.uint(111));
		});

		it("rejects duplicate statementId", () => {
			simnet.callPublicFn(
				contractName,
				"request",
				[statementId, Cl.uint(10_000), Cl.uint(144)],
				wallet1,
			);

			const { result } = simnet.callPublicFn(
				contractName,
				"request",
				[statementId, Cl.uint(10_000), Cl.uint(144)],
				wallet2,
			);
			expect(result).toBeErr(Cl.uint(110));
		});
	});

	describe("assert", () => {
		it("creates an assertion for an existing request", () => {
			simnet.callPublicFn(
				contractName,
				"request",
				[statementId, Cl.uint(10_000), Cl.uint(144)],
				wallet1,
			);

			const { result } = simnet.callPublicFn(
				contractName,
				"assert",
				[statementId, claimHash, Cl.uint(20_000)],
				wallet2,
			);
			expect(result).toBeOk(Cl.bool(true));
			const assertBlock = simnet.blockHeight;

			const assertion = simnet.callReadOnlyFn(
				contractName,
				"get-assertion",
				[statementId],
				deployer,
			);
			expect(assertion.result).toBeSome(
				Cl.tuple({
					asserter: Cl.standardPrincipal(wallet2),
					"claim-hash": claimHash,
					"bond-sats": Cl.uint(20_000),
					"asserted-at-block": Cl.uint(assertBlock),
				}),
			);
		});

		it("updates request status to ASSERTED", () => {
			simnet.callPublicFn(
				contractName,
				"request",
				[statementId, Cl.uint(10_000), Cl.uint(144)],
				wallet1,
			);
			const requestBlock = simnet.blockHeight;

			simnet.callPublicFn(
				contractName,
				"assert",
				[statementId, claimHash, Cl.uint(20_000)],
				wallet2,
			);

			const entry = simnet.callReadOnlyFn(
				contractName,
				"get-request",
				[statementId],
				deployer,
			);
			expect(entry.result).toBeSome(
				Cl.tuple({
					requester: Cl.standardPrincipal(wallet1),
					"reward-sats": Cl.uint(10_000),
					liveness: Cl.uint(144),
					status: Cl.uint(2),
					"created-at-block": Cl.uint(requestBlock),
				}),
			);
		});

		it("transfers sBTC bond from asserter to contract", () => {
			simnet.callPublicFn(
				contractName,
				"request",
				[statementId, Cl.uint(10_000), Cl.uint(144)],
				wallet1,
			);

			const balanceBefore = simnet.callReadOnlyFn(
				sbtcToken,
				"get-balance",
				[Cl.standardPrincipal(wallet2)],
				wallet2,
			);

			simnet.callPublicFn(
				contractName,
				"assert",
				[statementId, claimHash, Cl.uint(20_000)],
				wallet2,
			);

			const balanceAfter = simnet.callReadOnlyFn(
				sbtcToken,
				"get-balance",
				[Cl.standardPrincipal(wallet2)],
				wallet2,
			);

			expect(balanceBefore.result).toBeOk(Cl.uint(1_000_000_000));
			expect(balanceAfter.result).toBeOk(Cl.uint(1_000_000_000 - 20_000));
		});

		it("rejects assertion on non-existent request", () => {
			const { result } = simnet.callPublicFn(
				contractName,
				"assert",
				[statementId, claimHash, Cl.uint(20_000)],
				wallet2,
			);
			expect(result).toBeErr(Cl.uint(100));
		});

		it("rejects bond below minimum (2x reward)", () => {
			simnet.callPublicFn(
				contractName,
				"request",
				[statementId, Cl.uint(10_000), Cl.uint(144)],
				wallet1,
			);

			const { result } = simnet.callPublicFn(
				contractName,
				"assert",
				[statementId, claimHash, Cl.uint(19_999)],
				wallet2,
			);
			expect(result).toBeErr(Cl.uint(103));
		});

		it("rejects double assertion on same request", () => {
			simnet.callPublicFn(
				contractName,
				"request",
				[statementId, Cl.uint(10_000), Cl.uint(144)],
				wallet1,
			);

			simnet.callPublicFn(
				contractName,
				"assert",
				[statementId, claimHash, Cl.uint(20_000)],
				wallet2,
			);

			const { result } = simnet.callPublicFn(
				contractName,
				"assert",
				[statementId, claimHash, Cl.uint(20_000)],
				wallet2,
			);
			expect(result).toBeErr(Cl.uint(101));
		});
	});

	describe("is-liveness-expired", () => {
		it("returns false when liveness window is still open", () => {
			simnet.callPublicFn(
				contractName,
				"request",
				[statementId, Cl.uint(10_000), Cl.uint(144)],
				wallet1,
			);
			simnet.callPublicFn(
				contractName,
				"assert",
				[statementId, claimHash, Cl.uint(20_000)],
				wallet2,
			);

			const { result } = simnet.callReadOnlyFn(
				contractName,
				"is-liveness-expired",
				[statementId],
				deployer,
			);
			expect(result).toBeOk(Cl.bool(false));
		});

		it("returns true after liveness window expires", () => {
			simnet.callPublicFn(
				contractName,
				"request",
				[statementId, Cl.uint(10_000), Cl.uint(10)],
				wallet1,
			);
			simnet.callPublicFn(
				contractName,
				"assert",
				[statementId, claimHash, Cl.uint(20_000)],
				wallet2,
			);

			simnet.mineEmptyBlocks(11);

			const { result } = simnet.callReadOnlyFn(
				contractName,
				"is-liveness-expired",
				[statementId],
				deployer,
			);
			expect(result).toBeOk(Cl.bool(true));
		});

		it("returns error for non-existent statement", () => {
			const { result } = simnet.callReadOnlyFn(
				contractName,
				"is-liveness-expired",
				[statementId],
				deployer,
			);
			expect(result).toBeErr(Cl.uint(100));
		});
	});

	describe("happy path: request → assert", () => {
		it("full flow works end-to-end", () => {
			// Step 1: Request
			const requestResult = simnet.callPublicFn(
				contractName,
				"request",
				[statementId, Cl.uint(50_000), Cl.uint(144)],
				wallet1,
			);
			expect(requestResult.result).toBeOk(Cl.bool(true));

			// Step 2: Assert
			const assertResult = simnet.callPublicFn(
				contractName,
				"assert",
				[statementId, claimHash, Cl.uint(100_000)],
				wallet2,
			);
			expect(assertResult.result).toBeOk(Cl.bool(true));

			// Verify contract holds both reward + bond
			const contractBalance = simnet.callReadOnlyFn(
				sbtcToken,
				"get-balance",
				[Cl.contractPrincipal(deployer, contractName)],
				deployer,
			);
			expect(contractBalance.result).toBeOk(Cl.uint(150_000));

			// Verify liveness not yet expired
			const liveness = simnet.callReadOnlyFn(
				contractName,
				"is-liveness-expired",
				[statementId],
				deployer,
			);
			expect(liveness.result).toBeOk(Cl.bool(false));
		});
	});
});
