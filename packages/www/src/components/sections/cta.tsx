import { Button } from "@/components/ui/button";
import { ASSERT_APP_URL, DOCS_URL } from "@/consts/nav";
import { ArrowRight02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { Badge } from "../ui/badge";

export function Cta() {
  return (
    <section id="cta" className="relative w-full min-h-screen bg-primary overflow-hidden flex items-center justify-center">
      {/* Radial vignette — darker at edges */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, oklch(0.55 0.18 37.81 / 0.35) 100%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center flex flex-col items-center gap-10">
        {/* Eyebrow label */}
        <Badge variant="outline" className="border-primary-foreground text-primary-foreground uppercase tracking-widest font-mono text-xs px-3 py-1 mb-6">
          Start Building Today
        </Badge>

        {/* Headline */}
        <h2 className="font-mono font-black uppercase text-primary-foreground leading-[0.92] tracking-tight text-4xl sm:text-6xl">
          Bring real-world data onchain
        </h2>

        <p className="max-w-xl text-primary-foreground/80 font-mono text-sm sm:text-base leading-relaxed">
          Power your dApps with a decentralized truth machine. <br />
          Secure, scalable, and built for the Bitcoin economy
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col items-center gap-3">
          <Button
            size="lg"
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-mono font-semibold uppercase tracking-wider px-8 h-12 text-sm rounded-sm"
            render={
              <Link href={DOCS_URL} target="_blank" rel="noopener noreferrer">
                <span className="flex items-center gap-2">
                  Start Integrating
                  <HugeiconsIcon icon={ArrowRight02Icon} className="size-4" />
                </span>
              </Link>
            }
          />
          <Button
            size="lg"
            variant="ghost"
            className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground border border-primary-foreground/30 font-mono font-semibold uppercase tracking-wider px-8 h-12 text-sm rounded-sm"
            render={
              <Link href={ASSERT_APP_URL} target="_blank" rel="noopener noreferrer">
                View open assertions
              </Link>
            }
          />
        </div>
      </div>

      {/* Footer tagline */}
      <p className="absolute bottom-6 left-0 right-0 text-center font-mono text-xs uppercase tracking-widest text-primary-foreground">
        Built on Stacks, secured by Bitcoin
      </p>
    </section>
  );
}
