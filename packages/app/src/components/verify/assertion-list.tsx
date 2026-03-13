"use client";

import type { Assertion } from "@/types/assertion";
import { AssertionCard } from "@/components/verify/assertion-card";
import { useMockBlockHeight } from "@/hooks/use-mock-block-height";
import { MOCK_ASSERTIONS } from "@/lib/mock-data";

export interface AssertionListProps {
  /**
   * List of assertions to display.
   * TODO: Replace with data fetched from the Stacks API / indexer in integration.
   */
  assertions?: Assertion[];
  /**
   * Called when the user initiates a dispute on an assertion.
   * TODO: Wire to contract `dispute()` call in integration.
   */
  onDispute?: (assertionId: string) => void;
  /**
   * Called when the user initiates settlement on an assertion.
   * TODO: Wire to contract `settle()` call in integration.
   */
  onSettle?: (assertionId: string) => void;
}

export function AssertionList({ assertions = MOCK_ASSERTIONS, onDispute, onSettle }: AssertionListProps) {
  // TODO: Replace with real Stacks block watcher in integration.
  const currentBlock = useMockBlockHeight();

  if (assertions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-border border-dashed py-16 text-center">
        <p className="font-medium text-foreground">No assertions found</p>
        <p className="mt-1 text-muted-foreground text-sm">Assertions made on-chain will appear here.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {assertions.map((assertion) => (
        <AssertionCard key={assertion.id} assertion={assertion} currentBlock={currentBlock} onDispute={onDispute} onSettle={onSettle} />
      ))}
    </div>
  );
}
