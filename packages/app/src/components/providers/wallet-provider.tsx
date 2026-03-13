"use client";

import type { WbipProvider } from "@stacks/connect";
import type { PropsWithChildren } from "react";
import { DEFAULT_PROVIDERS, getLocalStorage, isConnected, connect as stacksConnect, disconnect as stacksDisconnect } from "@stacks/connect";
import { createContext, useCallback, useEffect, useState } from "react";

export type NetworkName = "mainnet" | "testnet";

export type WalletContextType = {
  network: NetworkName;
  connected: boolean;
  stxAddress: string | null;
  providers: readonly WbipProvider[];
  connect: () => Promise<void>;
  disconnect: () => void;
};

export const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ network = "testnet", children }: PropsWithChildren<{ network?: NetworkName }>) {
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
    await stacksConnect({ network, forceWalletSelect: true });

    const data = getLocalStorage();
    setConnected(true);
    setStxAddress(data?.addresses.stx[0]?.address ?? null);
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
