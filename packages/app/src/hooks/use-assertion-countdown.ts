"use client";

import { useEffect, useState } from "react";

import type { Assertion } from "@/types/assertion";
import { BLOCK_TIME_MS, getExpiryBlock } from "@/lib/assertion";
import { ASSERTION_STATUS } from "@/types/assertion";

/**
 * Returns a live countdown in milliseconds for an ASSERTED assertion's liveness window.
 *
 * - `null`  → not yet initialised (SSR / first render)
 * - `0`     → window has expired (awaiting settlement)
 * - `> 0`   → milliseconds remaining in the dispute window
 *
 * TODO: In integration, derive the actual expiry timestamp from block timestamps
 * via the Stacks API instead of approximating with BLOCK_TIME_MS from Date.now().
 */
export function useAssertionCountdown(assertion: Assertion, currentBlock: number): number | null {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (assertion.status !== ASSERTION_STATUS.ASSERTED) return;

    const blocksRemaining = getExpiryBlock(assertion) - currentBlock;

    if (blocksRemaining <= 0) {
      setTimeLeft(0);
      return;
    }

    const expiresAt = Date.now() + blocksRemaining * BLOCK_TIME_MS;
    const tick = () => setTimeLeft(Math.max(0, expiresAt - Date.now()));

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [assertion, currentBlock]);

  return timeLeft;
}
