const USTX_PER_STX = 1_000_000;
const SATS_PER_BTC = 100_000_000;

export const formatSbtc = (balance: number) => {
  return (balance / SATS_PER_BTC).toLocaleString(undefined, { maximumFractionDigits: 8 });
};

export const parseSbtc = (balance: string) => {
  return Number(balance.replace(/,/g, "")) * SATS_PER_BTC;
};

export const formatStx = (balance: number) => {
  return (balance / USTX_PER_STX).toLocaleString(undefined, { maximumFractionDigits: 6 });
};

export const parseStx = (balance: string) => {
  return Number(balance.replace(/,/g, "")) * USTX_PER_STX;
};
