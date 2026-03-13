import type { Assertion } from "@/types/assertion";

/** Stacks block time in milliseconds (~5 seconds per block). */
export const BLOCK_TIME_MS = 5_000;

const SATS_PER_BTC = 100_000_000;

export function bytesToText(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function satsToSbtc(sats: number): string {
  return (sats / SATS_PER_BTC).toFixed(8).replace(/\.?0+$/, "");
}

export function truncateAddress(address: string): string {
  return `${address.slice(0, 8)}...${address.slice(-4)}`;
}

export function truncateId(id: string): string {
  return `${id.slice(0, 8)}...${id.slice(-8)}`;
}

/** Converts blocks to a human-readable duration at ~5s per Stacks block. */
export function blocksToHuman(blocks: number): string {
  const seconds = blocks * 5;

  if (seconds < 60) return `~${seconds}s`;
  if (seconds < 3_600) return `~${Math.round(seconds / 60)}m`;
  if (seconds < 86_400) return `~${(seconds / 3_600).toFixed(1).replace(/\.0$/, "")}h`;
  return `~${(seconds / 86_400).toFixed(1)}d`;
}

export function getExpiryBlock(assertion: Assertion): number {
  return assertion.assertedAtBlock + assertion.liveness;
}

/** Mirrors contract: (>= expiry-block stacks-block-height) */
export function isWindowOpen(assertion: Assertion, currentBlock: number): boolean {
  return getExpiryBlock(assertion) >= currentBlock;
}
