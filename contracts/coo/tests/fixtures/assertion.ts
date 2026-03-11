import type { OptionalCV, UIntCV } from "@stacks/transactions";
import { Cl, ClarityType } from "@stacks/transactions";

export const DEFAULT_LIVENESS = Cl.uint(1440);

export const resolveLiveness = (liveness: OptionalCV<UIntCV>) => {
  return liveness.type === ClarityType.OptionalNone ? DEFAULT_LIVENESS : liveness.value;
};
