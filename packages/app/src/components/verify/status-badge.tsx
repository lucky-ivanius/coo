import { Alert01Icon, CancelCircleIcon, CheckmarkCircle01Icon, Clock01Icon, InformationCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import type { AssertionStatus } from "@/types/assertion";
import { cn } from "@/lib/utils";
import { ASSERTION_STATUS } from "@/types/assertion";

const STATUS_CONFIG = {
  [ASSERTION_STATUS.ASSERTED]: {
    label: "Open",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    icon: InformationCircleIcon,
  },
  [ASSERTION_STATUS.DISPUTED]: {
    label: "Disputed",
    className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    icon: Alert01Icon,
  },
  [ASSERTION_STATUS.SETTLED]: {
    label: "Settled",
    className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    icon: CheckmarkCircle01Icon,
  },
  [ASSERTION_STATUS.REJECTED]: {
    label: "Rejected",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    icon: CancelCircleIcon,
  },
} as const;

export function StatusBadge({ status }: { status: AssertionStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-medium text-xs", config.className)}>
      <HugeiconsIcon icon={config.icon} className="size-3" strokeWidth={2} />
      {config.label}
    </span>
  );
}

export function AwaitingSettlementBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 font-medium text-amber-700 text-xs dark:bg-amber-900/30 dark:text-amber-400">
      <HugeiconsIcon icon={Clock01Icon} className="size-3" strokeWidth={2} />
      Awaiting Settlement
    </span>
  );
}
