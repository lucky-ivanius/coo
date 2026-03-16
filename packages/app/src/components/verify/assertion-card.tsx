"use client";

import { Alert01Icon, CheckmarkCircle02Icon, HourglassIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import type { Assertion } from "@/types/assertion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";
import { Sheet } from "@/components/ui/sheet";
import { AssertionDetail } from "@/components/verify/assertion-detail";
import { AwaitingSettlementBadge, StatusBadge } from "@/components/verify/status-badge";
import { useDisputeAssertion, useSettleAssertion } from "@/hooks/use-assertion";
import { useAssertionCountdown } from "@/hooks/use-assertion-countdown";
import { getTransactionExplorerUrl } from "@/lib/explorer";
import { ASSERTION_STATUS } from "@/types/assertion";

export interface AssertionCardProps {
  assertion: Assertion;
  currentBlock: number;
}

export function AssertionCard({ assertion, currentBlock }: AssertionCardProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const blocksLeft = useAssertionCountdown(assertion, currentBlock);

  const awaitingSettlement = assertion.status === ASSERTION_STATUS.OPEN && blocksLeft === 0;
  const canDispute = assertion.status === ASSERTION_STATUS.OPEN && blocksLeft !== null && blocksLeft > 0;
  const disputed = assertion.status === ASSERTION_STATUS.DISPUTED;
  const settled = assertion.status === ASSERTION_STATUS.SETTLED;
  const rejected = assertion.status === ASSERTION_STATUS.REJECTED;

  const settleAssertion = useSettleAssertion(assertion);
  const disputeAssertion = useDisputeAssertion(assertion);

  const handleDispute = async () => {
    try {
      const result = await disputeAssertion.mutateAsync();

      toast.info("Transaction sent!", {
        description: (
          <span className="text-muted-foreground text-xs">
            Transaction ID:{" "}
            <Link target="_blank" href={getTransactionExplorerUrl(result.txid!)} className="underline">
              0x{result.txid}
            </Link>
          </span>
        ),
        position: "top-center",
      });
    } catch (e) {
      const error = e as Error;

      if (error.message.trim() === "User rejected request") {
        toast.error(<span className="text-destructive">Failed to send transaction</span>, {
          description: <span className="text-muted-foreground text-xs">{error.message ?? "Unknown error"}</span>,
          position: "top-center",
        });
      }
    }
  };

  const handleSettle = async () => {
    try {
      const result = await settleAssertion.mutateAsync();

      toast.info("Transaction sent!", {
        description: (
          <span className="text-muted-foreground text-xs">
            Transaction ID:{" "}
            <Link target="_blank" href={getTransactionExplorerUrl(result.txid!)} className="underline">
              0x{result.txid}
            </Link>
          </span>
        ),
        position: "top-center",
      });
    } catch (e) {
      const error = e as Error;

      if (error.message.trim() === "User rejected request") {
        toast.error(<span className="text-destructive">Failed to send transaction</span>, {
          description: <span className="text-muted-foreground text-xs">{error.message ?? "Unknown error"}</span>,
          position: "top-center",
        });
      }
    }
  };

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

                  return handleDispute();
                }}
                // TODO: Disable while wallet is not connected or tx is pending.
              >
                <HugeiconsIcon icon={Alert01Icon} className="size-4" strokeWidth={2} />
                Dispute
              </Button>
              <div className="flex items-center gap-1.5 font-mono text-muted-foreground text-xs">
                <HugeiconsIcon icon={HourglassIcon} className="size-3.5 shrink-0" strokeWidth={1.5} />
                <span className="tabular-nums">{blocksLeft} blocks remaining</span>
              </div>
            </>
          )}

          {awaitingSettlement && (
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();

                return handleSettle();
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
        <AssertionDetail assertion={assertion} currentBlock={currentBlock} blocksLeft={blocksLeft} onDispute={handleDispute} onSettle={handleSettle} />
      </Sheet>
    </>
  );
}
