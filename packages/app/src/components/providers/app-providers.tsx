import type { PropsWithChildren } from "react";

import { WalletProvider } from "./wallet-provider";

export const AppProviders = ({ children }: PropsWithChildren) => {
  return <WalletProvider>{children}</WalletProvider>;
};
