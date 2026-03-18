import { with0x } from "@stacks/common";

export const getTransactionExplorerUrl = (txId: string) => {
  return `${process.env.NEXT_PUBLIC_STACKS_EXPLORER_BASE_URL ?? "http://localhost:8000"}/txid/${with0x(txId)}?chain=${process.env.NEXT_PUBLIC_STACKS_NETWORK ?? "testnet"}&api=${process.env.NEXT_PUBLIC_STACKS_API_URL ?? "http://localhost:3999"}`;
};
