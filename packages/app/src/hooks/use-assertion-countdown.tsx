"use client";

import type { Assertion } from "@/types/assertion";
import { getExpiryBlock } from "@/lib/assertion";
import { ASSERTION_STATUS } from "@/types/assertion";

/**
 * Returns blocks remaining in an OPEN assertion's liveness window.
 *
 * - `null`  → assertion is not in OPEN status
 * - `0`     → window has expired (awaiting settlement)
 * - `> 0`   → blocks remaining in the dispute window
 *
 * Reacts to `currentBlock` updates from the block watcher.
 */
export function useAssertionCountdown(assertion: Assertion, currentBlock: number): number | null {
  if (assertion.status !== ASSERTION_STATUS.OPEN) return null;

  const blocksRemaining = getExpiryBlock(assertion) - currentBlock;
  return Math.max(0, blocksRemaining);
}
