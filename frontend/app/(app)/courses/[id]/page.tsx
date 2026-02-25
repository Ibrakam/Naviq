"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ExternalLink, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useT } from "@/hooks/useT";
import { api } from "@/lib/api";
import type { CourseLessonOut, CourseOut, HomeworkSubmissionOut } from "@/types/api";

function toYouTubeEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const raw = url.trim();
  if (!raw) return null;
  try {
    const parsed = new URL(raw);
    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.replace("/", "");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
      if (parsed.pathname.startsWith("/embed/")) return raw;
    }
  } catch {
    return null;
  }
  return null;
}

function normalizeScore10(score: number | null | undefined): number | null {
  if (typeof score !== "number") return null;
  if (score > 10) return Math.max(1, Math.min(10, Math.round(score / 10)));
  return Math.max(1, Math.min(10, Math.round(score)));
}

export default function CourseDetailPage() {
  const { t } = useT();
  const params = useParams<{ id: string }>();
  const rawId = params.id;
  const courseId = Array.isArray(rawId) ? rawId[0] : rawId;

  const [course, setCourse] = useState<CourseOut | null>(null);
  const [lessons, setLessons] = useState<CourseLessonOut[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submittingLessonId, setSubmittingLessonId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sortedLessons = useMemo(
    () => [...lessons].sort((a, b) => a.order - b.order),
    [lessons],
  );

  useEffect(() => {
    if (!courseId) return;
    setLoading(true);
    Promise.all([
      api.get<CourseOut>(`/courses/${courseId}`),
      api.get<CourseLessonOut[]>(`/courses/${courseId}/lessons`),
    ])
      .then(([courseData, lessonData]) => {
        setCourse(courseData);
        setLessons(lessonData);
        setError(null);
      })
      .catch((err) => {
        setCourse(null);
        setLessons([]);
        setError(err instanceof Error ? err.message : t("courses.notFound"));
      })
      .finally(() => setLoading(false));
  }, [courseId, t]);

  const applySubmissionToLesson = (lessonId: string, submission: HomeworkSubmissionOut) => {
    setLessons((prev) =>
      prev.map((lesson) =>
        lesson.id === lessonId
          ? {
              ...lesson,
              my_latest_submission: submission,
            }
          : lesson,
      ),
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{course?.title || t("courses.courseTitleFallback")}</CardTitle>
          <CardDescription>{course?.description || t("courses.courseSubtitleFallback")}</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-zinc-300">
          {course ? (
            <div className="flex flex-wrap gap-x-6 gap-y-1">
              <p>
                <span className="text-zinc-400">{t("courses.provider")}:</span> {course.provider}
              </p>
              <p>
                <span className="text-zinc-400">{t("courses.difficulty", { value: course.difficulty })}</span>
              </p>
            </div>
          ) : loading ? (
            <p className="text-zinc-400">{t("app.loading")}</p>
          ) : (
            <p className="text-rose-300">{error || t("courses.notFound")}</p>
          )}
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="py-8 text-sm text-zinc-400">{t("courses.loadingLessons")}</CardContent>
        </Card>
      ) : sortedLessons.length ? (
        <div className="space-y-3">
          {sortedLessons.map((lesson) => {
            const latest = lesson.my_latest_submission;
            const statusVariant = latest?.status === "passed" ? "lime" : latest?.status === "failed" ? "destructive" : "muted";
            const score10 = normalizeScore10(latest?.score);
            const embedUrl = toYouTubeEmbedUrl(lesson.youtube_url);
            return (
              <Card key={lesson.id}>
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="text-base">
                      {t("courses.lesson", { order: lesson.order, title: lesson.title })}
                    </CardTitle>
                    {latest ? (
                      <Badge variant={statusVariant}>
                        {latest.status === "passed" ? t("courses.passed") : latest.status === "failed" ? t("courses.failed") : t("courses.pending")}
                        {score10 !== null ? ` • ${score10}/10` : ""}
                      </Badge>
                    ) : null}
                  </div>
                  {lesson.description ? <CardDescription>{lesson.description}</CardDescription> : null}
                </CardHeader>
                <CardContent className="space-y-3">
                  {embedUrl ? (
                    <div className="overflow-hidden rounded-xl border border-white/10">
                      <iframe
                        src={embedUrl}
                        title={`Lesson video ${lesson.order}`}
                        className="aspect-video w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : lesson.youtube_url ? (
                    <a
                      href={lesson.youtube_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-cyan-300 hover:text-cyan-200"
                    >
                      {t("courses.openVideo")} <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : null}

                  {lesson.homework_prompt ? (
                    <div className="space-y-2 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                      <p className="text-sm font-medium text-zinc-100">{t("courses.homework")}</p>
                      <p className="text-sm text-zinc-300">{lesson.homework_prompt}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-500">{t("courses.homeworkMissing")}</p>
                  )}

                  {lesson.homework_prompt ? (
                    <div className="space-y-2">
                      <Textarea
                        rows={5}
                        value={answers[lesson.id] ?? ""}
                        onChange={(e) =>
                          setAnswers((prev) => ({
                            ...prev,
                            [lesson.id]: e.target.value,
                          }))
                        }
                        placeholder={t("courses.homeworkPlaceholder")}
                      />
                      <Button
                        disabled={submittingLessonId === lesson.id || !(answers[lesson.id] || "").trim()}
                        onClick={async () => {
                          if (!courseId) return;
                          setSubmittingLessonId(lesson.id);
                          try {
                            const submission = await api.post<HomeworkSubmissionOut>(
                              `/courses/${courseId}/lessons/${lesson.id}/submit-homework`,
                              { answer: answers[lesson.id] ?? "" },
                            );
                            applySubmissionToLesson(lesson.id, submission);
                            toast.success(submission.status === "passed" ? t("courses.homeworkPassedToast") : t("courses.homeworkSubmittedToast"));
                          } catch (err) {
                            toast.error(err instanceof Error ? err.message : t("courses.homeworkFailedToast"));
                          } finally {
                            setSubmittingLessonId(null);
                          }
                        }}
                      >
                        {submittingLessonId === lesson.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        {t("courses.submitHomework")}
                      </Button>
                    </div>
                  ) : null}

                  {latest?.feedback ? (
                    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-sm text-zinc-300">
                      <p className="mb-1 text-zinc-100">{t("courses.aiFeedback")}</p>
                      <p>{latest.feedback}</p>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-sm text-zinc-400">
            {error ?? t("courses.lessonsEmpty")}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
