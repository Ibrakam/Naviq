"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useT } from "@/hooks/useT";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useT();
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl items-center justify-center p-4">
        <Card className="w-full">
        <CardHeader>
          <CardTitle>{t("errors.appCrashedTitle")}</CardTitle>
          <CardDescription>{t("errors.appCrashedDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button onClick={() => reset()}>{t("errors.retry")}</Button>
          <Button variant="outline" asChild>
            <a href="/dashboard">{t("errors.goDashboard")}</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
