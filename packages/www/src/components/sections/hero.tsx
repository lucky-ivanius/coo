import { ArrowDown02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Badge } from "../ui/badge";

export const Hero = () => {
  return (
    <section id="hero" className="relative bg-zinc-900 w-full overflow-hidden">
      {/* Subtle grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "86px 86px",
        }}
      />
      {/* Radial glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-150 w-150 rounded-full bg-primary/10 blur-[120px]" />
      </div>
      {/* Arrow navigation */}
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2">
        <HugeiconsIcon icon={ArrowDown02Icon} className="size-10 text-muted-foreground/60" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-center justify-center min-h-screen gap-6 text-center">
          {/* Badge */}
          <Badge variant="outline" className="border-primary text-primary uppercase tracking-widest font-mono text-xs px-3 py-1 gap-2">
            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
            Secured by Bitcoin
          </Badge>

          <h1 className="text-primary text-7xl sm:text-8xl font-black font-mono uppercase leading-none tracking-tight">Truth Onchain</h1>

          <p className="text-muted-foreground text-base leading-relaxed font-semibold">COO let anyone assert any verifiable claim or data on-chain.</p>
        </div>
      </div>
    </section>
  );
};
