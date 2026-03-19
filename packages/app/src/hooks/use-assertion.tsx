import { request } from "@stacks/connect";
import { bufferCV, noneCV, Pc, postConditionToHex, someCV, uintCV } from "@stacks/transactions";
import { useMutation } from "@tanstack/react-query";

import type { Assertion } from "@coo/core";

import { COO_CORE_CONTRACT } from "@/consts/contracts";
import { getSbtcAddress } from "@/lib/sbtc";

import { useWallet } from "./use-wallet";
import { hexToBytes, intToBigInt } from "@stacks/common";

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

      const sBtcTransferPostCond = postConditionToHex(
        Pc.principal(stxAddress!).willSendEq(intToBigInt(args.bondSats)).ft(getSbtcAddress(network), "sbtc-token")
      );

      const res = await request("stx_callContract", {
        contract: COO_CORE_CONTRACT,
        functionName: "assert",
        network,
        functionArgs: [
          bufferCV(hexToBytes(args.identifier)),
          bufferCV(hexToBytes(args.claim)),
          uintCV(args.bondSats),
          args.liveness !== null ? someCV(uintCV(args.liveness)) : noneCV(),
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

      const sBtcTransferPostCond = postConditionToHex(Pc.principal(COO_CORE_CONTRACT).willSendEq(assertion.bondSats).ft(getSbtcAddress(network), "sbtc-token"));

      const res = await request("stx_callContract", {
        contract: COO_CORE_CONTRACT,
        functionName: "settle",
        network,
        functionArgs: [bufferCV(hexToBytes(assertion.id))],
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

      const sBtcTransferPostCond = postConditionToHex(Pc.principal(stxAddress!).willSendEq(assertion.bondSats).ft(getSbtcAddress(network), "sbtc-token"));

      const res = await request("stx_callContract", {
        contract: COO_CORE_CONTRACT,
        functionName: "dispute",
        network,
        functionArgs: [bufferCV(hexToBytes(assertion.id))],
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

      const sBtcTransferPostCond = postConditionToHex(
        Pc.principal(COO_CORE_CONTRACT)
          .willSendEq(assertion.bondSats * 2)
          .ft(getSbtcAddress(network), "sbtc-token")
      );

      const res = await request("stx_callContract", {
        contract: COO_CORE_CONTRACT,
        functionName: "resolve",
        network,
        functionArgs: [bufferCV(hexToBytes(assertion.id)), uintCV(resolveResultMap[result])],
        postConditions: [sBtcTransferPostCond],
        postConditionMode: "deny",
        sponsored: false,
      });

      return res;
    },
  });
};
