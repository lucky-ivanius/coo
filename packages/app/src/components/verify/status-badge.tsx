import { Alert01Icon, CancelCircleIcon, CheckmarkCircle01Icon, Clock01Icon, HelpCircleIcon, InformationCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import type { AssertionStatus } from "@/types/assertion";
import { ASSERTION_STATUS } from "@/types/assertion";

import { Badge } from "../ui/badge";

const STATUS_CONFIG = {
  [ASSERTION_STATUS.OPEN]: {
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
  [ASSERTION_STATUS.UNRESOLVED]: {
    label: "Unresolved",
    className: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
    icon: HelpCircleIcon,
  },
} as const;

export function StatusBadge({ status }: { status: AssertionStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge className={config.className}>
      <HugeiconsIcon icon={config.icon} className="size-3" strokeWidth={2} />
      {config.label}
    </Badge>
  );
}

export function AwaitingSettlementBadge() {
  return (
    <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
      <HugeiconsIcon icon={Clock01Icon} className="size-3" strokeWidth={2} />
      Awaiting Settlement
    </Badge>
  );
}
