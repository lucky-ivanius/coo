import type { Assertion } from "@/types/assertion";

export function bytesToText(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function truncateId(id: string): string {
  return `${id.slice(0, 8)}...${id.slice(-8)}`;
}

export function blocksToHuman(blocks: number, averageBlockTime: number): string {
  const seconds = blocks * averageBlockTime;

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
