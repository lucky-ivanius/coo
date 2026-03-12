"use client";

import { ArrowUpRight01Icon, Menu01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ConnectWalletButton } from "@/components/connect-wallet-button";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Verify", href: "/" },
  { label: "Vote", href: "/vote" },
  { label: "Docs", href: "https://docs.clarityoracle.xyz", external: true },
];

function NavLink({ label, href, external }: (typeof NAV_LINKS)[number]) {
  const pathname = usePathname();

  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={cn(
        "flex items-center gap-1 rounded-md px-3 py-1.5 font-medium text-muted-foreground text-sm transition-colors hover:text-primary/70",
        !external && pathname === href && "text-primary"
      )}
    >
      {label}
      {external && <HugeiconsIcon icon={ArrowUpRight01Icon} strokeWidth={1.5} className="size-3.5 opacity-50" />}
    </Link>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-border/60 border-b bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
        </nav>

        {/* Desktop: connect wallet */}
        <div className="hidden md:flex">
          <ConnectWalletButton />
        </div>

        {/* Mobile: connect wallet + hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <ConnectWalletButton size="sm" />

          <Sheet>
            <SheetTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Open menu" />}>
              <HugeiconsIcon icon={Menu01Icon} strokeWidth={1.5} className="size-5" />
            </SheetTrigger>

            <SheetContent side="right" className="w-64">
              <SheetHeader className="border-border/60 border-b">
                <Logo />
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-2 pt-2">
                {NAV_LINKS.map((link) => (
                  <NavLink key={link.href} {...link} />
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
