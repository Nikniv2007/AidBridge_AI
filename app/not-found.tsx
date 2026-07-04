import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <Logo />
      <p className="text-6xl font-bold text-brand-500">404</p>
      <h1 className="text-xl font-semibold">This page could not be found.</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        The page you're looking for doesn't exist or has moved.
      </p>
      <div className="flex gap-3">
        <Link href="/">
          <Button variant="outline">Back home</Button>
        </Link>
        <Link href="/dashboard/command-center">
          <Button>Open dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
