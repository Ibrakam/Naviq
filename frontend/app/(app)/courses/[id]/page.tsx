"use client";

import { type ComponentType, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookCopy,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  FileText,
  HelpCircle,
  Loader2,
  Lock,
  Play,
  Send,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useT } from "@/hooks/useT";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { CourseLessonOut, CourseOut, HomeworkSubmissionOut } from "@/types/api";

type DetailTab = "overview" | "resources" | "transcript";

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

function withAutoplay(embedUrl: string | null, autoplay: boolean) {
  if (!embedUrl || !autoplay) return embedUrl;
  return embedUrl.includes("?") ? `${embedUrl}&autoplay=1` : `${embedUrl}?autoplay=1`;
}

function normalizeScore10(score: number | null | undefined): number | null {
  if (typeof score !== "number") return null;
  if (score > 10) return Math.max(1, Math.min(10, Math.round(score / 10)));
  return Math.max(1, Math.min(10, Math.round(score)));
}

function strongestSkillLabel(skillTags: Record<string, number> | undefined) {
  if (!skillTags) return null;
  const best = Object.entries(skillTags).sort((a, b) => b[1] - a[1])[0];
  if (!best) return null;
  return best[0]
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function buildTranscript(lesson: CourseLessonOut, course: CourseOut | null) {
  const lines = [
    `${lesson.title}`,
    lesson.description || course?.description || "",
    lesson.homework_prompt || "",
  ]
    .map((value) => value.trim())
    .filter(Boolean);

  return lines.length
    ? lines.join("\n\n")
    : "Transcript is not available for this lesson yet. Use the overview tab or open the source video.";
}

export default function CourseDetailPage() {
  const router = useRouter();
  const { t } = useT();
  const params = useParams<{ id: string }>();
  const rawId = params.id;
  const courseId = Array.isArray(rawId) ? rawId[0] : rawId;

  const [course, setCourse] = useState<CourseOut | null>(null);
  const [lessons, setLessons] = useState<CourseLessonOut[]>([]);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [playerStartedFor, setPlayerStartedFor] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>("overview");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submittingLessonId, setSubmittingLessonId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sortedLessons = useMemo(() => [...lessons].sort((a, b) => a.order - b.order), [lessons]);

  useEffect(() => {
    if (!courseId) return;
    setLoading(true);
    Promise.all([api.get<CourseOut>(`/courses/${courseId}`), api.get<CourseLessonOut[]>(`/courses/${courseId}/lessons`)])
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

  useEffect(() => {
    if (!sortedLessons.length) {
      setActiveLessonId(null);
      return;
    }

    setActiveLessonId((current) => {
      if (current && sortedLessons.some((lesson) => lesson.id === current)) return current;
      const firstPending = sortedLessons.find((lesson) => lesson.my_latest_submission?.status !== "passed");
      return firstPending?.id ?? sortedLessons[sortedLessons.length - 1]?.id ?? sortedLessons[0].id;
    });
  }, [sortedLessons]);

  const activeLesson = useMemo(
    () => sortedLessons.find((lesson) => lesson.id === activeLessonId) ?? sortedLessons[0] ?? null,
    [activeLessonId, sortedLessons],
  );

  const activeLessonIndex = useMemo(
    () => (activeLesson ? sortedLessons.findIndex((lesson) => lesson.id === activeLesson.id) : -1),
    [activeLesson, sortedLessons],
  );

  const completedLessons = useMemo(
    () => sortedLessons.filter((lesson) => lesson.my_latest_submission?.status === "passed").length,
    [sortedLessons],
  );

  const progressPercent = sortedLessons.length ? Math.round((completedLessons / sortedLessons.length) * 100) : 0;
  const activeSubmission = activeLesson?.my_latest_submission ?? null;
  const activeEmbedUrl = toYouTubeEmbedUrl(activeLesson?.youtube_url);
  const autoplayUrl = withAutoplay(activeEmbedUrl, playerStartedFor === activeLesson?.id);
  const strongestSkill = strongestSkillLabel(course?.skill_tags);

  const resourceLinks = useMemo(() => {
    if (!activeLesson || !course) return [];
    return [
      activeLesson.youtube_url
        ? { label: "Lesson Source", href: activeLesson.youtube_url, icon: Play }
        : null,
      course.url ? { label: `${course.provider} Reference`, href: course.url, icon: ExternalLink } : null,
      activeLesson.homework_rubric
        ? { label: "Homework Rubric", href: null, icon: FileText, note: "AI grading criteria attached to this lesson." }
        : null,
    ].filter(Boolean) as Array<{ label: string; href: string | null; icon: ComponentType<{ className?: string }>; note?: string }>;
  }, [activeLesson, course]);

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

  const moveToLesson = (index: number) => {
    const next = sortedLessons[index];
    if (!next) return;
    setActiveLessonId(next.id);
    setDetailTab("overview");
  };

  if (loading) {
    return (
      <div className="obsidian-glass rounded-[2rem] px-6 py-12 text-sm text-[#6d7891]">
        {t("courses.loadingLessons")}
      </div>
    );
  }

  if (!course || !activeLesson) {
    if (course && !sortedLessons.length) {
      return (
        <div className="space-y-8 pb-8">
          <section className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-[#edf3ff] px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-[#4f74d6]">
                  Course Overview
                </span>
                <span className="text-sm text-[#6d7891]">{course.provider}</span>
              </div>
              <div>
                <h1 className="text-[2.8rem] font-black tracking-[-0.07em] text-[#20283b] md:text-[4.3rem]">{course.title}</h1>
                <p className="mt-3 max-w-3xl text-base leading-7 text-[#6d7891]">
                  {course.description || t("courses.courseSubtitleFallback")}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => router.push("/courses")}
                className="flex items-center gap-2 rounded-2xl bg-[#edf3ff] px-5 py-3 text-sm font-bold text-[#284482] transition-colors hover:bg-[#e1ebff]"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to catalog
              </button>

              {course.url ? (
                <a
                  href={course.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#b7cef9,#8fb1f4)] px-5 py-3 text-sm font-bold text-[#17305e] transition-transform hover:translate-y-[-1px]"
                >
                  Open source
                  <ExternalLink className="h-4 w-4" />
                </a>
              ) : null}
            </div>
          </section>

          <section className="grid grid-cols-1 gap-8 xl:grid-cols-12">
            <div className="space-y-8 xl:col-span-8">
              <div className="overflow-hidden rounded-[2rem] bg-[#02040b] shadow-[0_32px_80px_rgba(0,0,0,0.35)]">
                <div className="group relative aspect-video overflow-hidden bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_18%),linear-gradient(180deg,#050505,#111111)]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(133,173,255,0.18),transparent_24%)]" />
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(133,173,255,0.06),transparent_42%,rgba(133,173,255,0.02))]" />
                  <div className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[1.6rem] bg-[linear-gradient(135deg,#b7cef9,#8fb1f4)] text-[#17305e] shadow-[0_0_60px_rgba(93,132,241,0.16)]">
                    <BookCopy className="h-10 w-10" />
                  </div>

                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent px-6 py-5">
                    <div className="flex items-center gap-4 text-sm text-white/80">
                      <Sparkles className="h-5 w-5" />
                      <span>Lessons are being prepared for this course</span>
                    </div>
                    <div className="text-xs font-mono uppercase tracking-[0.18em] text-white/60">00 / 00</div>
                  </div>
                </div>
              </div>

              <div className="obsidian-glass rounded-[2rem] p-7 md:p-9">
                <div className="space-y-5">
                  <h3 className="text-[2rem] font-extrabold tracking-[-0.05em] text-[#20283b]">Course status</h3>
                  <p className="max-w-4xl text-[1.05rem] leading-9 text-[#6d7891]">
                    This course is already visible in the catalog, but its lesson playlist has not been published yet.
                    The overview is available now, and the lesson blocks will appear here as soon as they are added in the API.
                  </p>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <div className="rounded-full bg-[#eef3ff] px-4 py-2 text-sm text-[#24304a]">
                      Provider: <span className="font-semibold text-[#4f74d6]">{course.provider}</span>
                    </div>
                    <div className="rounded-full bg-[#eef3ff] px-4 py-2 text-sm text-[#24304a]">
                      Difficulty: <span className="font-semibold text-[#4f74d6]">{course.difficulty}</span>
                    </div>
                    {strongestSkill ? (
                      <div className="rounded-full bg-[#eef3ff] px-4 py-2 text-sm text-[#24304a]">
                        Focus: <span className="font-semibold text-[#4f74d6]">{strongestSkill}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6 xl:col-span-4">
              <div className="obsidian-glass sticky top-28 rounded-[2rem] p-6">
                <div className="space-y-1">
                  <h4 className="text-xl font-bold tracking-[-0.03em] text-[#20283b]">Course Progress</h4>
                  <div className="mt-4 h-2 rounded-full bg-[#e3e9f3]">
                    <div className="h-2 w-[8%] rounded-full bg-[linear-gradient(90deg,#84a2f5,#5d84f1)]" />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] font-black uppercase tracking-[0.14em] text-[#6d7891]">
                    <span>0 lessons published</span>
                    <span>Overview</span>
                  </div>
                </div>

                <div className="mt-8 border-t border-[#d9e1ec] pt-5">
                  <Link
                    href="/courses"
                    className="flex w-full items-center justify-center rounded-[1.3rem] border border-[#d7deea] px-4 py-3 text-xs font-black uppercase tracking-[0.2em] text-[#284482] transition-colors hover:bg-[#f5f8ff]"
                  >
                    View all courses
                  </Link>
                </div>
              </div>

              <div className="obsidian-glass relative overflow-hidden rounded-[2rem] p-6">
                <div className="relative z-10">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4ebff] text-[#9b61d3]">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <h5 className="mt-5 text-xl font-bold tracking-[-0.03em] text-[#20283b]">Publishing note</h5>
                  <p className="mt-3 text-sm leading-7 text-[#6d7891]">
                    Once the first lessons are added, this page will automatically switch to the player layout with playlist,
                    resources, transcript, and homework.
                  </p>
                </div>
                <div className="absolute -bottom-10 -right-8 h-32 w-32 rounded-full bg-[#5d84f1]/8 blur-3xl" />
              </div>
            </div>
          </section>
        </div>
      );
    }

    if (!course) {
      return (
        <div className="obsidian-glass rounded-[2rem] px-6 py-12 text-sm text-[#c46c64]">
          {error ?? t("courses.notFound")}
        </div>
      );
    }

    return (
      <div className="obsidian-glass rounded-[2rem] px-6 py-12 text-sm text-[#c46c64]">
        {error ?? t("courses.notFound")}
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <section className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-[#edf3ff] px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-[#4f74d6]">
              Module {String(activeLesson.order).padStart(2, "0")}
            </span>
            <span className="text-sm text-[#6d7891]">{course.provider}</span>
          </div>
          <div>
            <h1 className="text-[2.8rem] font-black tracking-[-0.07em] text-[#20283b] md:text-[4.3rem]">{activeLesson.title}</h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-[#6d7891]">
              {activeLesson.description || course.description || t("courses.courseSubtitleFallback")}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => moveToLesson(activeLessonIndex - 1)}
            disabled={activeLessonIndex <= 0}
            className="flex items-center gap-2 rounded-2xl bg-[#edf3ff] px-5 py-3 text-sm font-bold text-[#284482] transition-colors hover:bg-[#e1ebff] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </button>

          <button
            type="button"
            onClick={() => moveToLesson(activeLessonIndex + 1)}
            disabled={activeLessonIndex >= sortedLessons.length - 1}
            className="flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#b7cef9,#8fb1f4)] px-5 py-3 text-sm font-bold text-[#17305e] transition-transform hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next Lesson
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-8 xl:grid-cols-12">
        <div className="space-y-8 xl:col-span-8">
          <div className="overflow-hidden rounded-[2rem] bg-[#02040b] shadow-[0_32px_80px_rgba(0,0,0,0.35)]">
            {autoplayUrl ? (
              <iframe
                src={autoplayUrl}
                title={`Lesson video ${activeLesson.order}`}
                className="aspect-video w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="group relative aspect-video overflow-hidden bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_18%),linear-gradient(180deg,#050505,#111111)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(133,173,255,0.18),transparent_24%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(133,173,255,0.06),transparent_42%,rgba(133,173,255,0.02))]" />
                <button
                  type="button"
                  onClick={() => setPlayerStartedFor(activeLesson.id)}
                  className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[1.6rem] bg-[linear-gradient(135deg,#b7cef9,#8fb1f4)] text-[#17305e] shadow-[0_0_60px_rgba(93,132,241,0.16)] transition-transform group-hover:scale-105"
                >
                  <Play className="ml-1 h-10 w-10 fill-current" />
                </button>

                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent px-6 py-5">
                  <div className="flex items-center gap-4 text-sm text-white/80">
                    <Play className="h-5 w-5" />
                    <span>{activeLesson.youtube_url ? "Video ready" : "Preview mode"}</span>
                  </div>
                  <div className="text-xs font-mono uppercase tracking-[0.18em] text-white/60">
                    {String(activeLesson.order).padStart(2, "0")} / {String(sortedLessons.length).padStart(2, "0")}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="obsidian-glass rounded-[2rem] p-7 md:p-9">
            <div className="flex flex-wrap gap-8 border-b border-[#d9e1ec]">
              {[
                { key: "overview" as const, label: "Overview" },
                { key: "resources" as const, label: "Resources" },
                { key: "transcript" as const, label: "Transcripts" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setDetailTab(tab.key)}
                  className={cn(
                    "pb-4 text-sm font-semibold transition-colors",
                    detailTab === tab.key
                      ? "border-b-2 border-[#4f74d6] text-[#4f74d6]"
                      : "text-[#6d7891] hover:text-[#20283b]",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {detailTab === "overview" ? (
              <div className="space-y-5 pt-8">
                <h3 className="text-[2rem] font-extrabold tracking-[-0.05em] text-[#20283b]">About this lesson</h3>
                <p className="max-w-4xl text-[1.05rem] leading-9 text-[#6d7891]">
                  {activeLesson.description || course.description || "This lesson dives into the core mechanics of the topic and translates them into a structured practical exercise."}
                </p>

                <div className="flex flex-wrap gap-3 pt-2">
                  <div className="rounded-full bg-[#eef3ff] px-4 py-2 text-sm text-[#24304a]">
                    Provider: <span className="font-semibold text-[#4f74d6]">{course.provider}</span>
                  </div>
                  <div className="rounded-full bg-[#eef3ff] px-4 py-2 text-sm text-[#24304a]">
                    Difficulty: <span className="font-semibold text-[#4f74d6]">{course.difficulty}</span>
                  </div>
                  {strongestSkill ? (
                    <div className="rounded-full bg-[#eef3ff] px-4 py-2 text-sm text-[#24304a]">
                      Focus: <span className="font-semibold text-[#4f74d6]">{strongestSkill}</span>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}

            {detailTab === "resources" ? (
              <div className="space-y-4 pt-8">
                <h3 className="text-[2rem] font-extrabold tracking-[-0.05em] text-[#20283b]">Resources</h3>
                <div className="flex flex-wrap gap-3">
                  {resourceLinks.length ? (
                    resourceLinks.map((resource) => {
                      const Icon = resource.icon;
                      return resource.href ? (
                        <a
                          key={resource.label}
                          href={resource.href}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 rounded-full bg-[#eef3ff] px-4 py-2 text-sm text-[#24304a] transition-colors hover:bg-[#e3edff]"
                        >
                          <Icon className="h-4 w-4 text-[#4f74d6]" />
                          {resource.label}
                        </a>
                      ) : (
                        <div key={resource.label} className="rounded-[1.4rem] bg-[#eef3ff] px-4 py-3 text-sm text-[#24304a]">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-[#4f74d6]" />
                            {resource.label}
                          </div>
                          {resource.note ? <p className="mt-2 text-xs text-[#6d7891]">{resource.note}</p> : null}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-[#6d7891]">Additional resources will appear here as the lesson gets enriched.</p>
                  )}
                </div>
              </div>
            ) : null}

            {detailTab === "transcript" ? (
              <div className="space-y-4 pt-8">
                <h3 className="text-[2rem] font-extrabold tracking-[-0.05em] text-[#20283b]">Transcript</h3>
                <pre className="whitespace-pre-wrap rounded-[1.5rem] bg-[#fffdf8] px-5 py-5 font-sans text-sm leading-8 text-[#6d7891]">
                  {buildTranscript(activeLesson, course)}
                </pre>
              </div>
            ) : null}
          </div>

          <div className="obsidian-glass rounded-[2rem] p-7 md:p-9">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h3 className="text-[2rem] font-black italic tracking-[-0.05em] text-[#20283b] uppercase">Homework Assignment</h3>
              <span className="rounded-md bg-[#9f0519] px-3 py-1 text-[11px] font-black uppercase tracking-[0.15em] text-[#ffa8a3]">
                {activeSubmission?.status === "passed" ? "Completed" : "Due in 2 days"}
              </span>
            </div>

            <p className="mt-5 text-[1.03rem] leading-8 text-[#6d7891]">
              {activeLesson.homework_prompt || t("courses.homeworkMissing")}
            </p>

            <div className="mt-6 space-y-4">
              <Textarea
                rows={8}
                value={answers[activeLesson.id] ?? ""}
                onChange={(event) =>
                  setAnswers((prev) => ({
                    ...prev,
                    [activeLesson.id]: event.target.value,
                  }))
                }
                placeholder={t("courses.homeworkPlaceholder")}
                className="min-h-[220px] rounded-[1.4rem] border-none bg-[#fffdf8] px-5 py-5 text-base text-[#20283b] placeholder:text-[#8a92a9] focus-visible:ring-[#4f74d6]/20"
              />

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="text-sm text-[#6d7891]">
                  {activeSubmission?.feedback ? `${t("courses.aiFeedback")}: ${activeSubmission.feedback}` : "Submit your answer to receive AI evaluation and score."}
                </div>

                <Button
                  className="h-12 rounded-2xl bg-[linear-gradient(135deg,#b7cef9,#8fb1f4)] px-8 text-sm font-black uppercase tracking-[0.14em] text-[#17305e] hover:opacity-95"
                  disabled={submittingLessonId === activeLesson.id || !(answers[activeLesson.id] || "").trim() || !activeLesson.homework_prompt}
                  onClick={async () => {
                    if (!courseId) return;
                    setSubmittingLessonId(activeLesson.id);
                    try {
                      const submission = await api.post<HomeworkSubmissionOut>(
                        `/courses/${courseId}/lessons/${activeLesson.id}/submit-homework`,
                        { answer: answers[activeLesson.id] ?? "" },
                      );
                      applySubmissionToLesson(activeLesson.id, submission);
                      toast.success(
                        submission.status === "passed" ? t("courses.homeworkPassedToast") : t("courses.homeworkSubmittedToast"),
                      );
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : t("courses.homeworkFailedToast"));
                    } finally {
                      setSubmittingLessonId(null);
                    }
                  }}
                >
                  {submittingLessonId === activeLesson.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {t("courses.submitHomework")}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 xl:col-span-4">
          <div className="obsidian-glass sticky top-28 rounded-[2rem] p-6">
            <div className="space-y-1">
              <h4 className="text-xl font-bold tracking-[-0.03em] text-[#20283b]">Course Progress</h4>
              <div className="mt-4 h-2 rounded-full bg-[#e3e9f3]">
                <div className="h-2 rounded-full bg-[linear-gradient(90deg,#84a2f5,#5d84f1)]" style={{ width: `${progressPercent}%` }} />
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] font-black uppercase tracking-[0.14em] text-[#6d7891]">
                <span>
                  {completedLessons} of {sortedLessons.length} completed
                </span>
                <span>{progressPercent}%</span>
              </div>
            </div>

            <div className="mt-8">
              <p className="mb-4 text-[11px] font-black uppercase tracking-[0.18em] text-[#8a92a9]">Lesson Playlist</p>
              <div className="space-y-3">
                {sortedLessons.map((lesson) => {
                  const isActive = lesson.id === activeLesson.id;
                  const isPassed = lesson.my_latest_submission?.status === "passed";
                  const isUpcoming = !isPassed && lesson.order > activeLesson.order;
                  const score = normalizeScore10(lesson.my_latest_submission?.score);

                  return (
                    <button
                      type="button"
                      key={lesson.id}
                      onClick={() => {
                        setActiveLessonId(lesson.id);
                        setDetailTab("overview");
                      }}
                      className={cn(
                        "flex w-full items-center gap-4 rounded-[1.35rem] px-4 py-4 text-left transition-all",
                        isActive ? "bg-[#eef4ff] shadow-[inset_3px_0_0_0_#5d84f1]" : "hover:bg-[#fffdf8]",
                        isUpcoming ? "opacity-75" : "",
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-14 w-14 shrink-0 items-center justify-center rounded-[1rem] bg-[#eef3ff] text-[#4f74d6]",
                          isActive ? "border border-[#b7caf5]" : "",
                        )}
                      >
                        {isPassed ? (
                          <CheckCircle2 className="h-6 w-6" />
                        ) : isActive ? (
                          <Play className="ml-0.5 h-6 w-6 fill-current" />
                        ) : isUpcoming ? (
                          <Lock className="h-5 w-5 text-[#9aa2b6]" />
                        ) : (
                          <BookCopy className="h-5 w-5 text-[#9aa2b6]" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className={cn("text-xs font-semibold", isActive ? "text-[#4f74d6]" : "text-[#7f8ebb]")}>
                          {String(lesson.order).padStart(2, "0")}. {course.provider}
                        </p>
                        <p className="mt-1 line-clamp-2 text-base font-bold tracking-[-0.03em] text-[#20283b]">{lesson.title}</p>
                      </div>

                      <div className="text-right">
                        <p className={cn("text-xs font-semibold", isActive ? "text-[#4f74d6]" : "text-[#7f8ebb]")}>
                          {lesson.youtube_url ? "Video" : "Text"}
                        </p>
                        <p className="mt-1 text-[11px] text-[#7f8ebb]">{score !== null ? `${score}/10` : "..."}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 border-t border-[#d9e1ec] pt-5">
              <Link
                href="/courses"
                className="flex w-full items-center justify-center rounded-[1.3rem] border border-[#d7deea] px-4 py-3 text-xs font-black uppercase tracking-[0.2em] text-[#284482] transition-colors hover:bg-[#f5f8ff]"
              >
                View Full Syllabus
              </Link>
            </div>
          </div>

          <div className="obsidian-glass relative overflow-hidden rounded-[2rem] p-6">
            <div className="relative z-10">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4ebff] text-[#9b61d3]">
                <Sparkles className="h-4 w-4" />
              </div>
              <h5 className="mt-5 text-xl font-bold tracking-[-0.03em] text-[#20283b]">Related Insights</h5>
              <p className="mt-3 text-sm leading-7 text-[#6d7891]">
                Recommended next angle:{" "}
                <span className="text-[#20283b]">
                  {strongestSkill ? `${strongestSkill} playbook` : "Neural Marketing Architecture"}
                </span>
                {course.provider ? ` via ${course.provider}.` : "."}
              </p>
              {course.url ? (
                <a
                  href={course.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#4f74d6] hover:text-[#6b8ef0]"
                >
                  Explore Resource
                  <ChevronRight className="h-4 w-4" />
                </a>
              ) : null}
            </div>
            <div className="absolute -bottom-10 -right-8 h-32 w-32 rounded-full bg-[#5d84f1]/8 blur-3xl" />
          </div>

          <div className="obsidian-glass rounded-[2rem] p-6">
            <p className="text-sm text-[#6d7891]">Ready for evaluation?</p>
            <button
              type="button"
              onClick={() => router.push("/assessment")}
              className="mt-4 w-full rounded-2xl bg-[linear-gradient(135deg,#b7cef9,#8fb1f4)] px-4 py-3 text-sm font-black text-[#17305e] transition-transform hover:translate-y-[-1px]"
            >
              Take Test
            </button>

            <div className="mt-6 space-y-2 border-t border-[#d9e1ec] pt-5">
              <Link
                href="/profile"
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-[#6d7891] transition-colors hover:bg-[#f5f8ff] hover:text-[#20283b]"
              >
                <HelpCircle className="h-4 w-4" />
                Help
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-[#6d7891] transition-colors hover:bg-[#f5f8ff] hover:text-[#20283b]"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
