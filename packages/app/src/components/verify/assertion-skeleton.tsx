import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function AssertionCardSkeleton() {
  return (
    <Card className="gap-2 py-5">
      <CardHeader>
        {/* Status badge */}
        <Skeleton className="h-5 w-16 rounded-full" />
      </CardHeader>

      <CardContent>
        {/* Claim text */}
        <Skeleton className="h-4 w-full max-w-[80%]" />
      </CardContent>

      <CardFooter className="gap-3 pt-3">
        {/* Action button */}
        <Skeleton className="h-8 w-20 rounded-md" />
        {/* Blocks remaining */}
        <Skeleton className="h-4 w-36" />
      </CardFooter>
    </Card>
  );
}

export function AssertionListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <AssertionCardSkeleton key={i} />
      ))}
    </div>
  );
}
