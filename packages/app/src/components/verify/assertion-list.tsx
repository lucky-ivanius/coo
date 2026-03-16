"use client";

import type { Assertion } from "@/types/assertion";
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";
import { AssertionCard } from "@/components/verify/assertion-card";
import { useMockBlockHeight } from "@/hooks/use-mock-block-height";
import { MOCK_ASSERTIONS } from "@/lib/mock-data";

export interface AssertionListProps {
  assertions?: Assertion[];
}

export function AssertionList({ assertions = MOCK_ASSERTIONS }: AssertionListProps) {
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

  return (
    <div className="grid grid-cols-1 gap-4">
      {assertions.map((assertion) => (
        <AssertionCard key={assertion.id} assertion={assertion} currentBlock={currentBlock} />
      ))}
    </div>
  );
}
