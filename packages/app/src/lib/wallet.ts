export function truncateWallet(id: string): string {
  return `${id.slice(0, 6)}...${id.slice(-6)}`;
}
