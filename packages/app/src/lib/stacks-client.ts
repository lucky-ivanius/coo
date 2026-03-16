import { createClient } from "@stacks/blockchain-api-client";

export const getStacksClient = () => {
  const baseUrl = process.env.STACKS_API_BASE_URL || "http://localhost:3999";
  const client = createClient({ baseUrl });

  return client;
};
