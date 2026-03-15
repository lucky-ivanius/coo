import { tx } from "@stacks/clarinet-sdk";
import { Cl } from "@stacks/transactions";
import { describe, expect, it } from "vitest";

import {
  computeAssertionId,
  ERR_ARBITER_ALREADY_EXISTS,
  ERR_ARBITER_NOT_FOUND,
  ERR_ASSERTION_ALREADY_EXISTS,
  ERR_ASSERTION_BOND_TOO_LOW,
  ERR_ASSERTION_INVALID_LIVENESS,
  ERR_ASSERTION_NOT_FOUND,
  ERR_INVALID_STATUS,
  ERR_NOT_ARBITER,
  ERR_NOT_CONTRACT_OWNER,
  ERR_WINDOW_CLOSED,
  ERR_WINDOW_OPEN,
  STATUS_DISPUTED,
  STATUS_REJECTED,
  STATUS_SETTLED,
  STATUS_UNRESOLVED,
} from "@coo/utils";

import { resolveLiveness } from "./fixtures/assertion";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const wallet3 = accounts.get("wallet_3")!;

const sbtcToken = "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token";
const identifier = Cl.bufferFromHex("aa".repeat(32));
const claim = Cl.bufferFromHex("cc".repeat(64));

/** Sets up a disputed assertion and returns its ID. wallet1=asserter, wallet2=disputer. */
function setupDisputedAssertion(bond = 10_000) {
  const liveness = Cl.some(Cl.uint(1));
  const assertionId = computeAssertionId(identifier, claim, Cl.uint(bond), resolveLiveness(liveness), Cl.uint(simnet.blockHeight + 1));
  simnet.callPublicFn(contractName, "assert", [identifier, claim, Cl.uint(bond), liveness], wallet1);
  simnet.callPublicFn(contractName, "dispute", [assertionId], wallet2);
  return assertionId;
}

const contractName = "coo-core";

describe("Core", () => {
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
      const expectedId = computeAssertionId(identifier, claim, Cl.uint(10_000), resolveLiveness(liveness), Cl.uint(simnet.blockHeight + 1));
      const balanceBefore = simnet.callReadOnlyFn(sbtcToken, "get-balance", [Cl.standardPrincipal(wallet1)], wallet1);

      const { result } = simnet.callPublicFn(contractName, "assert", [identifier, claim, Cl.uint(10_000), liveness], wallet1);

      const balanceAfter = simnet.callReadOnlyFn(sbtcToken, "get-balance", [Cl.standardPrincipal(wallet1)], wallet1);
      expect(result).toBeOk(expectedId);
      expect(balanceBefore.result).toBeOk(Cl.uint(1_000_000_000));
      expect(balanceAfter.result).toBeOk(Cl.uint(1_000_000_000 - 10_000));
    });

    it("returns expected assertionId when explicit liveness is provided", () => {
      const liveness = Cl.some(Cl.uint(200));
      const expectedId = computeAssertionId(identifier, claim, Cl.uint(10_000), resolveLiveness(liveness), Cl.uint(simnet.blockHeight + 1));

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
      const assertedAtBlock = Cl.uint(simnet.blockHeight + 1);

      const expectedId1 = computeAssertionId(identifier, claim, Cl.uint(10_000), resolveLiveness(liveness), assertedAtBlock);
      const expectedId2 = computeAssertionId(id2, claim, Cl.uint(10_000), resolveLiveness(liveness), assertedAtBlock);

      const [result1, result2] = simnet.mineBlock([
        tx.callPublicFn(contractName, "assert", [identifier, claim, Cl.uint(10_000), liveness], wallet1),
        tx.callPublicFn(contractName, "assert", [id2, claim, Cl.uint(10_000), liveness], wallet2),
      ]);

      expect(expectedId1).not.toEqual(expectedId2);
      expect(result1.result).toBeOk(expectedId1);
      expect(result2.result).toBeOk(expectedId2);
    });
  });

  describe("settle", () => {
    it("settles assertion, updates status to SETTLED (u3), and returns bond to asserter", () => {
      const liveness = Cl.some(Cl.uint(1));
      const assertionId = computeAssertionId(identifier, claim, Cl.uint(10_000), resolveLiveness(liveness), Cl.uint(simnet.blockHeight + 1));
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
      const assertionId = computeAssertionId(identifier, claim, Cl.uint(10_000), resolveLiveness(liveness), Cl.uint(simnet.blockHeight + 1));
      simnet.callPublicFn(contractName, "assert", [identifier, claim, Cl.uint(10_000), liveness], wallet1);

      const { result } = simnet.callPublicFn(contractName, "settle", [assertionId], deployer);
      expect(result).toBeErr(ERR_WINDOW_OPEN);
    });

    it("rejects with ERR_INVALID_STATUS when already settled", () => {
      const liveness = Cl.some(Cl.uint(1));
      const assertionId = computeAssertionId(identifier, claim, Cl.uint(10_000), resolveLiveness(liveness), Cl.uint(simnet.blockHeight + 1));
      simnet.callPublicFn(contractName, "assert", [identifier, claim, Cl.uint(10_000), liveness], wallet1);
      simnet.mineEmptyBlocks(2);
      simnet.callPublicFn(contractName, "settle", [assertionId], deployer);

      const { result } = simnet.callPublicFn(contractName, "settle", [assertionId], deployer);
      expect(result).toBeErr(ERR_INVALID_STATUS);
    });

    it("rejects with ERR_INVALID_STATUS when assertion is disputed", () => {
      const liveness = Cl.some(Cl.uint(1));
      const assertionId = computeAssertionId(identifier, claim, Cl.uint(10_000), resolveLiveness(liveness), Cl.uint(simnet.blockHeight + 1));
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
      const assertionId = computeAssertionId(identifier, claim, Cl.uint(10_000), resolveLiveness(liveness), Cl.uint(simnet.blockHeight + 1));
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
      const assertionId = computeAssertionId(identifier, claim, Cl.uint(10_000), resolveLiveness(liveness), Cl.uint(simnet.blockHeight + 1));
      simnet.callPublicFn(contractName, "assert", [identifier, claim, Cl.uint(10_000), liveness], wallet1);
      simnet.mineEmptyBlocks(2);

      const { result } = simnet.callPublicFn(contractName, "dispute", [assertionId], wallet2);
      expect(result).toBeErr(ERR_WINDOW_CLOSED);
    });

    it("rejects with ERR_INVALID_STATUS when assertion is already disputed", () => {
      const liveness = Cl.some(Cl.uint(1));
      const assertionId = computeAssertionId(identifier, claim, Cl.uint(10_000), resolveLiveness(liveness), Cl.uint(simnet.blockHeight + 1));
      simnet.callPublicFn(contractName, "assert", [identifier, claim, Cl.uint(10_000), liveness], wallet1);
      simnet.callPublicFn(contractName, "dispute", [assertionId], wallet2);

      const { result } = simnet.callPublicFn(contractName, "dispute", [assertionId], wallet2);
      expect(result).toBeErr(ERR_INVALID_STATUS);
    });
  });

  describe("add-arbiter", () => {
    it("contract owner can add an arbiter", () => {
      const { result } = simnet.callPublicFn(contractName, "add-arbiter", [Cl.standardPrincipal(wallet3)], deployer);
      expect(result).toBeOk(Cl.bool(true));

      const arbiter = simnet.callReadOnlyFn(contractName, "get-arbiter", [Cl.standardPrincipal(wallet3)], deployer);
      expect(arbiter.result).toBeSome(Cl.bool(true));
    });

    it("rejects with ERR_NOT_CONTRACT_OWNER when called by non-owner", () => {
      const { result } = simnet.callPublicFn(contractName, "add-arbiter", [Cl.standardPrincipal(wallet3)], wallet1);
      expect(result).toBeErr(ERR_NOT_CONTRACT_OWNER);
    });

    it("rejects with ERR_ARBITER_ALREADY_EXISTS when arbiter is already registered", () => {
      simnet.callPublicFn(contractName, "add-arbiter", [Cl.standardPrincipal(wallet3)], deployer);

      const { result } = simnet.callPublicFn(contractName, "add-arbiter", [Cl.standardPrincipal(wallet3)], deployer);
      expect(result).toBeErr(ERR_ARBITER_ALREADY_EXISTS);
    });
  });

  describe("remove-arbiter", () => {
    it("contract owner can remove a registered arbiter", () => {
      simnet.callPublicFn(contractName, "add-arbiter", [Cl.standardPrincipal(wallet3)], deployer);

      const { result } = simnet.callPublicFn(contractName, "remove-arbiter", [Cl.standardPrincipal(wallet3)], deployer);
      expect(result).toBeOk(Cl.bool(true));

      const arbiter = simnet.callReadOnlyFn(contractName, "get-arbiter", [Cl.standardPrincipal(wallet3)], deployer);
      expect(arbiter.result).toBeNone();
    });

    it("rejects with ERR_NOT_CONTRACT_OWNER when called by non-owner", () => {
      const { result } = simnet.callPublicFn(contractName, "remove-arbiter", [Cl.standardPrincipal(wallet3)], wallet1);
      expect(result).toBeErr(ERR_NOT_CONTRACT_OWNER);
    });

    it("rejects with ERR_ARBITER_NOT_FOUND when arbiter does not exist", () => {
      const { result } = simnet.callPublicFn(contractName, "remove-arbiter", [Cl.standardPrincipal(wallet3)], deployer);
      expect(result).toBeErr(ERR_ARBITER_NOT_FOUND);
    });
  });

  describe("resolve", () => {
    it("rejects with ERR_NOT_ARBITER when caller is not a registered arbiter", () => {
      const assertionId = setupDisputedAssertion();

      const { result } = simnet.callPublicFn(contractName, "resolve", [assertionId, Cl.uint(3)], wallet3);
      expect(result).toBeErr(ERR_NOT_ARBITER);
    });

    it("rejects with ERR_ASSERTION_NOT_FOUND for unknown assertionId", () => {
      simnet.callPublicFn(contractName, "add-arbiter", [Cl.standardPrincipal(wallet3)], deployer);
      const unknownId = Cl.bufferFromHex("ff".repeat(32));

      const { result } = simnet.callPublicFn(contractName, "resolve", [unknownId, Cl.uint(3)], wallet3);
      expect(result).toBeErr(ERR_ASSERTION_NOT_FOUND);
    });

    it("rejects with ERR_INVALID_STATUS when assertion is not disputed", () => {
      simnet.callPublicFn(contractName, "add-arbiter", [Cl.standardPrincipal(wallet3)], deployer);
      const liveness = Cl.some(Cl.uint(1));
      const assertionId = computeAssertionId(identifier, claim, Cl.uint(10_000), resolveLiveness(liveness), Cl.uint(simnet.blockHeight + 1));
      simnet.callPublicFn(contractName, "assert", [identifier, claim, Cl.uint(10_000), liveness], wallet1);

      const { result } = simnet.callPublicFn(contractName, "resolve", [assertionId, Cl.uint(3)], wallet3);
      expect(result).toBeErr(ERR_INVALID_STATUS);
    });

    it("rejects with ERR_INVALID_STATUS for an invalid resolve-status value", () => {
      simnet.callPublicFn(contractName, "add-arbiter", [Cl.standardPrincipal(wallet3)], deployer);
      const assertionId = setupDisputedAssertion();

      const { result } = simnet.callPublicFn(contractName, "resolve", [assertionId, Cl.uint(99)], wallet3);
      expect(result).toBeErr(ERR_INVALID_STATUS);
    });

    it("settle: sets status to SETTLED and sends 2x bond to asserter", () => {
      simnet.callPublicFn(contractName, "add-arbiter", [Cl.standardPrincipal(wallet3)], deployer);
      const assertionId = setupDisputedAssertion();

      const asserterBefore = simnet.callReadOnlyFn(sbtcToken, "get-balance", [Cl.standardPrincipal(wallet1)], wallet1);

      const { result } = simnet.callPublicFn(contractName, "resolve", [assertionId, STATUS_SETTLED], wallet3);

      const asserterAfter = simnet.callReadOnlyFn(sbtcToken, "get-balance", [Cl.standardPrincipal(wallet1)], wallet1);
      const assertion = simnet.callReadOnlyFn(contractName, "get-assertion", [assertionId], deployer);
      expect(result).toBeOk(Cl.bool(true));
      // asserter starts at 1_000_000_000, pays 10_000 bond, gets back 20_000
      expect(asserterBefore.result).toBeOk(Cl.uint(1_000_000_000 - 10_000));
      expect(asserterAfter.result).toBeOk(Cl.uint(1_000_000_000 + 10_000));
      expect(assertion.result).toBeSome(
        expect.objectContaining({
          value: expect.objectContaining({ status: STATUS_SETTLED }),
        })
      );
    });

    it("reject: sets status to REJECTED and sends 2x bond to disputer", () => {
      simnet.callPublicFn(contractName, "add-arbiter", [Cl.standardPrincipal(wallet3)], deployer);
      const assertionId = setupDisputedAssertion();

      const disputerBefore = simnet.callReadOnlyFn(sbtcToken, "get-balance", [Cl.standardPrincipal(wallet2)], wallet2);

      const { result } = simnet.callPublicFn(contractName, "resolve", [assertionId, STATUS_REJECTED], wallet3);

      const disputerAfter = simnet.callReadOnlyFn(sbtcToken, "get-balance", [Cl.standardPrincipal(wallet2)], wallet2);
      const assertion = simnet.callReadOnlyFn(contractName, "get-assertion", [assertionId], deployer);
      expect(result).toBeOk(Cl.bool(true));
      // disputer starts at 1_000_000_000, pays 10_000 bond, gets back 20_000
      expect(disputerBefore.result).toBeOk(Cl.uint(1_000_000_000 - 10_000));
      expect(disputerAfter.result).toBeOk(Cl.uint(1_000_000_000 + 10_000));
      expect(assertion.result).toBeSome(
        expect.objectContaining({
          value: expect.objectContaining({ status: STATUS_REJECTED }),
        })
      );
    });

    it("unresolved: sets status to UNRESOLVED and returns bond to each party", () => {
      simnet.callPublicFn(contractName, "add-arbiter", [Cl.standardPrincipal(wallet3)], deployer);
      const assertionId = setupDisputedAssertion();

      const asserterBefore = simnet.callReadOnlyFn(sbtcToken, "get-balance", [Cl.standardPrincipal(wallet1)], wallet1);
      const disputerBefore = simnet.callReadOnlyFn(sbtcToken, "get-balance", [Cl.standardPrincipal(wallet2)], wallet2);

      const { result } = simnet.callPublicFn(contractName, "resolve", [assertionId, STATUS_UNRESOLVED], wallet3);

      const asserterAfter = simnet.callReadOnlyFn(sbtcToken, "get-balance", [Cl.standardPrincipal(wallet1)], wallet1);
      const disputerAfter = simnet.callReadOnlyFn(sbtcToken, "get-balance", [Cl.standardPrincipal(wallet2)], wallet2);
      const assertion = simnet.callReadOnlyFn(contractName, "get-assertion", [assertionId], deployer);
      expect(result).toBeOk(Cl.bool(true));
      // each gets their 10_000 back
      expect(asserterBefore.result).toBeOk(Cl.uint(1_000_000_000 - 10_000));
      expect(asserterAfter.result).toBeOk(Cl.uint(1_000_000_000));
      expect(disputerBefore.result).toBeOk(Cl.uint(1_000_000_000 - 10_000));
      expect(disputerAfter.result).toBeOk(Cl.uint(1_000_000_000));
      expect(assertion.result).toBeSome(
        expect.objectContaining({
          value: expect.objectContaining({ status: STATUS_UNRESOLVED }),
        })
      );
    });
  });
});
