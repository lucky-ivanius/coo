import { z } from "zod";

export const assertedEventDataSchema = z.object({
  assertionId: z.hex(),
  identifier: z.hex(),
  claim: z.hex(),
  bondSats: z.number(),
  liveness: z.number(),
  assertedBy: z.string(),
  assertedAtBlock: z.number(),
  assertedTxId: z.hex(),
});
export type AssertedEventData = z.infer<typeof assertedEventDataSchema>;

export const assertedEventSchema = z.object({
  event: z.literal("asserted"),
  data: assertedEventDataSchema,
});
export type AssertedEvent = z.infer<typeof assertedEventSchema>;

export const disputedEventDataSchema = z.object({
  assertionId: z.hex(),
  disputedBy: z.string(),
  disputedAtBlock: z.number(),
  disputedTxId: z.hex(),
});
export type DisputedEventData = z.infer<typeof disputedEventDataSchema>;

export const disputedEventSchema = z.object({
  event: z.literal("disputed"),
  data: disputedEventDataSchema,
});
export type DisputedEvent = z.infer<typeof disputedEventSchema>;

export const settledEventDataSchema = z.object({
  assertionId: z.hex(),
  settledBy: z.string(),
  settledAtBlock: z.number(),
  settledTxId: z.hex(),
});
export type SettledEventData = z.infer<typeof settledEventDataSchema>;

export const settledEventSchema = z.object({
  event: z.literal("settled"),
  data: settledEventDataSchema,
});
export type SettledEvent = z.infer<typeof settledEventSchema>;

export const rejectedEventDataSchema = z.object({
  assertionId: z.hex(),
  rejectedBy: z.string(),
  rejectedAtBlock: z.number(),
  rejectedTxId: z.hex(),
});
export type RejectedEventData = z.infer<typeof rejectedEventDataSchema>;

export const rejectedEventSchema = z.object({
  event: z.literal("rejected"),
  data: rejectedEventDataSchema,
});
export type RejectedEvent = z.infer<typeof rejectedEventSchema>;

export const unresolvedEventDataSchema = z.object({
  assertionId: z.hex(),
  unresolvedBy: z.string(),
  unresolvedAtBlock: z.number(),
  unresolvedTxId: z.hex(),
});
export type UnresolvedEventData = z.infer<typeof unresolvedEventDataSchema>;

export const unresolvedEventSchema = z.object({
  event: z.literal("unresolved"),
  data: unresolvedEventDataSchema,
});
export type UnresolvedEvent = z.infer<typeof unresolvedEventSchema>;

export const assertionEventSchema = z.discriminatedUnion("event", [
  assertedEventSchema,
  disputedEventSchema,
  settledEventSchema,
  rejectedEventSchema,
  unresolvedEventSchema,
]);
export type AssertionEvent = z.infer<typeof assertionEventSchema>;
