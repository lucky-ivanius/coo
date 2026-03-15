"use client";

import type { WbipProvider } from "@stacks/connect";
import type { StacksNetworkName } from "@stacks/network";
import type { PropsWithChildren } from "react";
import { DEFAULT_PROVIDERS, getLocalStorage, isConnected, connect as stacksConnect, disconnect as stacksDisconnect } from "@stacks/connect";
import { createContext, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export type WalletContextType = {
  network: StacksNetworkName;
  connected: boolean;
  stxAddress: string | null;
  providers: readonly WbipProvider[];
  connect: () => Promise<void>;
  disconnect: () => void;
};

export const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ network = "testnet", children }: PropsWithChildren<{ network?: StacksNetworkName }>) {
  const [connected, setConnected] = useState(false);
  const [stxAddress, setStxAddress] = useState<string | null>(null);

  useEffect(() => {
    if (isConnected()) {
      const data = getLocalStorage();

      setConnected(true);
      setStxAddress(data?.addresses.stx[0]?.address ?? null);
    }
  }, []);

  const connect = useCallback(async () => {
    try {
      await stacksConnect({ network, forceWalletSelect: true });

      const data = getLocalStorage();
      setConnected(true);
      setStxAddress(data?.addresses.stx[0]?.address ?? null);
    } catch (err) {
      toast.error(<span className="text-destructive">Failed to connect wallet</span>, {
        description: <span className="text-muted-foreground text-xs">{(err as Error)?.message ?? "Unknown error"}</span>,
        position: "top-center",
      });
    }
  }, [network]);

  const disconnect = useCallback(() => {
    stacksDisconnect();

    setConnected(false);
    setStxAddress(null);
  }, []);

  return (
    <WalletContext.Provider
      value={{
        network,
        connected,
        stxAddress,
        providers: DEFAULT_PROVIDERS,
        connect,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}
