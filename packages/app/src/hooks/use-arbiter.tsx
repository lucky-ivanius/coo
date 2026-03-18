import type { StacksNetworkName } from "@stacks/network";
import type { UseQueryResult } from "@tanstack/react-query";
import { Cl, ClarityType, fetchCallReadOnlyFunction } from "@stacks/transactions";
import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";

import { ArbiterContext } from "@/components/providers/arbiter-provider";
import { COO_CORE_CONTRACT } from "@/consts/contracts";

export const useIsArbiter = (address: string | null, network: StacksNetworkName): UseQueryResult<boolean> => {
  return useQuery<boolean>({
    queryKey: ["isArbiter", address, network],
    queryFn: async () => {
      if (!address) return false;

      const [contractAddress, contractName] = COO_CORE_CONTRACT.split(".");

      const response = await fetchCallReadOnlyFunction({
        contractName,
        contractAddress,
        functionName: "is-arbiter",
        functionArgs: [Cl.principal(address)],
        senderAddress: address,
        network,
      });

      if (response.type === ClarityType.OptionalSome) {
        return true;
      }

      return false;
    },
    enabled: !!address,
    refetchInterval: 1000 * 60 * 5,
  });
};

export const useArbiter = () => {
  const ctx = useContext(ArbiterContext);
  if (!ctx) throw new Error("useArbiter must be used within ArbiterProvider");
  return ctx;
};
