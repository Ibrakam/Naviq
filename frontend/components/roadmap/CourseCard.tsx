import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useT } from "@/hooks/useT";
import type { CourseOut } from "@/types/api";

export function CourseCard({ course }: { course: CourseOut }) {
  const { t } = useT();
  const href = course.url ?? "";
  const isExternal = href.startsWith("http://") || href.startsWith("https://");
  const isInternal = href.startsWith("/");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{course.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-zinc-400">{course.provider}</p>
          <Badge variant="lime">{t("courses.difficulty", { value: course.difficulty })}</Badge>
        </div>
        {isExternal ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-cyan-300 hover:text-cyan-200"
          >
            {t("app.open")} <ExternalLink className="h-3 w-3" />
          </a>
        ) : isInternal ? (
          <Link href={href} className="inline-flex items-center gap-1 text-xs text-cyan-300 hover:text-cyan-200">
            {t("app.open")} <ExternalLink className="h-3 w-3" />
          </Link>
        ) : (
          <p className="text-xs text-zinc-500">{t("app.noData")}</p>
        )}
      </CardContent>
    </Card>
  );
}
