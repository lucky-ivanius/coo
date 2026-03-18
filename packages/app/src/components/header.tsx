"use client";

import { ArrowUpRight01Icon, Menu01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "@/components/ui/sheet";
import { NAV_LINKS } from "@/consts/nav";
import { useWallet } from "@/hooks/use-wallet";
import { cn } from "@/lib/utils";

import { ConnectWalletButton } from "./connect-wallet-button";
import { WalletProfileDialog } from "./wallet-profile-dialog";

type NavLinkProps = (typeof NAV_LINKS)[number];

function NavLink({ label, href, external }: NavLinkProps) {
  const pathname = usePathname();

  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={cn(
        "flex items-center gap-1 rounded-md px-3 py-1.5 font-medium text-muted-foreground text-sm transition-colors hover:text-primary/80",
        !external && pathname === href && "text-primary"
      )}
    >
      {label}
      {external && <HugeiconsIcon icon={ArrowUpRight01Icon} strokeWidth={1.5} className="size-3.5 opacity-50" />}
    </Link>
  );
}

export function Header() {
  const { connected } = useWallet();

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
        <div className="hidden md:flex">{connected ? <WalletProfileDialog /> : <ConnectWalletButton />}</div>

        {/* Mobile: connect wallet + hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          {connected ? <WalletProfileDialog size="sm" /> : <ConnectWalletButton size="sm" />}

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
