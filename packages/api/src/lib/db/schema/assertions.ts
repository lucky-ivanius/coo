import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const assertions = sqliteTable("assertions", {
  id: text("id").primaryKey(),

  identifier: text("identifier").notNull(),

  claim: text("claim").notNull(),

  bondSats: int("bond_sats").notNull(),
  liveness: int("liveness").notNull(),

  asserter: text("asserter").notNull(),
  disputer: text("disputer"),
  settler: text("settler"),
  resolver: text("resolver"),

  status: text("status", { enum: ["open", "disputed", "settled", "rejected", "unresolved"] })
    .notNull()
    .default("open"),

  assertedTxId: text("asserted_tx_id").notNull(),
  assertedAtBlock: int("asserted_at_block").notNull(),

  disputedTxId: text("disputed_tx_id"),
  disputedAtBlock: int("disputed_at_block"),

  settledTxId: text("settled_tx_id"),
  settledAtBlock: int("settled_at_block"),

  resolvedTxId: text("resolved_tx_id"),
  resolvedAtBlock: int("resolved_at_block"),

  createdAt: int("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});
