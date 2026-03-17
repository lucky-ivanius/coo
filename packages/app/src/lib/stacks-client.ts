import { createClient, StacksApiWebSocketClient } from "@stacks/blockchain-api-client";

export const getStacksClient = () => {
  const baseUrl = process.env.STACKS_API_BASE_URL || "http://localhost:3999";
  const client = createClient({ baseUrl });

  return client;
};

export const getStacksWsClient = () => {
  const wsUrl = process.env.STACKS_API_WS_URL || "ws://localhost:3999/extended/v1/ws";
  const wsClient = new StacksApiWebSocketClient(new WebSocket(wsUrl));

  return wsClient;
};
