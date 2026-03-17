import type { ClarityType } from "@stacks/transactions";

export type LiteralStringAsciiCV<T extends string> = {
  type: ClarityType.StringASCII;
  value: T;
};
