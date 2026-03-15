"use client";

import type { StacksNetworkName } from "@stacks/network";
import type { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";

import { WalletProvider } from "./wallet-provider";

const queryClient = new QueryClient();

export const AppProviders = ({ children }: PropsWithChildren) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <WalletProvider network={(process.env.NEXT_PUBLIC_STACKS_NETWORK as StacksNetworkName) ?? "testnet"}>{children}</WalletProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};
