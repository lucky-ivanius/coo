"use client";

import type { IconSvgElement } from "@hugeicons/react";
import {
  Alert01Icon,
  BitcoinShieldIcon,
  Blockchain01Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  HourglassIcon,
  InformationCircleIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import type { Assertion } from "@/types/assertion";
import { Button } from "@/components/ui/button";
import { SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AwaitingSettlementBadge, StatusBadge } from "@/components/verify/status-badge";
import { blocksToHuman, truncateId } from "@/lib/assertion";
import { formatSbtc } from "@/lib/format";
import { ASSERTION_STATUS } from "@/types/assertion";

// ── Meta row ─────────────────────────────────────────────────────────────────

function MetaRow({ icon, label, children, iconClassName }: { icon: IconSvgElement; label: string; children: React.ReactNode; iconClassName?: string }) {
  return (
    <div className="flex items-center gap-3">
      <HugeiconsIcon icon={icon} className={iconClassName ?? "size-5 shrink-0 text-muted-foreground"} strokeWidth={1.5} />
      <div className="min-w-0">
        <p className="text-muted-foreground text-xs">{label}</p>
        {children}
      </div>
    </div>
  );
}

// ── Liveness meta ─────────────────────────────────────────────────────────────

function LivenessMeta({ assertion }: { assertion: Assertion }) {
  return (
    <span className="text-sm">
      <span className="font-medium text-foreground">{assertion.liveness.toLocaleString()} blocks</span>
      <span className="text-muted-foreground"> ({blocksToHuman(assertion.liveness)})</span>
    </span>
  );
}

// ── Assertion detail ──────────────────────────────────────────────────────────

export interface AssertionDetailProps {
  assertion: Assertion;
  /**
   * Blocks remaining from useAssertionCountdown.
   * null = not OPEN; 0 = window expired.
   */
  blocksLeft: number | null;

  onDispute: () => void;
  onSettle: () => void;
}

export function AssertionDetail({ assertion, blocksLeft, onDispute, onSettle }: AssertionDetailProps) {
  // const [claimView, setClaimView] = useState<ClaimView>("text");

  const awaitingSettlement = assertion.status === ASSERTION_STATUS.OPEN && blocksLeft === 0;
  const canDispute = assertion.status === ASSERTION_STATUS.OPEN && blocksLeft !== null && blocksLeft > 0;

  return (
    <SheetContent side="right" className="flex flex-col gap-0 p-0 lg:w-[40vw] lg:max-w-[40vw]!">
      {/* Header */}
      <SheetHeader className="gap-2 border-border border-b px-5 py-4">
        <div className="flex flex-wrap items-center gap-2 pr-8">
          {awaitingSettlement ? <AwaitingSettlementBadge /> : <StatusBadge status={assertion.status} />}
        </div>
        <SheetTitle className="font-mono font-normal text-muted-foreground text-xs">{truncateId(assertion.id)}</SheetTitle>
        <SheetDescription className="sr-only">Full details for assertion {assertion.id}</SheetDescription>
      </SheetHeader>

      {/* Scrollable body */}
      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-5">
        {/* Claim */}
        <div>
          <div className="mb-2.5 flex items-center justify-between">
            <span className="font-medium text-muted-foreground text-xs uppercase tracking-wider">Claim</span>
            {/*<ClaimToggle view={claimView} onChange={setClaimView} />*/}
          </div>
          <p className="text-foreground text-sm leading-relaxed">{assertion.claim}</p>
          {/*{claimView === "text" ? (
          ) : (
            <code className="block break-all rounded-md bg-muted px-3 py-2.5 font-mono text-muted-foreground text-xs">
              0x{Buffer.from(new TextEncoder().encode(assertion.claim)).toString("hex")}
            </code>
          )}*/}
        </div>

        <div className="border-border/60 border-t" />

        {/* Metadata */}
        <div className="flex flex-col gap-3">
          <MetaRow icon={InformationCircleIcon} label="Identifier">
            <p className="text-sm">{assertion.identifier}</p>
          </MetaRow>

          <MetaRow icon={BitcoinShieldIcon} label="Bond">
            <p className="text-sm">
              <span className="font-medium">{assertion.bondSats.toLocaleString()} sats</span>
              <span className="text-muted-foreground"> · {formatSbtc(assertion.bondSats)} sBTC</span>
            </p>
          </MetaRow>

          <MetaRow icon={Clock01Icon} label="Liveness">
            <LivenessMeta assertion={assertion} />
          </MetaRow>

          <MetaRow icon={UserIcon} label="Asserter">
            <p className="cursor-default break-all font-mono text-sm" title={assertion.asserter}>
              {assertion.asserter}
            </p>
          </MetaRow>

          <MetaRow icon={Blockchain01Icon} label="Asserted at block">
            <p className="cursor-default break-all font-mono text-sm">{assertion.assertedAtBlock.toLocaleString()}</p>
          </MetaRow>

          {assertion.disputer && (
            <MetaRow icon={UserIcon} label="Disputer" iconClassName="size-5 shrink-0 text-yellow-600 dark:text-yellow-500">
              <p className="cursor-default break-all font-mono text-sm" title={assertion.disputer}>
                {assertion.disputer}
              </p>
            </MetaRow>
          )}

          {canDispute && blocksLeft !== null && blocksLeft > 0 && (
            <MetaRow icon={HourglassIcon} label="Dispute window closes in">
              <p className="font-medium font-mono text-foreground text-sm tabular-nums">{blocksLeft.toLocaleString()} blocks</p>
            </MetaRow>
          )}

          {assertion.disputedAtBlock && (
            <MetaRow icon={Alert01Icon} label="Disputed at block" iconClassName="size-5 shrink-0 text-yellow-600 dark:text-yellow-500">
              <p className="font-medium text-foreground text-sm tabular-nums">{assertion.disputedAtBlock.toLocaleString()}</p>
            </MetaRow>
          )}

          {assertion.settledAtBlock && (
            <MetaRow icon={CheckmarkCircle02Icon} label="Settled at block" iconClassName="size-5 shrink-0 text-green-600 dark:text-green-500">
              <p className="font-medium text-foreground text-sm tabular-nums">{assertion.settledAtBlock.toLocaleString()}</p>
            </MetaRow>
          )}

          {assertion.rejectedAtBlock && (
            <MetaRow icon={Alert01Icon} label="Rejected at block" iconClassName="size-5 shrink-0 text-destructive">
              <p className="font-medium text-foreground text-sm tabular-nums">{assertion.rejectedAtBlock.toLocaleString()}</p>
            </MetaRow>
          )}
        </div>
      </div>

      {canDispute && (
        <SheetFooter className="border-border border-t">
          <Button variant="destructive" className="w-full" onClick={onDispute}>
            <HugeiconsIcon icon={Alert01Icon} className="size-4" strokeWidth={2} />
            Dispute this assertion
          </Button>
        </SheetFooter>
      )}

      {awaitingSettlement && (
        <SheetFooter className="border-border border-t">
          <Button className="w-full" onClick={onSettle}>
            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4" strokeWidth={2} />
            Settle this assertion
          </Button>
        </SheetFooter>
      )}
    </SheetContent>
  );
}
