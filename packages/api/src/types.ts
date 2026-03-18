import type { assertionRoutes } from "./handlers/assertions";
import type { webhookRoutes } from "./handlers/webhook";

export type AssertionApi = typeof assertionRoutes;
export type WebhookApi = typeof webhookRoutes;
