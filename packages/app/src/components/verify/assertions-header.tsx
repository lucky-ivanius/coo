"use client";

import { useState } from "react";

import { AssertButton, AssertFab } from "@/components/verify/assert-button";
import { AssertDialog } from "@/components/verify/assert-dialog";
import { useWallet } from "@/hooks/use-wallet";

export function AssertionsHeader() {
  const { connected, connect } = useWallet();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpenAssertionDialog = () => {
    if (!connected) return connect();

    setDialogOpen(true);
  };

  return (
    <>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-semibold text-2xl text-foreground">Assertions</h1>
          <p className="mt-1 text-muted-foreground text-sm">Review active assertions and dispute claims within their liveness window.</p>
        </div>
        <AssertButton onClick={handleOpenAssertionDialog} />
      </div>

      <AssertFab onClick={handleOpenAssertionDialog} />

      <AssertDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
