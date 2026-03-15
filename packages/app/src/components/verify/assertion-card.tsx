"use client";

import { Alert01Icon, CheckmarkCircle02Icon, HourglassIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";

import type { Assertion } from "@/types/assertion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";
import { Sheet } from "@/components/ui/sheet";
import { AssertionDetail } from "@/components/verify/assertion-detail";
import { AwaitingSettlementBadge, StatusBadge } from "@/components/verify/status-badge";
import { useAssertionCountdown } from "@/hooks/use-assertion-countdown";
import { ASSERTION_STATUS } from "@/types/assertion";

export interface AssertionCardProps {
  assertion: Assertion;
  /**
   * Current Stacks block height.
   * TODO: Provide from Stacks API / wallet context in integration.
   */
  currentBlock: number;
  /**
   * Called when the user clicks "Dispute".
   * TODO: Wire to contract `dispute()` call in integration.
   */
  onDispute?: (assertionId: string) => void;
  /**
   * Called when the user clicks "Settle".
   * TODO: Wire to contract `settle()` call in integration.
   */
  onSettle?: (assertionId: string) => void;
}

export function AssertionCard({ assertion, currentBlock, onDispute, onSettle }: AssertionCardProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const blocksLeft = useAssertionCountdown(assertion, currentBlock);

  const awaitingSettlement = assertion.status === ASSERTION_STATUS.OPEN && blocksLeft === 0;
  const canDispute = assertion.status === ASSERTION_STATUS.OPEN && blocksLeft !== null && blocksLeft > 0;
  const disputed = assertion.status === ASSERTION_STATUS.DISPUTED;
  const settled = assertion.status === ASSERTION_STATUS.SETTLED;
  const rejected = assertion.status === ASSERTION_STATUS.REJECTED;

  return (
    <>
      <Card onClick={() => setDetailOpen(true)} className="cursor-pointer gap-2 py-5 transition-shadow hover:shadow-md">
        <CardHeader>
          <CardDescription>{awaitingSettlement ? <AwaitingSettlementBadge /> : <StatusBadge status={assertion.status} />}</CardDescription>
        </CardHeader>

        <CardContent>
          <p className="line-clamp-2 min-h-10 text-foreground text-sm leading-relaxed lg:line-clamp-1 lg:min-h-fit">{assertion.claim}</p>
        </CardContent>

        <CardFooter className="gap-3 pt-3">
          {/* Action button */}
          {canDispute && (
            <>
              <Button
                variant="destructive"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();

                  onDispute?.(assertion.id);
                }}
                // TODO: Disable while wallet is not connected or tx is pending.
              >
                <HugeiconsIcon icon={Alert01Icon} className="size-4" strokeWidth={2} />
                Dispute
              </Button>
              <div className="flex items-center gap-1.5 font-mono text-muted-foreground text-xs">
                <HugeiconsIcon icon={HourglassIcon} className="size-3.5 shrink-0" strokeWidth={1.5} />
                <span className="tabular-nums">{blocksLeft} blocks</span>
              </div>
            </>
          )}

          {awaitingSettlement && (
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onSettle?.(assertion.id);
              }}
              // TODO: Disable while wallet is not connected or tx is pending.
            >
              <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4" strokeWidth={2} />
              Settle
            </Button>
          )}

          {disputed && (
            <p className="text-muted-foreground text-sm">
              Disputed at block <span className="font-medium text-foreground tabular-nums">{assertion.disputedAtBlock?.toLocaleString()}</span>
            </p>
          )}

          {settled && (
            <p className="text-muted-foreground text-sm">
              Settled at block <span className="font-medium text-foreground tabular-nums">{assertion.settledAtBlock?.toLocaleString()}</span>
            </p>
          )}

          {rejected && (
            <p className="text-muted-foreground text-sm">
              Rejected at block <span className="font-medium text-foreground tabular-nums">{assertion.rejectedAtBlock?.toLocaleString()}</span>
            </p>
          )}
        </CardFooter>
      </Card>
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        {/* ── Detail sheet ── */}
        <AssertionDetail assertion={assertion} blocksLeft={blocksLeft} onDispute={onDispute} onSettle={onSettle} />
      </Sheet>
    </>
  );
}
