"use client";

import type { Assertion } from "@coo/core";

import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";
import { AssertionCard } from "@/components/verify/assertion-card";

export interface AssertionListProps {
  assertions: Assertion[];
  currentBlock: number;
}

export function AssertionList({ assertions, currentBlock }: AssertionListProps) {
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
