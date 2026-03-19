import { request } from "@stacks/connect";
import Cl from "@stacks/transactions/dist/cl";
import Pc from "@stacks/transactions/dist/pc";
import { useMutation } from "@tanstack/react-query";

import type { Assertion } from "@coo/core";

import { COO_CORE_CONTRACT } from "@/consts/contracts";
import { getSbtcAddress } from "@/lib/sbtc";

import { useWallet } from "./use-wallet";

export type CreateAssertionArgs = {
  identifier: string;
  claim: string;
  bondSats: number;
  liveness: number | null;
};

export const useCreateAssertion = () => {
  const { stxAddress, network, connected, connect } = useWallet();

  return useMutation({
    mutationFn: async (args: CreateAssertionArgs) => {
      if (!connected) await connect();

      const sBtcTransferPostCond = Pc.principal(stxAddress!).willSendEq(args.bondSats).ft(getSbtcAddress(network), "sbtc-token");

      const res = await request("stx_callContract", {
        contract: COO_CORE_CONTRACT,
        functionName: "assert",
        network,
        functionArgs: [
          Cl.bufferFromHex(args.identifier),
          Cl.bufferFromHex(args.claim),
          Cl.uint(args.bondSats),
          args.liveness !== null ? Cl.some(Cl.uint(args.liveness)) : Cl.none(),
        ],
        postConditions: [sBtcTransferPostCond],
        postConditionMode: "deny",
        sponsored: false,
      });

      return res;
    },
  });
};

export const useSettleAssertion = (assertion: Assertion) => {
  const { network, connected, connect } = useWallet();

  return useMutation({
    mutationFn: async () => {
      if (!connected) await connect();

      const sBtcTransferPostCond = Pc.principal(COO_CORE_CONTRACT).willSendEq(assertion.bondSats).ft(getSbtcAddress(network), "sbtc-token");

      const res = await request("stx_callContract", {
        contract: COO_CORE_CONTRACT,
        functionName: "settle",
        network,
        functionArgs: [Cl.bufferFromHex(assertion.id)],
        postConditions: [sBtcTransferPostCond],
        postConditionMode: "deny",
        sponsored: false,
      });

      return res;
    },
  });
};

export const useDisputeAssertion = (assertion: Assertion) => {
  const { stxAddress, network, connected, connect } = useWallet();

  return useMutation({
    mutationFn: async () => {
      if (!connected) await connect();

      const sBtcTransferPostCond = Pc.principal(stxAddress!).willSendEq(assertion.bondSats).ft(getSbtcAddress(network), "sbtc-token");

      const res = await request("stx_callContract", {
        contract: COO_CORE_CONTRACT,
        functionName: "dispute",
        network,
        functionArgs: [Cl.bufferFromHex(assertion.id)],
        postConditions: [sBtcTransferPostCond],
        postConditionMode: "deny",
        sponsored: false,
      });

      return res;
    },
  });
};

export const resolveResult = ["settled", "rejected", "unresolved"] as const;
export type ResolveResult = (typeof resolveResult)[number];

export const resolveResultMap = {
  settled: 2,
  rejected: 3,
  unresolved: 4,
} as const satisfies Record<ResolveResult, number>;

export const useResolveAssertion = (assertion: Assertion) => {
  const { network, connected, connect } = useWallet();

  return useMutation({
    mutationFn: async (result: ResolveResult) => {
      if (!connected) await connect();

      const sBtcTransferPostCond = Pc.principal(COO_CORE_CONTRACT)
        .willSendEq(assertion.bondSats * 2)
        .ft(getSbtcAddress(network), "sbtc-token");

      const res = await request("stx_callContract", {
        contract: COO_CORE_CONTRACT,
        functionName: "resolve",
        network,
        functionArgs: [Cl.bufferFromHex(assertion.id), Cl.uint(resolveResultMap[result])],
        postConditions: [sBtcTransferPostCond],
        postConditionMode: "deny",
        sponsored: false,
      });

      return res;
    },
  });
};
