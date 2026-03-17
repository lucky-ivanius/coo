export const getTransactionExplorerUrl = (txId: string) => {
  return `${process.env.NEXT_PUBLIC_STACKS_EXPLORER_BASE_URL ?? "http://localhost:8000"}/txid/0x${txId}?chain=${process.env.NEXT_PUBLIC_STACKS_NETWORK ?? "testnet"}&api=${process.env.NEXT_PUBLIC_STACKS_API_URL ?? "http://localhost:3999"}`;
};
