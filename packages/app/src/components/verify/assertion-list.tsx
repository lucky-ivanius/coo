"use client";

import type { Assertion } from "@/types/assertion";
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";
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
      <Empty>
        <EmptyTitle>No assertions found</EmptyTitle>
        <EmptyDescription>Assertions made on-chain will appear here.</EmptyDescription>
      </Empty>
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
