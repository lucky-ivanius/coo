import { Hono } from "hono";

import type { Env } from "./env";
import { assertionsHandler } from "./handlers/assertions";
import { webhookHandler } from "./handlers/webhook";
import { cors } from "hono/cors";
import { trimTrailingSlash } from "hono/trailing-slash";

const app = new Hono<Env>();

app.use(cors()).use(trimTrailingSlash());

app
  .route("/assertions", assertionsHandler)
  .route("/webhook", webhookHandler)
  .onError((_err, c) => {
    return c.json({ error: "unexpected_error" }, 500);
  });

export default app;
