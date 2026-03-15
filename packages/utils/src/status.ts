import { Cl } from "@stacks/transactions";

export const STATUS_OPEN = Cl.uint(0);
export const STATUS_DISPUTED = Cl.uint(1);
export const STATUS_SETTLED = Cl.uint(2);
export const STATUS_REJECTED = Cl.uint(3);
export const STATUS_UNRESOLVED = Cl.uint(4);
