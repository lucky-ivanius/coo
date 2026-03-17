"use client";

import type { StacksNetworkName } from "@stacks/network";
import type { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";

import { getStacksClient, getStacksWsClient } from "@/lib/stacks-client";

import { StacksClientProvider } from "./stacks-client-provider";
import { WalletProvider } from "./wallet-provider";

const queryClient = new QueryClient();
const stacksClient = getStacksClient();
const stacksWsClient = getStacksWsClient();

export const AppProviders = ({ children }: PropsWithChildren) => {
  return (
    <QueryClientProvider client={queryClient}>
      <StacksClientProvider client={stacksClient} wsClient={stacksWsClient}>
        <ThemeProvider>
          <WalletProvider network={(process.env.NEXT_PUBLIC_STACKS_NETWORK as StacksNetworkName) ?? "testnet"}>{children}</WalletProvider>
        </ThemeProvider>
      </StacksClientProvider>
    </QueryClientProvider>
  );
};
