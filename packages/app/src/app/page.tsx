"use client";

import { AssertionList } from "@/components/verify/assertion-list";
import { AssertionListSkeleton } from "@/components/verify/assertion-skeleton";
import { AssertionsHeader } from "@/components/verify/assertions-header";
import { useGetAssertions } from "@/hooks/use-assertion";

export default function VerifyPage() {
  const { data: assertions, isLoading } = useGetAssertions();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <AssertionsHeader />
      {isLoading ? <AssertionListSkeleton /> : <AssertionList initialAssertions={assertions ?? []} />}
    </main>
  );
}
