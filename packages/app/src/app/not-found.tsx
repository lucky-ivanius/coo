import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-8 px-4 py-32 sm:px-6">
      <div className="flex flex-col items-center justify-center">
        <p className="font-medium text-muted-foreground text-sm">404</p>
        <h1 className="mt-2 font-semibold text-2xl tracking-tight">Page not found</h1>
        <p className="mt-2 text-muted-foreground text-sm">The page you're looking for doesn't exist.</p>
      </div>
      <Button render={<Link href="/">Go home</Link>} />
    </main>
  );
}
