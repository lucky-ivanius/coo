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
  connecting: boolean;
  stxAddress: string | null;
  providers: readonly WbipProvider[];
  connect: () => Promise<void>;
  disconnect: () => void;
};

export const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ network = "testnet", children }: PropsWithChildren<{ network?: StacksNetworkName }>) {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
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
      setConnecting(true);

      await stacksConnect({ network, forceWalletSelect: true });

      const data = getLocalStorage();
      setConnected(true);
      setStxAddress(data?.addresses.stx[0]?.address ?? null);
    } catch (e) {
      console.error(e);
      const message = e instanceof Error ? e.message.trim() : "Unknown error";

      if (message === "User rejected request") {
        toast.error(<span className="text-destructive">Failed to connect wallet</span>, {
          description: <span className="text-muted-foreground text-xs">{message}</span>,
          position: "top-center",
        });
      }
    } finally {
      setConnecting(false);
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
        connecting,
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
