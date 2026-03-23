"use client";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApartmentIcon, ArrowLeftRightIcon, BitcoinTransactionIcon, Chart01Icon, SecurityCheckIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const tabs = [
  {
    id: "prediction",
    label: "Prediction Markets",
    icon: Chart01Icon,
    title: "Prediction Markets",
    desc: "Let users bet on real-world outcomes — elections, sports, any event. COO verifies the result. No middleman decides who wins.",
    claim: '"The Kansas City Chiefs beat the Philadelphia Eagles in Super Bowl LVII on February 12, 2023"',
  },
  {
    id: "defi",
    label: "DeFi Protocols",
    icon: BitcoinTransactionIcon,
    title: "DeFi Protocols",
    desc: "Trigger any financial action based on verified data — price levels, market conditions, expiry events — without relying on a single data source.",
    claim: '"Bitcoin\'s price was below $55,000 at midnight on March 15, 2024 per Coinbase"',
  },
  {
    id: "crosschain",
    label: "Cross-Chain",
    icon: ArrowLeftRightIcon,
    title: "Cross-Chain",
    desc: "Confirm that a transaction on another network actually happened — without trusting a third party to relay that information.",
    claim: '"Address 0xA1b2...F3d4 sent 1.0 ETH on Ethereum mainnet at block 19,204,811 (tx: 0x7f3a...9c2b)"',
  },
  {
    id: "insurance",
    label: "Insurance",
    icon: SecurityCheckIcon,
    title: "Insurance & Risk",
    desc: "Pay out automatically when a verifiable event occurs — a flight delay, a weather condition, a system failure. No manual review. No disputes over eligibility.",
    claim: '"Singapore Airlines flight SQ321 was delayed more than 3 hours on March 12, 2024 per FlightAware"',
  },
  {
    id: "rwa",
    label: "Real-World Assets",
    icon: ApartmentIcon,
    title: "Real-World Assets (RWA)",
    desc: "Bring verified real-world data on-chain — valuations, yields, ownership records — to settle and automate tokenized asset transactions.",
    claim: '"U.S. Treasury 6-month T-bill yield was 5.27% at auction on March 11, 2024 per TreasuryDirect"',
  },
];

export function ForBuilders() {
  return (
    <section id="for-builders" className="bg-secondary py-24 min-h-[80vh]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <div className="mb-20">
          <Badge variant="outline" className="border-primary text-primary uppercase tracking-widest font-mono text-xs px-3 py-1 mb-6">
            Launch with COO
          </Badge>
          <h2 className="text-6xl font-black font-mono uppercase leading-none tracking-tight text-foreground">
            Infrastructure for
            <br />
            <span className="text-primary">every product on Stacks.</span>
          </h2>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="prediction">
          <TabsList variant="line" className="flex-wrap w-full gap-1 mb-12">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="gap-2 font-mono text-xs uppercase tracking-wider px-4 py-2">
                <HugeiconsIcon icon={tab.icon} className="size-6 shrink-0" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id}>
              <div className="grid sm:grid-cols-2 gap-12 pt-12 sm:pt-0">
                {/* Description */}
                <div className="flex flex-col gap-4">
                  <h3 className="font-mono font-bold text-lg uppercase tracking-wide text-foreground">{tab.title}</h3>
                  <p className="text-muted-foreground text-base leading-relaxed">{tab.desc}</p>
                </div>

                {/* Claim */}
                <div className="flex flex-col gap-3">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-primary font-bold">Example</span>
                  <div className="rounded-lg border border-border bg-background/80 px-5 py-4 font-mono text-sm text-foreground leading-relaxed">
                    {tab.claim}
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
