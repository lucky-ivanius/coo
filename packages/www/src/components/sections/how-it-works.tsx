"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Alert02Icon, CheckListIcon, CheckmarkCircle02Icon, Clock01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useRef, useState } from "react";

const steps = [
  {
    num: "01",
    title: "Statement",
    body: "Anyone proposes a statement as true — a price, an event, a transaction. The protocol accepts it by default.",
    icon: CheckListIcon,
  },
  {
    num: "02",
    title: "Challenge Period",
    body: "A window opens for the world to review the statement. If nobody raises a hand, it passes as verified fact.",
    icon: Clock01Icon,
  },
  {
    num: "03",
    title: "Dispute",
    body: "Anyone who knows the truth can challenge the statement. The protocol only needs one honest person to catch a lie.",
    icon: Alert02Icon,
  },
  {
    num: "04",
    title: "Voting",
    body: "COO token holders are the final arbiters. When a dispute reaches this stage, the community votes — and their verdict is the truth.",
    icon: CheckmarkCircle02Icon,
  },
];

export function HowItWorks() {
  const [visible, setVisible] = useState<Set<number>>(new Set());
  const [active, setActive] = useState<number>(-1);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const trigger = window.innerHeight * 0.6;

    const update = () => {
      let newActive = -1;
      stepRefs.current.forEach((ref, i) => {
        if (!ref) return;
        const top = ref.getBoundingClientRect().top;
        if (top <= trigger) {
          newActive = i;
          setVisible((prev) => new Set([...prev, i]));
        }
      });
      setActive(newActive);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <section id="how-it-works" className="bg-background py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <div className="mb-20">
          <Badge variant="outline" className="border-primary text-primary uppercase tracking-widest font-mono text-xs px-3 py-1 mb-6">
            How It Works
          </Badge>
          <h2 className="text-4xl sm:text-6xl font-black font-mono uppercase leading-none tracking-tight text-foreground">
            Optimistic by design.
            <br />
            <span className="text-primary">Honest by default.</span>
          </h2>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical connector */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />
          {/* Active fill */}
          <div
            className="absolute left-6 top-0 w-px bg-primary transition-all duration-700 ease-out"
            style={{ height: active >= 0 ? `${((active + 1) / steps.length) * 100}%` : "0%" }}
          >
            <div
              className={cn(
                "absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 transition-opacity duration-300",
                active === steps.length - 1 ? "opacity-100" : "opacity-0"
              )}
            >
              <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-75" />
              <span className="relative block size-2 rounded-full bg-primary" />
            </div>
          </div>

          <div className="flex flex-col gap-14">
            {steps.map((step, i) => (
              <div
                key={step.num}
                ref={(el) => {
                  stepRefs.current[i] = el;
                }}
                className={cn("relative flex gap-8 transition-all duration-600", visible.has(i) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6")}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                {/* Node */}
                <div className="relative shrink-0 flex items-start pt-0.5">
                  <div
                    className={cn(
                      "size-12 rounded-full border-2 flex items-center justify-center transition-all duration-500 bg-background",
                      active >= i ? "border-primary" : "border-border"
                    )}
                  >
                    <HugeiconsIcon
                      icon={step.icon}
                      className={cn("size-6 transition-colors duration-500", active >= i ? "text-primary" : "text-muted-foreground")}
                    />
                  </div>
                  <span
                    className={cn(
                      "absolute -top-1 -right-1 font-mono text-[10px] font-bold px-1 py-0.5 rounded-sm transition-all duration-500",
                      active >= i ? "bg-primary text-primary-foreground" : "bg-border text-muted-foreground"
                    )}
                  >
                    {step.num}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 pb-2">
                  <div className="mb-2">
                    <h3 className="text-foreground font-bold text-lg sm:text-xl">{step.title}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-xl">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
