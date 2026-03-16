import { connectWebSocketClient, createClient } from "@stacks/blockchain-api-client";

const baseUrl = process.env.STACKS_API_BASE_URL || "http://localhost:3999";

export const getStacksClient = () => {
  const client = createClient({ baseUrl });

  return client;
};

export const getStacksWsClient = async () => {
  const wsClient = await connectWebSocketClient(baseUrl);

  return wsClient;
};
