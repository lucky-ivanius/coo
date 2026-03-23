import { Cta } from "@/components/sections/cta";
import { ForBuilders } from "@/components/sections/for-builders";
import { Hero } from "@/components/sections/hero";
import { HowItWorks } from "@/components/sections/how-it-works";

export default function LandingPage() {
  return (
    <main className="flex flex-col">
      <Hero />
      <HowItWorks />
      <ForBuilders />
      <Cta />
    </main>
  );
}
