"use client";

import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

/** Dashboard-scoped error boundary — keeps the shell/nav intact on page errors. */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Card className="border-red-200 dark:border-red-900">
      <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <p className="font-semibold">This section failed to load</p>
        <p className="max-w-md text-sm text-muted-foreground">
          An error occurred while rendering this page. The rest of the dashboard is unaffected.
        </p>
        <Button onClick={reset} size="sm">Try again</Button>
      </CardContent>
    </Card>
  );
}
