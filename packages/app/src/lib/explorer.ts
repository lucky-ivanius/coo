import { with0x } from "@stacks/common";

export const getTransactionExplorerUrl = (txId: string) => {
  const searchParams = new URLSearchParams({
    chain: process.env.NEXT_PUBLIC_STACKS_NETWORK ?? "testnet",
    ...(process.env.NEXT_PUBLIC_STACKS_NETWORK === "devnet" ? { api: process.env.NEXT_PUBLIC_STACKS_API_BASE_URL } : {}),
  });

  return `${process.env.NEXT_PUBLIC_STACKS_EXPLORER_BASE_URL ?? "http://localhost:8000"}/txid/${with0x(txId)}?${searchParams}`;
};
