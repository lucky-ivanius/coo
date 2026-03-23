export const DOCS_URL = process.env.NEXT_PUBLIC_DOCS_URL ?? "/docs";
export const ASSERT_APP_URL = process.env.NEXT_PUBLIC_ASSERT_APP_URL ?? "/app";

export const NAV_LINKS = [
  { label: "How it works", href: "#how-it-works", external: false },
  { label: "For builders", href: "#for-builders", external: false },
  { label: "Docs", href: DOCS_URL, external: process.env.NEXT_PUBLIC_DOCS_URL ?? true },
] as const;
