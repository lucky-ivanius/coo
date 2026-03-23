import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <span className="font-bold font-mono text-xs tracking-tighter">COO</span>
      </div>
      <span className="sr-only">Clarity Optimistic Oracle</span>
    </Link>
  );
}
