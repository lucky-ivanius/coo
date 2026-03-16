import type { StacksNetworkName } from "@stacks/network";

export const getSbtcAddress = (network: StacksNetworkName) => {
  switch (network) {
    case "mainnet":
      return "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token";
    case "testnet":
      return "ST1F7QA2MDF17S807EPA36TSS8AMEFY4KA9TVGWXT.sbtc-token";
    case "devnet":
      return process.env.NEXT_PUBLIC_DEVNET_SBTC_ADDRESS! as `${string}.sbtc-token`;
    default:
      return "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token";
  }
};
