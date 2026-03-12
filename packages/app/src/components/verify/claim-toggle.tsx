"use client";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { cn } from "@/lib/utils";

export type ClaimView = "text" | "hex";

export function ClaimToggle({ view, onChange }: { view: ClaimView; onChange: (v: ClaimView) => void }) {
  return (
    <ButtonGroup>
      {(["text", "hex"] as ClaimView[]).map((v, i) => (
        <Button
          key={v}
          type="button"
          size="xs"
          variant={view === v ? "outline" : "secondary"}
          onClick={() => onChange(v)}
          className={cn(view === v && "hover:bg-background")}
        >
          {v}
        </Button>
      ))}
    </ButtonGroup>
  );
}
