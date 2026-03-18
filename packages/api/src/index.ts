import { Hono } from "hono";

import type { Env } from "./env";
import { assertionsHandler } from "./handlers/assertions";
import { webhookHandler } from "./handlers/webhook";

const app = new Hono<Env>();

app
  .route("/assertions", assertionsHandler)
  .route("/webhook", webhookHandler)
  .onError((_err, c) => {
    return c.json({ error: "unexpected_error" }, 500);
  });

export default app;
