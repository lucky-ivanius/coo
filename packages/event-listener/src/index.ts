import { connectWebSocketClient, createClient } from "@stacks/blockchain-api-client";

import { createCooEventSubscriber } from "@coo/sdk";

const baseUrl = Bun.env.STACKS_API_URL ?? "http://localhost:3999";
const cooContractAddress = Bun.env.COO_CONTRACT_ADDRESS!;
const webhookUrl = Bun.env.WEBHOOK_URL ?? "http://localhost:8787/webhook";

const client = createClient({
  baseUrl,
});
const wsClient = await connectWebSocketClient(baseUrl);

const eventSubscriber = createCooEventSubscriber(client, wsClient);

const unsubscribe = await eventSubscriber.subscribe(cooContractAddress, ({ event, data }) => {
  switch (event) {
    case "asserted":
    case "disputed":
    case "settled":
    case "rejected":
    case "unresolved": {
      fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ event, data }),
      });

      console.log(`Webhook sent for event: ${event}`);

      break;
    }
    default:
      break;
  }
});
console.info(`Listening for events on contract: ${cooContractAddress}`);

const onExit = async () => {
  await unsubscribe();
  process.exit(0);
};

process.on("SIGINT", onExit);

process.on("SIGTERM", onExit);
