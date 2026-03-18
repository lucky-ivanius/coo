export const NAV_LINKS = [
  { label: "Verify", href: "/" },
  // { label: "Vote", href: "/vote" },
  { label: "Docs", href: process.env.NEXT_PUBLIC_DOCS_URL ?? "/docs", external: !!process.env.NEXT_PUBLIC_DOCS_URL },
] as const;
