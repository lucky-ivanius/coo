export const NAV_LINKS = [
  { label: "Verify", href: "/", external: false },
  // { label: "Vote", href: "/vote", external: false },
  { label: "Docs", href: process.env.NEXT_PUBLIC_DOCS_URL ?? "/docs", external: !!process.env.NEXT_PUBLIC_DOCS_URL },
] as const;
