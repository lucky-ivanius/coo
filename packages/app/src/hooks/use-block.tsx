import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";

import { getStacksClient } from "../lib/stacks-client";

export const useCurrentBlock = (): UseQueryResult<number> => {
  const client = getStacksClient();

  return useQuery<number>({
    queryKey: ["currentBlock"],
    queryFn: async () => {
      const { data, error } = await client.GET("/extended/v2/blocks/", {
        params: {
          query: {
            limit: 1,
            offset: 0,
          },
        },
      });

      if (error) {
        throw new Error("Error fetching current block");
      }

      const [block] = data.results;

      return block.height;
    },
    enabled: true,
  });
};

export const useAverageBlockTime = (): UseQueryResult<number> => {
  const client = getStacksClient();

  return useQuery<number>({
    queryKey: ["averageBlockTime"],
    queryFn: async () => {
      const { data, error } = await client.GET("/extended/v2/blocks/average-times");

      if (error) {
        throw new Error("Error fetching block average times");
      }

      return data.last_24h;
    },
    enabled: true,
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });
};
