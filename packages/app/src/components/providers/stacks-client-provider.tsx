import type { Client, StacksApiWebSocketClient } from "@stacks/blockchain-api-client";
import type { paths } from "@stacks/blockchain-api-client/lib/generated/schema";
import type { PropsWithChildren } from "react";
import { createContext } from "react";

export type StacksClientContextType = {
  client: Client<paths>;
  wsClient: StacksApiWebSocketClient;
};

export const StacksClientContext = createContext<StacksClientContextType | null>(null);

export interface EventProviderProps {
  client: Client<paths>;
  wsClient: StacksApiWebSocketClient;
}

export function StacksClientProvider({ client, wsClient, children }: PropsWithChildren<EventProviderProps>) {
  return <StacksClientContext.Provider value={{ client, wsClient }}>{children}</StacksClientContext.Provider>;
}
