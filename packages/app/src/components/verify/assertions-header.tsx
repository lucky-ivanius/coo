"use client";

import { useState } from "react";

import { AssertButton, AssertFab } from "@/components/verify/assert-button";
import { AssertDialog } from "@/components/verify/assert-dialog";

export function AssertionsHeader() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-semibold text-2xl text-foreground">Assertions</h1>
          <p className="mt-1 text-muted-foreground text-sm">Review active assertions and dispute claims within their liveness window.</p>
        </div>
        <AssertButton onClick={() => setDialogOpen(true)} />
      </div>

      <AssertFab onClick={() => setDialogOpen(true)} />

      <AssertDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
