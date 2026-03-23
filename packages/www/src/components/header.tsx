"use client";

import { ArrowUpRight01Icon, Menu01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "@/components/ui/sheet";
import { NAV_LINKS } from "@/consts/nav";

type NavLinkProps = (typeof NAV_LINKS)[number];

function NavLink({ label, href, external }: NavLinkProps) {
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="flex items-center gap-1 rounded-md px-3 py-1.5 font-medium text-sm transition-colors text-muted-foreground mix-blend-difference hover:text-muted-foreground/80"
    >
      {label}
      {external && <HugeiconsIcon icon={ArrowUpRight01Icon} strokeWidth={1.5} className="size-3.5 opacity-50" />}
    </Link>
  );
}

export function Header() {
  return (
    <header className="fixed top-0 z-40 w-full bg-transparent backdrop-blur-md supports-backdrop-filter:bg-transparent">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
        </nav>

        {/* Mobile: connect wallet + hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <Sheet>
            <SheetTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Open menu" />}>
              <HugeiconsIcon icon={Menu01Icon} strokeWidth={1.5} className="size-5 text-muted-foreground" />
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
