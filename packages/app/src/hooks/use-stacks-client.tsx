import { useContext } from "react";

import { StacksClientContext } from "@/components/providers/stacks-client-provider";

export function useStacksClient() {
  const ctx = useContext(StacksClientContext);
  if (!ctx) throw new Error("useStacksClient must be used within StacksClientProvider");
  return ctx;
}
