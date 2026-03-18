"use client";

import { Alert01Icon, CheckmarkCircle02Icon, HourglassIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { bytesToAscii, hexToBytes, with0x } from "@stacks/common";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import type { Assertion } from "@coo/core";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AssertionDetail } from "@/components/verify/assertion-detail";
import { AwaitingSettlementBadge, StatusBadge } from "@/components/verify/status-badge";
import { useDisputeAssertion, useSettleAssertion } from "@/hooks/use-assertion";
import { useAssertionCountdown } from "@/hooks/use-assertion-countdown";
import { truncateId } from "@/lib/assertion";
import { getTransactionExplorerUrl } from "@/lib/explorer";

export interface AssertionCardProps {
  assertion: Assertion;
  currentBlock: number;
}

export function AssertionCard({ assertion, currentBlock }: AssertionCardProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const blocksLeft = useAssertionCountdown(assertion, currentBlock);

  const awaitingSettlement = assertion.status === "open" && blocksLeft === 0;
  const canDispute = assertion.status === "open" && blocksLeft !== null && blocksLeft > 0;
  const disputed = assertion.status === "disputed";
  const settled = assertion.status === "settled";
  const rejected = assertion.status === "rejected";
  const unresolved = assertion.status === "unresolved";

  const settleAssertion = useSettleAssertion(assertion);
  const disputeAssertion = useDisputeAssertion(assertion);

  const handleDispute = async () => {
    try {
      const result = await disputeAssertion.mutateAsync();

      if (!result.txid) {
        toast.info("Transaction sent!", {
          position: "top-center",
        });

        return;
      }

      toast.info("Transaction sent!", {
        description: (
          <span className="text-muted-foreground text-xs">
            Transaction ID:{" "}
            <Link target="_blank" rel="noopener noreferrer" href={getTransactionExplorerUrl(result.txid)} className="underline">
              {with0x(result.txid)}
            </Link>
          </span>
        ),
        position: "top-center",
      });
    } catch (e) {
      const message = e instanceof Error ? e.message.trim() : "Unknown error";

      if (message === "User rejected request") {
        toast.error(<span className="text-destructive">Failed to send transaction</span>, {
          description: <span className="text-muted-foreground text-xs">{message}</span>,
          position: "top-center",
        });
      }
    }
  };

  const handleSettle = async () => {
    try {
      const result = await settleAssertion.mutateAsync();

      if (!result.txid) {
        toast.info("Transaction sent!", {
          position: "top-center",
        });

        return;
      }

      toast.info("Transaction sent!", {
        description: (
          <span className="text-muted-foreground text-xs">
            Transaction ID:{" "}
            <Link target="_blank" rel="noopener noreferrer" href={getTransactionExplorerUrl(result.txid!)} className="underline">
              {with0x(result.txid)}
            </Link>
          </span>
        ),
        position: "top-center",
      });
    } catch (e) {
      const message = e instanceof Error ? e.message.trim() : "Unknown error";

      if (message === "User rejected request") {
        toast.error(<span className="text-destructive">Failed to send transaction</span>, {
          description: <span className="text-muted-foreground text-xs">{message}</span>,
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
          <p className="line-clamp-2 min-h-10 text-foreground text-sm leading-relaxed lg:line-clamp-1 lg:min-h-fit">
            {bytesToAscii(hexToBytes(assertion.claim))}
          </p>
        </CardContent>

        <CardFooter className="gap-3 pt-3">
          {/* Action button */}
          {canDispute && (
            <>
              <Button
                variant="destructive"
                size="sm"
                disabled={disputeAssertion.isPending}
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
              disabled={settleAssertion.isPending}
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
              Rejected at block <span className="font-medium text-foreground tabular-nums">{assertion.resolvedAtBlock?.toLocaleString()}</span>
            </p>
          )}

          {unresolved && (
            <p className="text-muted-foreground text-sm">
              Unresolved at block <span className="font-medium text-foreground tabular-nums">{assertion.resolvedAtBlock?.toLocaleString()}</span>
            </p>
          )}
        </CardFooter>
      </Card>

      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent side="right" className="flex flex-col gap-0 p-0 lg:w-[40vw] lg:max-w-[40vw]!">
          {/* Header */}
          <SheetHeader className="gap-2 border-border border-b px-5 py-4">
            <div className="flex flex-wrap items-center gap-2 pr-8">
              {awaitingSettlement ? <AwaitingSettlementBadge /> : <StatusBadge status={assertion.status} />}
            </div>
            <SheetTitle className="font-mono font-normal text-muted-foreground text-xs">
              <span className="inline sm:hidden">{truncateId(with0x(assertion.id))}</span>
              <span className="hidden sm:inline">{with0x(assertion.id)}</span>
            </SheetTitle>
            <SheetDescription className="sr-only">Full details for assertion {with0x(assertion.id)}</SheetDescription>
          </SheetHeader>

          {/* Scrollable body */}
          <AssertionDetail assertion={assertion} currentBlock={currentBlock} blocksLeft={blocksLeft} />

          {canDispute && (
            <SheetFooter className="border-border border-t">
              <Button variant="destructive" className="w-full" onClick={handleDispute} disabled={disputeAssertion.isPending}>
                <HugeiconsIcon icon={Alert01Icon} className="size-4" strokeWidth={2} />
                Dispute this assertion
              </Button>
            </SheetFooter>
          )}

          {awaitingSettlement && (
            <SheetFooter className="border-border border-t">
              <Button className="w-full" onClick={handleSettle} disabled={settleAssertion.isPending}>
                <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4" strokeWidth={2} />
                Settle this assertion
              </Button>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
