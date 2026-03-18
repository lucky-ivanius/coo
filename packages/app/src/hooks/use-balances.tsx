import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";

import { getSbtcAddress } from "@/lib/sbtc";

import { useStacksClient } from "./use-stacks-client";
import { useWallet } from "./use-wallet";

export const useStxBalance = (address: string | null): UseQueryResult<number> => {
  const { client } = useStacksClient();

  return useQuery<number>({
    queryKey: ["stxBalance", address],
    queryFn: async () => {
      const { data, error } = await client.GET("/extended/v2/addresses/{principal}/balances/stx", {
        params: { path: { principal: address! } },
      });

      if (error) {
        throw new Error("Error fetching STX balance");
      }

      return Number(data.balance);
    },
    enabled: !!address,
    refetchInterval: 10000,
  });
};

export const useSbtcBalance = (address: string | null): UseQueryResult<number> => {
  const { network } = useWallet();
  const { client } = useStacksClient();

  return useQuery<number>({
    queryKey: ["sbtcBalance", address],
    queryFn: async () => {
      const { data, error } = await client.GET("/extended/v2/addresses/{principal}/balances/ft/{token}", {
        params: { path: { principal: address!, token: `${getSbtcAddress(network)}::sbtc-token` } },
      });

      if (error) {
        throw new Error("Error fetching sBTC balance");
      }

      return Number(data.balance);
    },
    enabled: !!address,
    refetchInterval: 10000,
  });
};
