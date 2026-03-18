import type { PropsWithChildren } from "react";
import { createContext } from "react";

import { useIsArbiter } from "@/hooks/use-arbiter";
import { useWallet } from "@/hooks/use-wallet";

export type ArbiterContextType = {
  isArbiter: boolean;
};

export const ArbiterContext = createContext<ArbiterContextType | null>(null);

export function ArbiterProvider({ children }: PropsWithChildren) {
  const { stxAddress, network } = useWallet();

  const { data: isArbiter } = useIsArbiter(stxAddress, network);

  return (
    <ArbiterContext.Provider
      value={{
        isArbiter: isArbiter ?? false,
      }}
    >
      {children}
    </ArbiterContext.Provider>
  );
}
