import { Cl } from "@stacks/transactions";

export const ERR_ASSERTION_ALREADY_EXISTS = Cl.uint(409100);
export const ERR_ASSERTION_BOND_TOO_LOW = Cl.uint(400103);
export const ERR_ASSERTION_INVALID_LIVENESS = Cl.uint(400104);
export const ERR_WINDOW_OPEN = Cl.uint(400001);
export const ERR_WINDOW_CLOSED = Cl.uint(400002);
export const ERR_INVALID_STATUS = Cl.uint(400003);
export const ERR_TRANSFER_FAILED = Cl.uint(400004);
export const ERR_UNAUTHORIZED = Cl.uint(401001);
export const ERR_ASSERTION_NOT_FOUND = Cl.uint(404101);
export const ERR_SERIALIZATION_FAILED = Cl.uint(500001);
