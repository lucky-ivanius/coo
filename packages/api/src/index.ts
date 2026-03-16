import { connectWebSocketClient, createClient } from "@stacks/blockchain-api-client";

import { createCooEventSubscriber } from "@coo/sdk";

const client = createClient({
  baseUrl: "http://localhost:3999",
});
const wsClient = await connectWebSocketClient("http://localhost:3999");

const eventSubscriber = createCooEventSubscriber(client, wsClient);

const unsubscribe = await eventSubscriber.subscribe("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.coo-core", async ({ event, data }) => {
  switch (event) {
    case "asserted":
    case "disputed":
    case "settled":
    case "rejected":
    case "unresolved":
      // TODO: Store to db
      break;
    default:
      break;
  }
});

process.on("SIGINT", async () => {
  await unsubscribe();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await unsubscribe();
  process.exit(0);
});
