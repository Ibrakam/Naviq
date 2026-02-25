"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminError({
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
    <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl items-center justify-center p-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Admin page failed</CardTitle>
          <CardDescription>
            The admin interface hit a runtime error. Retry this segment.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button onClick={() => reset()}>Retry</Button>
          <Button variant="outline" asChild>
            <a href="/admin/dashboard">Back to admin dashboard</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
