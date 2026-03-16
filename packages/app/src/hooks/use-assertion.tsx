import { request } from "@stacks/connect";
import { Cl, Pc } from "@stacks/transactions";
import { useMutation } from "@tanstack/react-query";

import { COO_CORE_CONTRACT } from "@/consts/contracts";
import { getSbtcAddress } from "@/lib/sbtc";

import { useWallet } from "./use-wallet";

export type CreateAssertionArgs = {
  identifier: Uint8Array;
  claim: Uint8Array;
  bondSats: bigint;
  liveness?: bigint;
};

export const useCreateAssertion = () => {
  const { stxAddress, network } = useWallet();

  return useMutation({
    mutationFn: async (args: CreateAssertionArgs) => {
      const sBtcTransferPostCond = Pc.principal(stxAddress!).willSendEq(args.bondSats).ft(getSbtcAddress(network), "sbtc-token");

      const res = await request({ forceWalletSelect: true }, "stx_callContract", {
        contract: COO_CORE_CONTRACT,
        functionName: "assert",
        network,
        functionArgs: [Cl.buffer(args.identifier), Cl.buffer(args.claim), Cl.uint(args.bondSats), args.liveness ? Cl.some(Cl.uint(args.liveness)) : Cl.none()],
        postConditions: [sBtcTransferPostCond],
        postConditionMode: "deny",
        sponsored: false,
      });

      return res;
    },
  });
};
