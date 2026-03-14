export function truncateAddress(address: string): string {
  return `${address.slice(0, 8)}...${address.slice(-4)}`;
}
