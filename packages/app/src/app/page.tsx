import { AssertionList } from "@/components/verify/assertion-list";
import { AssertionsHeader } from "@/components/verify/assertions-header";
import { assertionApi } from "@/lib/api";

export default async function VerifyPage() {
  const res = await assertionApi.index.$get();
  const data = res.ok ? await res.json() : [];

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <AssertionsHeader />
      <AssertionList initialAssertions={data} />
    </main>
  );
}
