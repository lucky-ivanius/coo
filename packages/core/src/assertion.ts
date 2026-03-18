import z from "zod";

export const assertionStatusSchema = z.enum(["open", "disputed", "settled", "rejected", "unresolved"]);
export type AssertionStatus = z.infer<typeof assertionStatusSchema>;

export const assertionSchema = z.object({
  id: z.hex(),

  identifier: z.hex(),
  claim: z.hex(),

  bondSats: z.int().nonnegative(),
  liveness: z.int().nonnegative(),

  status: assertionStatusSchema,

  asserter: z.string(),
  disputer: z.string().nullable().optional(),
  settler: z.string().nullable().optional(),
  resolver: z.string().nullable().optional(),

  assertedAtBlock: z.int().nonnegative(),
  assertedTxId: z.hex(),

  disputedAtBlock: z.int().nonnegative().nullable().optional(),
  disputedTxId: z.hex().nullable().optional(),

  settledAtBlock: z.int().nonnegative().nullable().optional(),
  settledTxId: z.hex().nullable().optional(),

  resolvedAtBlock: z.int().nonnegative().nullable().optional(),
  resolvedTxId: z.hex().nullable().optional(),
});
export type Assertion = z.infer<typeof assertionSchema>;
