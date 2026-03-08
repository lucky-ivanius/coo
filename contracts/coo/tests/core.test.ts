import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;

describe("COO Core Contract", () => {
	it("get-protocol-params returns correct values", () => {
		const { result } = simnet.callReadOnlyFn(
			"core",
			"get-protocol-params",
			[],
			deployer,
		);
		expect(result).toBeTuple({
			"default-liveness": Cl.uint(144),
			"min-bond-multiplier": Cl.uint(2),
			"protocol-fee-bps": Cl.uint(0),
			"contract-owner": Cl.standardPrincipal(deployer),
		});
	});

	it("get-sbtc-balance reads devnet wallet balance", () => {
		const { result } = simnet.callReadOnlyFn(
			"core",
			"get-sbtc-balance",
			[Cl.standardPrincipal(wallet1)],
			wallet1,
		);
		expect(result).toBeOk(Cl.uint(1_000_000_000));
	});
});
