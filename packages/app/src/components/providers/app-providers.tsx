import type { PropsWithChildren } from "react";
import { ThemeProvider } from "next-themes";

import { WalletProvider } from "./wallet-provider";

export const AppProviders = ({ children }: PropsWithChildren) => {
  return (
    <ThemeProvider>
      <WalletProvider>{children}</WalletProvider>
    </ThemeProvider>
  );
};
