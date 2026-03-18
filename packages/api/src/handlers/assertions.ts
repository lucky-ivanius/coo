import { desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";

import type { Env } from "../env";
import * as table from "../lib/db/schema";

const assertionsHandler = new Hono<Env>();

const assertionRoutes = assertionsHandler.get("/", async (c) => {
  const db = drizzle(c.env.COO_DB);

  const assertions = await db.select().from(table.assertions).orderBy(desc(table.assertions.createdAt));

  return c.json(
    assertions.map(({ createdAt: _createdAt, ...assertion }) => assertion),
    200
  );
});

export { assertionsHandler, assertionRoutes };
