import { ChainhookEventSchema } from "@hirosystems/chainhooks-client";
import { tbValidator } from "@hono/typebox-validator";
import { zValidator } from "@hono/zod-validator";
import { without0x } from "@stacks/common";
import { Cl } from "@stacks/transactions";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { createMiddleware } from "hono/factory";

import type { CooAssertedEventCV, CooContractEventCV, CooDisputedEventCV, CooRejectedEventCV, CooSettledEventCV, CooUnresolvedEventCV } from "@coo/sdk";
import { assertionEventSchema } from "@coo/core";

import type { Env } from "../env";
import * as tables from "../lib/db/schema";

const webhookHandler = new Hono<Env>();

const webhookAuth = createMiddleware<Env>((c, next) => bearerAuth({ token: c.env.WEBHOOK_SECRET })(c, next));
const chainhooksAuth = createMiddleware<Env>((c, next) => bearerAuth({ token: c.env.CHAINHOOKS_SECRET })(c, next));

const webhookRoutes = webhookHandler
  .post("/", webhookAuth, zValidator("json", assertionEventSchema), async (c) => {
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
  })
  .post("/chainhooks", chainhooksAuth, tbValidator("json", ChainhookEventSchema), async (c) => {
    try {
      const { event } = c.req.valid("json");

      const db = drizzle(c.env.COO_DB);

      const logs = event.apply
        .flatMap((a) => a.transactions)
        .flatMap((t) =>
          t.operations
            .filter(
              (op): op is Extract<typeof op, { type: "contract_log" }> =>
                op.status === "success" &&
                op.type === "contract_log" &&
                op.metadata.contract_identifier === c.env.COO_CORE_CONTRACT &&
                op.metadata.topic === "print" &&
                typeof op.metadata.value === "object"
            )
            .map((op) => ({
              txId: t.transaction_identifier.hash,
              event: Cl.deserialize<CooContractEventCV>((op.metadata.value as { hex: string }).hex).value,
            }))
        );

      for (const log of logs) {
        const { txId, event } = log;

        switch (event.event.value) {
          case "asserted": {
            const { value } = event.data as CooAssertedEventCV["value"]["data"];

            const assertionId = without0x(value["assertion-id"].value);
            const identifier = without0x(value.identifier.value);
            const claim = without0x(value.claim.value);
            const bondSats = Number.parseInt(value["bond-sats"].value.toString(), 10);
            const liveness = Number.parseInt(value.liveness.value.toString(), 10);
            const assertedBy = value["asserted-by"].value;
            const assertedAtBlock = Number.parseInt(value["asserted-at-block"].value.toString(), 10);

            await db
              .insert(tables.assertions)
              .values({
                id: assertionId,
                identifier: identifier,
                claim: claim,
                bondSats: bondSats,
                liveness: liveness,
                asserter: assertedBy,
                assertedAtBlock: assertedAtBlock,
                assertedTxId: txId,
              })
              .onConflictDoUpdate({
                target: tables.assertions.id,
                set: {
                  identifier: identifier,
                  claim: claim,
                  bondSats: bondSats,
                  liveness: liveness,
                  asserter: assertedBy,
                  assertedAtBlock: assertedAtBlock,
                  assertedTxId: txId,
                },
              });

            break;
          }
          case "disputed": {
            const { value } = event.data as CooDisputedEventCV["value"]["data"];

            const assertionId = without0x(value["assertion-id"].value);
            const disputedBy = value["disputed-by"].value;
            const disputedAtBlock = Number.parseInt(value["disputed-at-block"].value.toString(), 10);

            await db
              .update(tables.assertions)
              .set({ disputer: disputedBy, disputedTxId: txId, disputedAtBlock: disputedAtBlock, status: "disputed" })
              .where(eq(tables.assertions.id, assertionId));
            break;
          }
          case "settled": {
            const { value } = event.data as CooSettledEventCV["value"]["data"];

            const assertionId = without0x(value["assertion-id"].value);
            const settledBy = value["settled-by"].value;
            const settledAtBlock = Number.parseInt(value["settled-at-block"].value.toString(), 10);

            const [assertion] = await db.select().from(tables.assertions).where(eq(tables.assertions.id, assertionId));
            if (!assertion) break;

            await db
              .update(tables.assertions)
              .set({
                settler: settledBy,
                settledTxId: txId,
                settledAtBlock: settledAtBlock,
                status: "settled",
                ...(assertion.status === "disputed" ? { resolver: settledBy, resolvedTxId: txId, resolvedAtBlock: settledAtBlock } : {}),
              })
              .where(eq(tables.assertions.id, assertionId));
            break;
          }
          case "rejected": {
            const { value } = event.data as CooRejectedEventCV["value"]["data"];

            const assertionId = without0x(value["assertion-id"].value);
            const rejectedBy = value["rejected-by"].value;
            const rejectedAtBlock = Number.parseInt(value["rejected-at-block"].value.toString(), 10);

            await db
              .update(tables.assertions)
              .set({ resolver: rejectedBy, resolvedTxId: txId, resolvedAtBlock: rejectedAtBlock, status: "rejected" })
              .where(eq(tables.assertions.id, assertionId));
            break;
          }
          case "unresolved": {
            const { value } = event.data as CooUnresolvedEventCV["value"]["data"];

            const assertionId = without0x(value["assertion-id"].value);
            const unresolvedBy = value["unresolved-by"].value;
            const unresolvedAtBlock = Number.parseInt(value["unresolved-at-block"].value.toString(), 10);

            await db
              .update(tables.assertions)
              .set({ resolver: unresolvedBy, resolvedTxId: txId, resolvedAtBlock: unresolvedAtBlock, status: "unresolved" })
              .where(eq(tables.assertions.id, assertionId));
            break;
          }
          default:
            break;
        }
      }

      return c.json(undefined, 200);
    } catch (e) {
      console.error(e);
    }
  });

export { webhookHandler, webhookRoutes };
