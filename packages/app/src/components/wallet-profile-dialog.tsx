import type { VariantProps } from "class-variance-authority";

import { useWallet } from "@/hooks/use-wallet";
import { truncateAddress } from "@/lib/wallet";

import type { buttonVariants } from "./ui/button";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";

type Props = {
  size?: VariantProps<typeof buttonVariants>["size"];
};

export function WalletProfileDialog({ size = "default" }: Props) {
  const { disconnect, stxAddress, network } = useWallet();

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button size={size} variant="ghost">
            {truncateAddress(stxAddress ?? "My Wallet")}
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{truncateAddress(stxAddress ?? "My Wallet")}</DialogTitle>
          <DialogDescription className="text-xs">{network.replace(/^./, (char) => char.toUpperCase())}</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button onClick={disconnect} variant="destructive">
            Disconnect
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
