import { AssertionList } from "@/components/verify/assertion-list";

export default function VerifyPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="font-semibold text-2xl text-foreground">Assertions</h1>
        <p className="mt-1 text-muted-foreground text-sm">Review active assertions and dispute claims within their liveness window.</p>
      </div>

      <AssertionList />
    </main>
  );
}
