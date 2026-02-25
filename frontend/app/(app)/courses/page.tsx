"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import { api } from "@/lib/api";
import type { CourseOut } from "@/types/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useT } from "@/hooks/useT";

export default function CoursesPage() {
  const { t } = useT();
  const [courses, setCourses] = useState<CourseOut[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<CourseOut[]>("/courses/")
      .then(setCourses)
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("courses.title")}</CardTitle>
          <CardDescription>{t("courses.subtitle")}</CardDescription>
        </CardHeader>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="py-8 text-sm text-zinc-400">{t("courses.loadingCourses")}</CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Link key={course.id} href={`/courses/${course.id}`}>
              <Card className="h-full transition hover:border-cyan-300/30 hover:bg-white/[0.06]">
                <CardHeader>
                  <CardTitle className="line-clamp-1 text-base">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{course.description || t("courses.noDescription")}</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between text-sm text-zinc-400">
                  <span>{t("courses.difficulty", { value: course.difficulty })}</span>
                  <BookOpen className="h-4 w-4 text-cyan-300" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
