"use client";

import type { VariantProps } from "class-variance-authority";

import { useSbtcBalance, useStxBalance } from "@/hooks/use-balances";
import { useWallet } from "@/hooks/use-wallet";
import { formatSbtc, formatStx } from "@/lib/format";
import { truncateAddress } from "@/lib/wallet";

import type { buttonVariants } from "./ui/button";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogFooter, DialogTrigger } from "./ui/dialog";

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

  const networkLabel = network.replace(/^./, (c) => c.toUpperCase());

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button size={size} variant="ghost">
            {truncateAddress(stxAddress ?? "My Wallet")}
          </Button>
        }
      />
      <DialogContent showCloseButton={false} className="gap-0 overflow-hidden p-0">
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4">
          <div className="flex flex-col gap-1">
            <p className="font-semibold text-[10px] text-muted-foreground uppercase tracking-widest">Wallet</p>
            <p className="font-medium font-mono text-sm">{stxAddress ?? "—"}</p>
          </div>
          <span className="mt-0.5 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 font-semibold text-[10px] text-primary tracking-wide">
            {networkLabel}
          </span>
        </div>

        {/* Divider */}
        <div className="mx-5 h-px bg-border" />

        {/* Balances */}
        <div className="flex flex-col gap-3 px-5 py-4">
          <p className="font-semibold text-[10px] text-muted-foreground uppercase tracking-widest">Balances</p>
          <div className="flex gap-2">
            <BalanceCard label="STX" value={stxBalance !== undefined ? formatStx(stxBalance) : undefined} />
            <BalanceCard label="sBTC" value={sbtcBalance !== undefined ? formatSbtc(sbtcBalance) : undefined} />
          </div>
        </div>

        {/* Footer */}
        <div className="mx-5 h-px bg-border" />
        <DialogFooter className="px-5 py-4">
          <Button onClick={disconnect} variant="destructive" size="sm" className="w-full">
            Disconnect
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
