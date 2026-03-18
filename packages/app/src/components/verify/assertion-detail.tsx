"use client";

import type { IconSvgElement } from "@hugeicons/react";
import {
  Alert01Icon,
  BitcoinReceiptIcon,
  BitcoinShieldIcon,
  Blockchain01Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  HelpCircleIcon,
  HourglassIcon,
  InformationCircleIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { bytesToAscii, hexToBytes, with0x } from "@stacks/common";
import Link from "next/link";

import type { Assertion } from "@coo/core";

import { useAverageBlockTime } from "@/hooks/use-block";
import { blocksToHuman } from "@/lib/assertion";
import { getTransactionExplorerUrl } from "@/lib/explorer";
import { formatSbtc } from "@/lib/format";

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

// ── Assertion detail ──────────────────────────────────────────────────────────

export interface AssertionDetailProps {
  assertion: Assertion;

  currentBlock: number;
  blocksLeft: number | null;
}

export function AssertionDetail({ assertion, currentBlock, blocksLeft }: AssertionDetailProps) {
  const { data: averageBlockTime } = useAverageBlockTime();

  return (
    <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-5">
      {/* Claim */}
      <div>
        <div className="mb-2.5 flex items-center justify-between">
          <span className="text-muted-foreground text-xs uppercase tracking-wider">Claim</span>
        </div>
        <p className="text-foreground text-sm leading-relaxed">{bytesToAscii(hexToBytes(assertion.claim))}</p>
      </div>

      <div className="border-border/60 border-t" />

      {/* Metadata */}
      <div className="flex flex-col gap-3">
        <MetaRow icon={BitcoinShieldIcon} label="Bond">
          <p className="font-mono text-sm">
            <span>{assertion.bondSats.toLocaleString()} sats</span>
            <span className="text-muted-foreground"> ≈ {formatSbtc(assertion.bondSats)} sBTC</span>
          </p>
        </MetaRow>

        <MetaRow icon={Clock01Icon} label="Liveness">
          <p className="font-mono text-sm">
            <span>{assertion.liveness.toLocaleString()} blocks</span>
            <span className="text-muted-foreground"> ({blocksToHuman(assertion.liveness, averageBlockTime ?? 5)})</span>
          </p>
        </MetaRow>

        <MetaRow icon={UserIcon} label="Asserter">
          <p className="cursor-default break-all font-mono text-sm" title={assertion.asserter}>
            {assertion.asserter}
          </p>
        </MetaRow>

        <MetaRow icon={Blockchain01Icon} label="Asserted at block">
          <p className="font-mono text-sm tabular-nums">{assertion.assertedAtBlock.toLocaleString()}</p>
        </MetaRow>

        <MetaRow icon={BitcoinReceiptIcon} label="Assertion Transaction ID">
          <Link
            target="_blank"
            rel="noopener noreferrer"
            href={getTransactionExplorerUrl(assertion.assertedTxId)}
            className="break-all font-mono text-sm underline"
          >
            {with0x(assertion.assertedTxId)}
          </Link>
        </MetaRow>

        {assertion.status === "open" && blocksLeft !== null && blocksLeft > 0 && (
          <MetaRow icon={HourglassIcon} label="Dispute window closes in">
            <p className="font-mono text-sm">
              <span>{(currentBlock + blocksLeft).toLocaleString()} </span>
              <span className="font-normal text-muted-foreground/70">≈ {blocksLeft.toLocaleString()} blocks remaining</span>
            </p>
          </MetaRow>
        )}

        {assertion.disputer && assertion.status === "disputed" && assertion.disputedAtBlock && assertion.disputedTxId && (
          <>
            <MetaRow icon={UserIcon} label="Disputer" iconClassName="size-5 shrink-0 text-yellow-600 dark:text-yellow-500">
              <p className="cursor-default break-all font-mono text-sm" title={assertion.disputer}>
                {assertion.disputer}
              </p>
            </MetaRow>
            <MetaRow icon={Alert01Icon} label="Disputed at block" iconClassName="size-5 shrink-0 text-yellow-600 dark:text-yellow-500">
              <p className="font-mono text-sm tabular-nums">{assertion.disputedAtBlock.toLocaleString()}</p>
            </MetaRow>
            <MetaRow icon={BitcoinReceiptIcon} label="Dispute Transaction ID" iconClassName="size-5 shrink-0 text-yellow-600 dark:text-yellow-500">
              <Link
                target="_blank"
                rel="noopener noreferrer"
                href={getTransactionExplorerUrl(assertion.disputedTxId)}
                className="break-all font-mono text-sm underline"
              >
                {with0x(assertion.disputedTxId)}
              </Link>
            </MetaRow>
          </>
        )}

        {assertion.resolver && assertion.resolvedAtBlock && assertion.resolvedTxId && (
          <>
            <MetaRow icon={UserIcon} label="Resolver" iconClassName="size-5 shrink-0">
              <p className="cursor-default break-all font-mono text-sm" title={assertion.resolver}>
                {assertion.resolver}
              </p>
            </MetaRow>

            <MetaRow icon={Alert01Icon} label="Resolved at block" iconClassName="size-5 shrink-0">
              <p className="font-mono text-sm tabular-nums">{assertion.resolvedAtBlock.toLocaleString()}</p>
            </MetaRow>

            <MetaRow icon={BitcoinReceiptIcon} label="Resolve Transaction ID" iconClassName="size-5 shrink-0">
              <Link
                target="_blank"
                rel="noopener noreferrer"
                href={getTransactionExplorerUrl(assertion.resolvedTxId)}
                className="break-all font-mono text-sm underline"
              >
                {with0x(assertion.resolvedTxId)}
              </Link>
            </MetaRow>
          </>
        )}

        {assertion.settler && assertion.status === "settled" && assertion.settledAtBlock && assertion.settledTxId && (
          <>
            <MetaRow icon={UserIcon} label="Settler" iconClassName="size-5 shrink-0 text-green-600 dark:text-green-500">
              <p className="cursor-default break-all font-mono text-sm" title={assertion.settler}>
                {assertion.settler}
              </p>
            </MetaRow>
            <MetaRow icon={CheckmarkCircle02Icon} label="Settled at block" iconClassName="size-5 shrink-0 text-green-600 dark:text-green-500">
              <p className="font-mono text-sm tabular-nums">{assertion.settledAtBlock.toLocaleString()}</p>
            </MetaRow>
            <MetaRow icon={BitcoinReceiptIcon} label="Settlement Transaction ID" iconClassName="size-5 shrink-0 text-green-600 dark:text-green-500">
              <Link
                target="_blank"
                rel="noopener noreferrer"
                href={getTransactionExplorerUrl(assertion.settledTxId)}
                className="break-all font-mono text-sm underline"
              >
                {with0x(assertion.settledTxId)}
              </Link>
            </MetaRow>
          </>
        )}
      </div>
    </div>
  );
}
