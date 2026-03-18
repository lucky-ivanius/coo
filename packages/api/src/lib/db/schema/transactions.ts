import { int, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const transactionEvents = sqliteTable(
  "transaction_events",
  {
    id: text("id").primaryKey(),

    txId: text("tx_id").notNull(),
    contractAddress: text("contract_address").notNull(),

    eventIndex: int("event_index").notNull(),
    eventType: text("event_type").notNull(),
    eventData: text("event_data", { mode: "json" }).notNull(),
  },
  (t) => [uniqueIndex("transaction_event_unique").on(t.txId, t.eventIndex)]
);
