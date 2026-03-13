"use client";

import type { Assertion } from "@/types/assertion";
import { AssertionCard } from "@/components/verify/assertion-card";
import { useMockBlockHeight } from "@/hooks/use-mock-block-height";
import { useWallet } from "@/hooks/use-wallet";
import { MOCK_ASSERTIONS } from "@/lib/mock-data";

export interface AssertionListProps {
  /**
   * List of assertions to display.
   * TODO: Replace with data fetched from the Stacks API / indexer in integration.
   */
  assertions?: Assertion[];
}

export function AssertionList({ assertions = MOCK_ASSERTIONS }: AssertionListProps) {
  const { connected, connect } = useWallet();
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

  const handleDispute = (assertionId: string) => {
    if (!connected) return connect();

    window.alert(`Disputing assertion ${assertionId}`);
  };

  const handleSettle = (assertionId: string) => {
    if (!connected) return connect();

    window.alert(`Settling assertion ${assertionId}`);
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      {assertions.map((assertion) => (
        <AssertionCard key={assertion.id} assertion={assertion} currentBlock={currentBlock} onDispute={handleDispute} onSettle={handleSettle} />
      ))}
    </div>
  );
}
