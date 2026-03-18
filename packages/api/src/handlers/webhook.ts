import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";

import { assertionEventSchema } from "@coo/core";

import type { Env } from "../env";
import * as tables from "../lib/db/schema";

const webhookHandler = new Hono<Env>();

const webhookRoutes = webhookHandler.post("/", zValidator("json", assertionEventSchema), async (c) => {
  const { event, data } = c.req.valid("json");

  const db = drizzle(c.env.COO_DB);

  switch (event) {
    case "asserted": {
      await db
        .insert(tables.assertions)
        .values({
          id: data.assertionId,
          identifier: data.identifier,
          claim: data.claim,
          bondSats: data.bondSats,
          liveness: data.liveness,
          asserter: data.assertedBy,
          assertedAtBlock: data.assertedAtBlock,
          assertedTxId: data.assertedTxId,
        })
        .onConflictDoUpdate({
          target: tables.assertions.id,
          set: {
            identifier: data.identifier,
            claim: data.claim,
            bondSats: data.bondSats,
            liveness: data.liveness,
            asserter: data.assertedBy,
            assertedAtBlock: data.assertedAtBlock,
            assertedTxId: data.assertedTxId,
          },
        });

      break;
    }
    case "disputed": {
      await db
        .update(tables.assertions)
        .set({ disputer: data.disputedBy, disputedTxId: data.disputedTxId, disputedAtBlock: data.disputedAtBlock, status: "disputed" })
        .where(eq(tables.assertions.id, data.assertionId));
      break;
    }
    case "settled": {
      const [assertion] = await db.select().from(tables.assertions).where(eq(tables.assertions.id, data.assertionId));
      if (!assertion) break;

      await db
        .update(tables.assertions)
        .set({
          settler: data.settledBy,
          settledTxId: data.settledTxId,
          settledAtBlock: data.settledAtBlock,
          status: "settled",
          ...(assertion.status === "disputed" ? { resolver: data.settledBy, resolvedTxId: data.settledTxId, resolvedAtBlock: data.settledAtBlock } : {}),
        })
        .where(eq(tables.assertions.id, data.assertionId));
      break;
    }
    case "rejected": {
      await db
        .update(tables.assertions)
        .set({ resolver: data.rejectedBy, resolvedTxId: data.rejectedTxId, resolvedAtBlock: data.rejectedAtBlock, status: "rejected" })
        .where(eq(tables.assertions.id, data.assertionId));
      break;
    }
    case "unresolved": {
      await db
        .update(tables.assertions)
        .set({ resolver: data.unresolvedBy, resolvedTxId: data.unresolvedTxId, resolvedAtBlock: data.unresolvedAtBlock, status: "unresolved" })
        .where(eq(tables.assertions.id, data.assertionId));
      break;
    }
    default:
      break;
  }

  return c.json(undefined, 200);
});

export { webhookHandler, webhookRoutes };
