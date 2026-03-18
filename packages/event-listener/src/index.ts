import { connectWebSocketClient, createClient } from "@stacks/blockchain-api-client";
import { hc } from "hono/client";

import type { WebhookApi } from "@coo/api/types";
import { createCooEventSubscriber } from "@coo/sdk";

const baseUrl = Bun.env.STACKS_API_URL ?? "http://localhost:3999";
const cooContractAddress = Bun.env.COO_CONTRACT_ADDRESS!;
const webhookUrl = Bun.env.WEBHOOK_URL ?? "http://localhost:8787/webhook";

const webhookApi = hc<WebhookApi>(webhookUrl);

const client = createClient({
  baseUrl,
});
const wsClient = await connectWebSocketClient(baseUrl);

const eventSubscriber = createCooEventSubscriber(client, wsClient);

const unsubscribe = await eventSubscriber.subscribe(cooContractAddress, async (event) => {
  switch (event.event) {
    case "asserted":
    case "disputed":
    case "settled":
    case "rejected":
    case "unresolved": {
      const result = await webhookApi.index.$post({
        json: event,
      });

      console.log(`Webhook sent for event: ${event.event}, assertionId: ${event.data.assertionId} result: ${result.status}`);

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
