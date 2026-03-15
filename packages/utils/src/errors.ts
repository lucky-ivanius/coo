import { Cl } from "@stacks/transactions";

// 400 error codes
export const ERR_WINDOW_OPEN = Cl.uint(8400001);
export const ERR_WINDOW_CLOSED = Cl.uint(8400002);
export const ERR_INVALID_STATUS = Cl.uint(8400003);
export const ERR_TRANSFER_FAILED = Cl.uint(8400004);
export const ERR_ASSERTION_BOND_TOO_LOW = Cl.uint(8400100);
export const ERR_ASSERTION_INVALID_LIVENESS = Cl.uint(8400101);
// 403 error codes
export const ERR_NOT_CONTRACT_OWNER = Cl.uint(8403000);
export const ERR_NOT_ARBITER = Cl.uint(8403200);
// 404 error codes
export const ERR_ASSERTION_NOT_FOUND = Cl.uint(8404100);
export const ERR_ARBITER_NOT_FOUND = Cl.uint(8404200);
// 409 error codes
export const ERR_ASSERTION_ALREADY_EXISTS = Cl.uint(8409100);
export const ERR_ARBITER_ALREADY_EXISTS = Cl.uint(8409200);
// 500 error codes
export const ERR_SERIALIZATION_FAILED = Cl.uint(8500000);
