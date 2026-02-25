"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { GapChart } from "@/components/charts/GapChart";
import { CourseCard } from "@/components/roadmap/CourseCard";
import { SVGPathJourney } from "@/components/roadmap/SVGPathJourney";
import { NeuralLoader } from "@/components/shared/NeuralLoader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useT } from "@/hooks/useT";
import { api } from "@/lib/api";
import type {
  CourseOut,
  GapAnalysisResponse,
  ProfessionOut,
  RoadmapTaskStatusResponse,
  UserPathOut,
} from "@/types/api";

const POLL_INTERVAL_MS = 3000;

function getStepTitle(step: unknown, index: number, fallbackLabel: string): string {
  if (typeof step === "string" && step.trim()) {
    return step;
  }

  if (step && typeof step === "object") {
    const record = step as Record<string, unknown>;
    const candidates = [record.title, record.name, record.skill, record.label, record.step];
    const firstString = candidates.find((value) => typeof value === "string" && value.trim());
    if (typeof firstString === "string") {
      return firstString;
    }
  }

  return `${fallbackLabel} ${index + 1}`;
}

export default function ProfessionDetailPage() {
  const { t } = useT();
  const params = useParams<{ id: string }>();
  const rawProfessionId = params.id;
  const professionId = Array.isArray(rawProfessionId) ? rawProfessionId[0] : rawProfessionId;

  const [profession, setProfession] = useState<ProfessionOut | null>(null);
  const [gap, setGap] = useState<GapAnalysisResponse | null>(null);
  const [courses, setCourses] = useState<CourseOut[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [roadmapTaskId, setRoadmapTaskId] = useState<string | null>(null);
  const [taskStatus, setTaskStatus] = useState<"idle" | "processing" | "ok" | "failed" | "unavailable">("idle");
  const [pathId, setPathId] = useState<string | null>(null);
  const [taskError, setTaskError] = useState<string | null>(null);
  const [generatedPath, setGeneratedPath] = useState<UserPathOut | null>(null);

  useEffect(() => {
    if (!professionId) {
      setPageLoading(false);
      setPageError(t("professionDetail.missingId"));
      return;
    }

    let cancelled = false;
    setPageLoading(true);
    setPageError(null);

    Promise.all([
      api.get<ProfessionOut>(`/professions/${professionId}`),
      api.get<GapAnalysisResponse>(`/professions/${professionId}/gap`),
      api.get<CourseOut[]>(`/courses/recommend/${professionId}`),
    ])
      .then(([p, g, c]) => {
        if (cancelled) return;
        setProfession(p);
        setGap(g);
        setCourses(c);
      })
      .catch((err) => {
        if (cancelled) return;
        setProfession(null);
        setGap(null);
        setCourses([]);
        setPageError(err instanceof Error ? err.message : t("professionDetail.loadFailed"));
      })
      .finally(() => {
        if (cancelled) return;
        setPageLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [professionId, t]);

  const journeySteps = useMemo(() => {
    if (generatedPath?.steps?.length) {
      return generatedPath.steps.slice(0, 8).map((step, index) => {
        return {
          title: getStepTitle(step, index, t("professionDetail.stepWord")),
          completed: index < 2,
        };
      });
    }

    const source = Object.entries(gap?.gaps ?? {}).sort((a, b) => b[1] - a[1]).slice(0, 5);
    return source.map(([key, value], index) => ({
      title: key.replaceAll("_", " "),
      completed: value < 0.25 || index === 0,
    }));
  }, [gap, generatedPath, t]);

  useEffect(() => {
    if (!roadmapTaskId) return;

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const poll = async () => {
      try {
        const status = await api.get<RoadmapTaskStatusResponse>(`/professions/tasks/${roadmapTaskId}`);
        if (cancelled) return;

        setTaskStatus(status.status);
        setTaskError(status.error ?? null);

        if (status.path_id) {
          setPathId(status.path_id);
          const path = await api.get<UserPathOut>(`/professions/paths/${status.path_id}`);
          if (cancelled) return;
          setGeneratedPath(path);
        }

        if (status.status === "processing") {
          timeoutId = setTimeout(poll, POLL_INTERVAL_MS);
        }
      } catch {
        if (cancelled) return;
        setTaskStatus("unavailable");
        setTaskError(t("professionDetail.statusUnavailable"));
      }
    };

    poll().catch(() => {
      setTaskStatus("unavailable");
      setTaskError(t("professionDetail.statusUnavailable"));
    });

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [roadmapTaskId, t]);

  const taskStatusLabel = useMemo(() => {
    if (taskStatus === "unavailable") return t("professionDetail.statusUnavailable");
    return taskStatus;
  }, [taskStatus, t]);

  const showJourneyLoader = generating || taskStatus === "processing";

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{profession?.title ?? t("professionDetail.professionFallback")}</CardTitle>
          <CardDescription>{profession?.description ?? t("professionDetail.descFallback")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Button
            disabled={generating || pageLoading || !professionId}
            onClick={async () => {
              if (!professionId) return;
              setGenerating(true);
              setTaskStatus("processing");
              setTaskError(null);
              try {
                const response = await api.post<{ task_id: string; status: string }>("/professions/generate-path", {
                  profession_id: professionId,
                });
                setRoadmapTaskId(response.task_id);
                setPathId(null);
                setGeneratedPath(null);
                toast.success(t("professionDetail.generationStarted"));
              } catch (err) {
                setTaskStatus("failed");
                toast.error(err instanceof Error ? err.message : t("professionDetail.generationFailed"));
              } finally {
                setGenerating(false);
              }
            }}
          >
            {generating ? t("professionDetail.starting") : t("professionDetail.startGeneration")}
          </Button>

          {roadmapTaskId ? (
            <div className="space-y-1 text-xs text-zinc-400">
              <p>{t("professionDetail.taskQueued", { id: roadmapTaskId })}</p>
              <p>
                {t("professionDetail.status", { status: taskStatusLabel })}
                {pathId ? `, ${t("professionDetail.pathId", { id: pathId })}` : ""}
              </p>
              {taskError ? <p className="text-rose-300">{t("professionDetail.error", { error: taskError })}</p> : null}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("professionDetail.journey")}</CardTitle>
        </CardHeader>
        <CardContent>
          {pageLoading || showJourneyLoader ? (
            <NeuralLoader />
          ) : journeySteps.length ? (
            <SVGPathJourney steps={journeySteps} />
          ) : (
            <p className="text-zinc-400">{pageError ?? t("professionDetail.noRoadmap")}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("professionDetail.gapBreakdown")}</CardTitle>
        </CardHeader>
        <CardContent>
          {pageLoading ? (
            <NeuralLoader />
          ) : gap ? (
            <GapChart gaps={gap.gaps} />
          ) : (
            <p className="text-zinc-400">{pageError ?? t("professionDetail.noGap")}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("professionDetail.recommendedCourses")}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pageLoading ? (
            <NeuralLoader />
          ) : courses.length ? (
            courses.map((course) => <CourseCard key={course.id} course={course} />)
          ) : (
            <p className="text-zinc-400">{pageError ?? t("professionDetail.noCourses")}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
