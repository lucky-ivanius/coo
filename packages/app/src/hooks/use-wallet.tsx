import { useContext } from "react";

import { WalletContext } from "@/components/providers/wallet-provider";

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}
