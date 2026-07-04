"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { AlertTriangle } from "lucide-react";

/** Root error boundary — keeps the app from hard-crashing on an unexpected error. */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production this would go to an error reporter.
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <Logo />
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        An unexpected error occurred. Your data is safe. You can try again, or head back to the dashboard.
      </p>
      {error.digest && (
        <code className="rounded bg-muted px-2 py-1 text-xs text-muted-foreground">ref: {error.digest}</code>
      )}
      <div className="flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" onClick={() => (window.location.href = "/dashboard/command-center")}>
          Back to dashboard
        </Button>
      </div>
    </div>
  );
}
