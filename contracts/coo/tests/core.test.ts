import { tx } from "@stacks/clarinet-sdk";
import { Cl } from "@stacks/transactions";
import { describe, expect, it } from "vitest";

import {
  computeAssertionId,
  ERR_ASSERTION_ALREADY_EXISTS,
  ERR_ASSERTION_BOND_TOO_LOW,
  ERR_ASSERTION_INVALID_LIVENESS,
  ERR_ASSERTION_NOT_FOUND,
  ERR_INVALID_STATUS,
  ERR_WINDOW_CLOSED,
  ERR_WINDOW_OPEN,
  STATUS_DISPUTED,
  STATUS_SETTLED,
} from "./fixtures/assertion";

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
    it("get-default-liveness returns 1440", () => {
      const { result } = simnet.callReadOnlyFn(contractName, "get-default-liveness", [], deployer);
      expect(result).toBeUint(1440);
    });

    it("get-min-bond-sats returns 10000", () => {
      const { result } = simnet.callReadOnlyFn(contractName, "get-min-bond-sats", [], deployer);
      expect(result).toBeUint(10_000);
    });
  });

  describe("assert", () => {
    it("stores assertion and transfers sBTC bond when liveness is omitted (defaults to DEFAULT_LIVENESS)", () => {
      const liveness = Cl.none();
      const expectedId = computeAssertionId(identifier, claim, Cl.uint(10_000), liveness, Cl.uint(simnet.blockHeight + 1));
      const balanceBefore = simnet.callReadOnlyFn(sbtcToken, "get-balance", [Cl.standardPrincipal(wallet1)], wallet1);

      const { result } = simnet.callPublicFn(contractName, "assert", [identifier, claim, Cl.uint(10_000), liveness], wallet1);

      const balanceAfter = simnet.callReadOnlyFn(sbtcToken, "get-balance", [Cl.standardPrincipal(wallet1)], wallet1);
      expect(result).toBeOk(expectedId);
      expect(balanceBefore.result).toBeOk(Cl.uint(1_000_000_000));
      expect(balanceAfter.result).toBeOk(Cl.uint(1_000_000_000 - 10_000));
    });

    it("returns expected assertionId when explicit liveness is provided", () => {
      const liveness = Cl.some(Cl.uint(200));
      const expectedId = computeAssertionId(identifier, claim, Cl.uint(10_000), liveness, Cl.uint(simnet.blockHeight + 1));

      const { result } = simnet.callPublicFn(contractName, "assert", [identifier, claim, Cl.uint(10_000), liveness], wallet1);

      expect(result).toBeOk(expectedId);
    });

    it("rejects bond below MIN_BOND_SATS", () => {
      const { result } = simnet.callPublicFn(contractName, "assert", [identifier, claim, Cl.uint(9_999), Cl.none()], wallet1);
      expect(result).toBeErr(ERR_ASSERTION_BOND_TOO_LOW);
    });

    it("rejects duplicate submission — same inputs produce same assertionId", () => {
      const args = [identifier, claim, Cl.uint(10_000), Cl.none()];

      const [first, second] = simnet.mineBlock([
        tx.callPublicFn(contractName, "assert", args, wallet1),
        tx.callPublicFn(contractName, "assert", args, wallet1),
      ]);

      expect(first.result).toBeOk(expect.anything());
      expect(second.result).toBeErr(ERR_ASSERTION_ALREADY_EXISTS);
    });

    it("rejects (some u0) liveness with ERR_ASSERTION_INVALID_LIVENESS", () => {
      const { result } = simnet.callPublicFn(contractName, "assert", [identifier, claim, Cl.uint(10_000), Cl.some(Cl.uint(0))], wallet1);
      expect(result).toBeErr(ERR_ASSERTION_INVALID_LIVENESS);
    });

    it("different identifier with same claim produces different assertionIds — both succeed", () => {
      const id2 = Cl.bufferFromHex("bb".repeat(32));
      const liveness = Cl.none();

      const expectedId1 = computeAssertionId(identifier, claim, Cl.uint(10_000), liveness, Cl.uint(simnet.blockHeight + 1));

      const { result: result1 } = simnet.callPublicFn(contractName, "assert", [identifier, claim, Cl.uint(10_000), liveness], wallet1);

      const expectedId2 = computeAssertionId(id2, claim, Cl.uint(10_000), liveness, Cl.uint(simnet.blockHeight + 1));

      const { result: result2 } = simnet.callPublicFn(contractName, "assert", [id2, claim, Cl.uint(10_000), liveness], wallet2);

      expect(expectedId1).not.toEqual(expectedId2);
      expect(result1).toBeOk(expectedId1);
      expect(result2).toBeOk(expectedId2);
    });
  });

  describe("settle", () => {
    it("settles assertion, updates status to SETTLED (u3), and returns bond to asserter", () => {
      const liveness = Cl.some(Cl.uint(1));
      const assertionId = computeAssertionId(identifier, claim, Cl.uint(10_000), liveness, Cl.uint(simnet.blockHeight + 1));
      simnet.callPublicFn(contractName, "assert", [identifier, claim, Cl.uint(10_000), liveness], wallet1);
      const balanceBefore = simnet.callReadOnlyFn(sbtcToken, "get-balance", [Cl.standardPrincipal(wallet1)], wallet1);
      simnet.mineEmptyBlocks(2);

      const { result } = simnet.callPublicFn(contractName, "settle", [assertionId], deployer);

      const balanceAfter = simnet.callReadOnlyFn(sbtcToken, "get-balance", [Cl.standardPrincipal(wallet1)], wallet1);
      const assertion = simnet.callReadOnlyFn(contractName, "get-assertion", [assertionId], deployer);
      expect(result).toBeOk(Cl.bool(true));
      expect(balanceBefore.result).toBeOk(Cl.uint(1_000_000_000 - 10_000));
      expect(balanceAfter.result).toBeOk(Cl.uint(1_000_000_000));
      expect(assertion.result).toBeSome(
        expect.objectContaining({
          value: expect.objectContaining({ status: STATUS_SETTLED }),
        })
      );
    });

    it("rejects with ERR_ASSERTION_NOT_FOUND for unknown assertionId", () => {
      const unknownId = Cl.bufferFromHex("ff".repeat(32));
      const { result } = simnet.callPublicFn(contractName, "settle", [unknownId], deployer);
      expect(result).toBeErr(ERR_ASSERTION_NOT_FOUND);
    });

    it("rejects with ERR_WINDOW_OPEN when liveness window has not yet closed", () => {
      const liveness = Cl.none();
      const assertionId = computeAssertionId(identifier, claim, Cl.uint(10_000), liveness, Cl.uint(simnet.blockHeight + 1));
      simnet.callPublicFn(contractName, "assert", [identifier, claim, Cl.uint(10_000), liveness], wallet1);

      const { result } = simnet.callPublicFn(contractName, "settle", [assertionId], deployer);
      expect(result).toBeErr(ERR_WINDOW_OPEN);
    });

    it("rejects with ERR_INVALID_STATUS when already settled", () => {
      const liveness = Cl.some(Cl.uint(1));
      const assertionId = computeAssertionId(identifier, claim, Cl.uint(10_000), liveness, Cl.uint(simnet.blockHeight + 1));
      simnet.callPublicFn(contractName, "assert", [identifier, claim, Cl.uint(10_000), liveness], wallet1);
      simnet.mineEmptyBlocks(2);
      simnet.callPublicFn(contractName, "settle", [assertionId], deployer);

      const { result } = simnet.callPublicFn(contractName, "settle", [assertionId], deployer);
      expect(result).toBeErr(ERR_INVALID_STATUS);
    });

    it("rejects with ERR_INVALID_STATUS when assertion is disputed", () => {
      const liveness = Cl.some(Cl.uint(1));
      const assertionId = computeAssertionId(identifier, claim, Cl.uint(10_000), liveness, Cl.uint(simnet.blockHeight + 1));
      simnet.callPublicFn(contractName, "assert", [identifier, claim, Cl.uint(10_000), liveness], wallet1);
      simnet.callPublicFn(contractName, "dispute", [assertionId], wallet2);
      simnet.mineEmptyBlocks(2);

      const { result } = simnet.callPublicFn(contractName, "settle", [assertionId], deployer);
      expect(result).toBeErr(ERR_INVALID_STATUS);
    });
  });

  describe("dispute", () => {
    it("disputes assertion, updates status to DISPUTED (u2), records disputer, and transfers bond to contract", () => {
      const liveness = Cl.some(Cl.uint(1));
      const assertionId = computeAssertionId(identifier, claim, Cl.uint(10_000), liveness, Cl.uint(simnet.blockHeight + 1));
      simnet.callPublicFn(contractName, "assert", [identifier, claim, Cl.uint(10_000), liveness], wallet1);
      const balanceBefore = simnet.callReadOnlyFn(sbtcToken, "get-balance", [Cl.standardPrincipal(wallet2)], wallet2);

      const { result } = simnet.callPublicFn(contractName, "dispute", [assertionId], wallet2);

      const balanceAfter = simnet.callReadOnlyFn(sbtcToken, "get-balance", [Cl.standardPrincipal(wallet2)], wallet2);
      const assertion = simnet.callReadOnlyFn(contractName, "get-assertion", [assertionId], deployer);
      expect(result).toBeOk(Cl.bool(true));
      expect(balanceBefore.result).toBeOk(Cl.uint(1_000_000_000));
      expect(balanceAfter.result).toBeOk(Cl.uint(1_000_000_000 - 10_000));
      expect(assertion.result).toBeSome(
        expect.objectContaining({
          value: expect.objectContaining({
            status: STATUS_DISPUTED,
            disputer: Cl.some(Cl.standardPrincipal(wallet2)),
          }),
        })
      );
    });

    it("rejects with ERR_ASSERTION_NOT_FOUND for unknown assertionId", () => {
      const unknownId = Cl.bufferFromHex("ff".repeat(32));
      const { result } = simnet.callPublicFn(contractName, "dispute", [unknownId], wallet2);
      expect(result).toBeErr(ERR_ASSERTION_NOT_FOUND);
    });

    it("rejects with ERR_WINDOW_CLOSED after liveness window has elapsed", () => {
      const liveness = Cl.some(Cl.uint(1));
      const assertionId = computeAssertionId(identifier, claim, Cl.uint(10_000), liveness, Cl.uint(simnet.blockHeight + 1));
      simnet.callPublicFn(contractName, "assert", [identifier, claim, Cl.uint(10_000), liveness], wallet1);
      simnet.mineEmptyBlocks(2);

      const { result } = simnet.callPublicFn(contractName, "dispute", [assertionId], wallet2);
      expect(result).toBeErr(ERR_WINDOW_CLOSED);
    });

    it("rejects with ERR_INVALID_STATUS when assertion is already disputed", () => {
      const liveness = Cl.some(Cl.uint(1));
      const assertionId = computeAssertionId(identifier, claim, Cl.uint(10_000), liveness, Cl.uint(simnet.blockHeight + 1));
      simnet.callPublicFn(contractName, "assert", [identifier, claim, Cl.uint(10_000), liveness], wallet1);
      simnet.callPublicFn(contractName, "dispute", [assertionId], wallet2);

      const { result } = simnet.callPublicFn(contractName, "dispute", [assertionId], wallet2);
      expect(result).toBeErr(ERR_INVALID_STATUS);
    });
  });
});
