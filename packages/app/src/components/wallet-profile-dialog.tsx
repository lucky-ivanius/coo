"use client";

import type { VariantProps } from "class-variance-authority";
import { UserIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { toast } from "sonner";

import { useArbiter } from "@/hooks/use-arbiter";
import { useSbtcBalance, useStxBalance } from "@/hooks/use-balances";
import { useWallet } from "@/hooks/use-wallet";
import { formatSbtc, formatStx } from "@/lib/format";
import { cn } from "@/lib/utils";
import { truncateAddress } from "@/lib/wallet";

import type { buttonVariants } from "./ui/button";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Separator } from "./ui/separator";

type Props = {
  size?: VariantProps<typeof buttonVariants>["size"];
};

function BalanceCard({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div className="flex flex-1 flex-col gap-1 rounded-lg bg-muted/60 px-4 py-3">
      <span className="font-semibold text-[10px] text-muted-foreground tracking-widest">{label}</span>
      <span className="font-medium font-mono text-xl tabular-nums">{value ?? "—"}</span>
    </div>
  );
}

export function WalletProfileDialog({ size = "default" }: Props) {
  const { disconnect, stxAddress, network } = useWallet();
  const { data: stxBalance } = useStxBalance(stxAddress);
  const { data: sbtcBalance } = useSbtcBalance(stxAddress);
  const { isArbiter } = useArbiter();

  const networkLabel = network.replace(/^./, (c) => c.toUpperCase());

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button size={size} variant="ghost">
            <HugeiconsIcon icon={UserIcon} className="size-5 text-primary" />
            {truncateAddress(stxAddress ?? "My Wallet")}
          </Button>
        }
      />
      <DialogContent showCloseButton={false} className="min-w-[30vw]">
        {/* Header */}
        <DialogHeader className="w-full flex-row items-start justify-between">
          <div className="flex flex-col gap-1">
            <DialogTitle className="font-semibold text-muted-foreground text-xs uppercase tracking-widest">Wallet</DialogTitle>
            <DialogDescription className="font-medium font-mono text-foreground text-sm">
              <Button
                variant="link"
                size="sm"
                className="p-0"
                onClick={async () => {
                  if (!stxAddress) return;

                  await navigator.clipboard.writeText(stxAddress);

                  toast.info("Address copied to clipboard", { position: "top-center" });
                }}
              >
                {stxAddress ?? "—"}
              </Button>{" "}
              {isArbiter && <Badge>Arbiter</Badge>}
            </DialogDescription>
          </div>
          <Badge variant="secondary">{networkLabel}</Badge>
        </DialogHeader>

        {/* Balances */}
        <div className="flex flex-col gap-3">
          <p className="font-semibold text-muted-foreground text-xs uppercase tracking-widest">Balances</p>
          <div className="flex gap-2">
            <BalanceCard label="STX" value={stxBalance !== undefined ? formatStx(stxBalance) : undefined} />
            <BalanceCard label="sBTC" value={sbtcBalance !== undefined ? formatSbtc(sbtcBalance) : undefined} />
          </div>
        </div>

        {/* Footer */}
        <Separator orientation="horizontal" />
        <DialogFooter showCloseButton={true} className="flex-col sm:flex-col">
          <Button onClick={disconnect} variant="destructive" className="w-full">
            Disconnect
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
