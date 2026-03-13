"use client";

import { Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";

interface AssertButtonProps {
  onClick?: () => void;
}

/** Desktop inline "+ Assert" button — hidden on mobile. */
export function AssertButton({ onClick }: AssertButtonProps) {
  return (
    <Button className="hidden shrink-0 sm:flex" size="sm" onClick={onClick}>
      <HugeiconsIcon icon={Add01Icon} className="size-4" strokeWidth={2} />
      Assert
    </Button>
  );
}

/** Mobile floating action button — hidden on desktop. */
export function AssertFab({ onClick }: AssertButtonProps) {
  return (
    <Button className="fixed right-6 bottom-6 size-14 rounded-full shadow-lg sm:hidden" size="icon" aria-label="Assert" onClick={onClick}>
      <HugeiconsIcon icon={Add01Icon} className="size-6" strokeWidth={2} />
    </Button>
  );
}
