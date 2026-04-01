"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Bolt,
  BookOpen,
  CheckCircle2,
  Cpu,
  Database,
  ExternalLink,
  Layers3,
  Rocket,
  School,
} from "lucide-react";
import { api } from "@/lib/api";
import type { CourseLessonOut, CourseOut } from "@/types/api";
import { useT } from "@/hooks/useT";
import { cn } from "@/lib/utils";

type CourseCategory = "Architecture" | "Data" | "Design" | "Backend" | "Growth";
type CourseMeta = {
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
  hasLessons: boolean;
};

function getCourseCategory(course: CourseOut): CourseCategory {
  const text = `${course.title} ${course.description ?? ""}`.toLowerCase();
  const strongestSkill = Object.entries(course.skill_tags ?? {}).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";

  if (text.includes("design") || text.includes("ux") || text.includes("frontend") || strongestSkill === "creativity") return "Design";
  if (text.includes("data") || text.includes("ml") || text.includes("analytics") || strongestSkill === "analytics") return "Data";
  if (
    text.includes("api") ||
    text.includes("backend") ||
    text.includes("node") ||
    text.includes("devops") ||
    strongestSkill === "technical"
  ) {
    return "Backend";
  }
  if (text.includes("architecture") || text.includes("system") || strongestSkill === "problem_solving") return "Architecture";
  return "Growth";
}

function getDifficultyLabel(value: number) {
  if (value >= 3) return "Expert";
  if (value === 2) return "Intermediate";
  return "Beginner";
}

function getCourseAccent(category: CourseCategory) {
  switch (category) {
    case "Architecture":
      return {
        icon: Cpu,
        chip: "text-[#4f74d6]",
        chipBg: "bg-[#edf3ff]",
        image: "bg-[radial-gradient(circle_at_top,rgba(93,132,241,0.22),transparent_26%),linear-gradient(135deg,#f6f8ff,#edf3ff_45%,#dde8ff)]",
      };
    case "Data":
      return {
        icon: Database,
        chip: "text-[#5f74cf]",
        chipBg: "bg-[#eef1ff]",
        image: "bg-[radial-gradient(circle_at_top,rgba(127,152,255,0.18),transparent_28%),linear-gradient(135deg,#f8f8ff,#eef2ff_48%,#e3ebff)]",
      };
    case "Design":
      return {
        icon: Layers3,
        chip: "text-[#9b61d3]",
        chipBg: "bg-[#f7ebff]",
        image: "bg-[radial-gradient(circle_at_top,rgba(244,156,251,0.16),transparent_26%),linear-gradient(135deg,#fff9ff,#f7efff_48%,#efe4ff)]",
      };
    case "Backend":
      return {
        icon: Bolt,
        chip: "text-[#4770d0]",
        chipBg: "bg-[#eef3ff]",
        image: "bg-[radial-gradient(circle_at_top,rgba(133,173,255,0.18),transparent_26%),linear-gradient(135deg,#fbfcff,#eff4ff_44%,#e4edff)]",
      };
    default:
      return {
        icon: Rocket,
        chip: "text-[#5c73c8]",
        chipBg: "bg-[#eef2ff]",
        image: "bg-[radial-gradient(circle_at_top,rgba(108,159,255,0.18),transparent_26%),linear-gradient(135deg,#fbfcff,#eef4ff_44%,#e4ecff)]",
      };
  }
}

function getCourseMeta(lessons: CourseLessonOut[] | undefined): CourseMeta {
  const totalLessons = lessons?.length ?? 0;
  const completedLessons = lessons?.filter((lesson) => lesson.my_latest_submission?.status === "passed").length ?? 0;
  const progressPercent = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return {
    totalLessons,
    completedLessons,
    progressPercent,
    hasLessons: totalLessons > 0,
  };
}

function getPrimaryAction(meta: CourseMeta) {
  if (!meta.hasLessons) return "Open Overview";
  if (meta.completedLessons >= meta.totalLessons) return "Review";
  if (meta.completedLessons > 0) return "Continue";
  return "Start";
}

function getSecondaryMeta(meta: CourseMeta) {
  if (!meta.hasLessons) return "Curriculum in progress";
  if (meta.completedLessons > 0) {
    return `${meta.completedLessons} of ${meta.totalLessons} completed`;
  }
  return `${meta.totalLessons} lesson${meta.totalLessons === 1 ? "" : "s"} live`;
}

export default function CoursesPage() {
  const { t } = useT();
  const [courses, setCourses] = useState<CourseOut[]>([]);
  const [courseLessons, setCourseLessons] = useState<Record<string, CourseLessonOut[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"All Levels" | CourseCategory>("All Levels");

  useEffect(() => {
    let cancelled = false;

    api
      .get<CourseOut[]>("/courses/")
      .then(async (fetchedCourses) => {
        if (cancelled) return;
        setCourses(fetchedCourses);

        const lessonPairs = await Promise.all(
          fetchedCourses.map(async (course) => {
            try {
              const lessons = await api.get<CourseLessonOut[]>(`/courses/${course.id}/lessons`);
              return [course.id, lessons] as const;
            } catch {
              return [course.id, []] as const;
            }
          }),
        );

        if (cancelled) return;
        setCourseLessons(Object.fromEntries(lessonPairs));
      })
      .catch(() => {
        if (cancelled) return;
        setCourses([]);
        setCourseLessons({});
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const featuredCourse = useMemo(() => {
    if (!courses.length) return null;
    return (
      [...courses].sort((a, b) => {
        const aMeta = getCourseMeta(courseLessons[a.id]);
        const bMeta = getCourseMeta(courseLessons[b.id]);

        if (bMeta.hasLessons !== aMeta.hasLessons) {
          return Number(bMeta.hasLessons) - Number(aMeta.hasLessons);
        }

        if (b.difficulty !== a.difficulty) {
          return b.difficulty - a.difficulty;
        }

        return bMeta.totalLessons - aMeta.totalLessons;
      })[0] ?? courses[0]
    );
  }, [courseLessons, courses]);

  const categories = useMemo(() => {
    const values = Array.from(new Set(courses.map(getCourseCategory)));
    return ["All Levels", ...values] as Array<"All Levels" | CourseCategory>;
  }, [courses]);

  const visibleCourses = useMemo(() => {
    if (activeFilter === "All Levels") return courses;
    return courses.filter((course) => getCourseCategory(course) === activeFilter);
  }, [activeFilter, courses]);

  const featuredMeta = featuredCourse ? getCourseMeta(courseLessons[featuredCourse.id]) : null;

  return (
    <div className="space-y-12 pb-8">
      {featuredCourse ? (
        <section className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(120deg,#fbf9f3_0%,#f7f4ee_42%,#eef4ff_64%,#f8f4ec_100%)] px-8 py-10 shadow-[0_30px_80px_rgba(106,117,141,0.12)] md:px-12 md:py-14">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_30%,rgba(93,132,241,0.14),transparent_20%),radial-gradient(circle_at_80%_55%,rgba(255,224,193,0.22),transparent_22%)]" />
          <div className="relative z-10 flex flex-col gap-10 xl:flex-row xl:items-center xl:justify-between">
            <div className="max-w-3xl space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-[#edf3ff] px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-[#4f74d6]">
                  Featured Path
                </span>
                <span className="text-sm font-medium text-[#4f74d6]">{featuredCourse.provider}</span>
              </div>

              <div className="space-y-4">
                <h1 className="max-w-[12ch] text-[3.2rem] font-black leading-[0.92] tracking-[-0.08em] text-[#1f2739] md:text-[4.9rem]">
                  {featuredCourse.title}
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-[#6d7891]">
                  {featuredCourse.description || t("courses.courseSubtitleFallback")}
                </p>
              </div>

              <div className="max-w-md space-y-3">
                <div className="h-2 overflow-hidden rounded-full bg-[#e2e8f2]">
                  <div
                    className="h-full bg-[linear-gradient(90deg,#84a2f5,#5d84f1)] shadow-[0_0_14px_rgba(93,132,241,0.18)]"
                    style={{ width: `${Math.max(featuredMeta?.hasLessons ? featuredMeta.progressPercent : 18, 18)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-[0.18em] text-[#7a859c]">
                  <span>{getDifficultyLabel(featuredCourse.difficulty)}</span>
                  <span>{featuredMeta?.hasLessons ? getSecondaryMeta(featuredMeta) : "Overview available"}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href={`/courses/${featuredCourse.id}`}
                  className="inline-flex items-center gap-3 rounded-2xl bg-[linear-gradient(135deg,#b7cef9,#8fb1f4)] px-7 py-4 text-sm font-black text-[#17305e] transition-transform hover:translate-y-[-1px]"
                >
                  {featuredMeta ? getPrimaryAction(featuredMeta) : "Open Overview"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={`/courses/${featuredCourse.id}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#25314a] transition-colors hover:text-[#4f74d6]"
                >
                  View Curriculum
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="relative min-h-[280px] flex-1 overflow-hidden rounded-[1.8rem] border border-[#dbe3ef] bg-[linear-gradient(135deg,rgba(255,255,255,0.5),rgba(233,240,252,0.75))] xl:max-w-[520px]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(93,132,241,0.16),transparent_22%),linear-gradient(135deg,transparent_0%,rgba(93,132,241,0.04)_30%,transparent_58%)]" />
              <div className="absolute left-[18%] top-[18%] h-32 w-32 rounded-full border border-[#b7c8e6]" />
              <div className="absolute right-[14%] top-[22%] h-24 w-24 rounded-full border border-[#c4d2ea]" />
              <div className="absolute bottom-[18%] left-[24%] h-40 w-40 rotate-45 rounded-[2rem] border border-[#cedaec]" />
              <div className="absolute bottom-[14%] right-[16%] h-28 w-28 rounded-[1.6rem] bg-[#5d84f1]/10 blur-sm" />
            </div>
          </div>
        </section>
      ) : null}

      <section className="space-y-8">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <h2 className="text-[2.2rem] font-black tracking-[-0.06em] text-[#20283b]">Available Paths</h2>

          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveFilter(category)}
                className={cn(
                  "rounded-2xl border px-4 py-2.5 text-sm font-semibold transition-all",
                  activeFilter === category
                    ? "border-[#b8c9f2] bg-[#edf3ff] text-[#4f74d6]"
                    : "border-[#d9e1ec] bg-[#fffdf8] text-[#6f7b94] hover:border-[#c9d7ef] hover:text-[#20283b]",
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="obsidian-glass rounded-[2rem] px-6 py-12 text-sm text-[#6d7891]">{t("courses.loadingCourses")}</div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
            {visibleCourses.map((course, index) => {
              const category = getCourseCategory(course);
              const accent = getCourseAccent(category);
              const Icon = accent.icon;
              const meta = getCourseMeta(courseLessons[course.id]);
              const isInProgress = meta.hasLessons && meta.completedLessons > 0 && meta.completedLessons < meta.totalLessons;

              return (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}`}
                  className={cn(
                    "group overflow-hidden rounded-[1.6rem] transition-all duration-300",
                    isInProgress
                      ? "obsidian-glass border border-[#b7caf5]"
                      : "obsidian-glass hover:border-[#d3dce8]",
                  )}
                >
                  <div className={cn("relative h-52 overflow-hidden", accent.image)}>
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(255,255,255,0.02)_55%,rgba(246,242,234,0.32)_100%)]" />
                    <div
                      className={cn(
                        "absolute left-5 top-5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em]",
                        accent.chipBg,
                        accent.chip,
                      )}
                    >
                      {getDifficultyLabel(course.difficulty)}
                    </div>
                  </div>

                  <div className="space-y-5 px-7 py-7">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-[1.45rem] font-bold leading-tight tracking-[-0.04em] text-[#20283b]">{course.title}</h3>
                        <p className="mt-3 line-clamp-2 text-sm leading-7 text-[#6d7891]">
                          {course.description || t("courses.noDescription")}
                        </p>
                      </div>

                      {meta.hasLessons ? <span className="text-sm font-black text-[#4f74d6]">{meta.progressPercent}%</span> : null}
                    </div>

                    {meta.hasLessons ? (
                      <div className="h-1.5 overflow-hidden rounded-full bg-[#e3e9f3]">
                        <div className="h-full bg-[#5d84f1]" style={{ width: `${Math.max(meta.progressPercent, 10)}%` }} />
                      </div>
                    ) : null}

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2 text-xs text-[#6d7891]">
                        <Icon className="h-4 w-4 text-[#4f74d6]" />
                        {getSecondaryMeta(meta)}
                      </div>

                      <span
                        className={cn(
                          "rounded-xl px-5 py-2.5 text-sm font-bold transition-all",
                          isInProgress
                            ? "border border-[#b7caf5] bg-[#eef4ff] text-[#4f74d6] group-hover:bg-[#dbe7ff] group-hover:text-[#17305e]"
                            : "bg-[linear-gradient(135deg,#b7cef9,#8fb1f4)] text-[#17305e]",
                        )}
                      >
                        {getPrimaryAction(meta)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7a859c]">
                      <span>{category}</span>
                      <span>{getDifficultyLabel(course.difficulty)}</span>
                    </div>
                  </div>
                </Link>
              );
            })}

            <div className="obsidian-glass relative flex flex-col items-center justify-center overflow-hidden rounded-[1.6rem] px-8 py-10 text-center md:col-span-2 xl:col-span-1">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(133,173,255,0.08),transparent_38%)]" />
              <div className="relative z-10">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#eaf1ff] text-[#4f74d6]">
                  <School className="h-8 w-8" />
                </div>
                <h3 className="mt-6 text-[1.9rem] font-black tracking-[-0.05em] text-[#20283b]">Can&apos;t find a path?</h3>
                <p className="mt-4 text-sm leading-7 text-[#6d7891]">
                  Create a custom curriculum around your target role, current level, and strongest competencies.
                </p>
                <Link
                  href="/assessment"
                  className="mt-6 inline-flex rounded-2xl border border-[#c7d4ea] bg-[#fffdf8] px-6 py-3 text-sm font-bold text-[#284482] transition-colors hover:bg-[#f5f8ff]"
                >
                  Request Custom Path
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>

      <Link
        href="/assessment"
        className="fixed bottom-8 right-8 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-[linear-gradient(135deg,#b7cef9,#8fb1f4)] text-[#17305e] shadow-[0_20px_50px_rgba(93,132,241,0.18)] transition-transform hover:scale-105"
      >
        <CheckCircle2 className="h-7 w-7" />
      </Link>
    </div>
  );
}
