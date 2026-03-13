import type { VariantProps } from "class-variance-authority";
import { Wallet01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import type { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/use-wallet";

type Props = {
  size?: VariantProps<typeof buttonVariants>["size"];
};

export function ConnectWalletButton({ size = "default" }: Props) {
  const { connect } = useWallet();

  return (
    <Button size={size} className="gap-2 font-medium" onClick={connect}>
      <HugeiconsIcon icon={Wallet01Icon} strokeWidth={1.5} className="size-4" />
      Connect Wallet
    </Button>
  );
}
