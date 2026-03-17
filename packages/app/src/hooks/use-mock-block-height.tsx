"use client";

import { useEffect, useState } from "react";

import { MOCK_CURRENT_BLOCK } from "@/lib/mock-data";

/**
 * Mock block watcher: starts at MOCK_CURRENT_BLOCK and decrements by 1 every 5 seconds.
 * Replace with a real Stacks API subscription in integration.
 */
export function useMockBlockHeight(): number {
  const [block, setBlock] = useState(MOCK_CURRENT_BLOCK);

  useEffect(() => {
    const id = setInterval(() => setBlock((b) => b + 1), 5_000);
    return () => clearInterval(id);
  }, []);

  return block;
}
