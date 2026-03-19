import { AssertionList } from "@/components/verify/assertion-list";
import { AssertionsHeader } from "@/components/verify/assertions-header";
import { getAssertions } from "@/lib/api";

export default async function VerifyPage() {
  const data = await getAssertions();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <AssertionsHeader />
      <AssertionList initialAssertions={data} />
    </main>
  );
}
