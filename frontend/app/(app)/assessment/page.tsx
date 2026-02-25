"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useT } from "@/hooks/useT";
import { hasCompletedSkillProfile } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { useSkillStore } from "@/stores/skillStore";

type UserAnswer = {
  question_id: string;
  answer: string;
};

export default function AssessmentPage() {
  const router = useRouter();
  const { t } = useT();

  const user = useAuthStore((s) => s.user);
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const fetchSkillQuestions = useSkillStore((s) => s.fetchSkillQuestions);
  const questions = useSkillStore((s) => s.skillQuestions);
  const analyzeSkills = useSkillStore((s) => s.analyzeSkills);
  const fetchTopMatches = useSkillStore((s) => s.fetchTopMatches);
  const loading = useSkillStore((s) => s.loading);

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [bootstrapped, setBootstrapped] = useState(false);

  const attempts = user?.attempts_balance ?? 0;
  const hasSkillProfile = hasCompletedSkillProfile(user?.skill_profile);
  const total = questions.length;
  const current = questions[index];
  const selected = current ? answers[current.id] : undefined;
  const progress = total ? ((index + 1) / total) * 100 : 0;

  useEffect(() => {
    fetchMe()
      .catch(() => undefined)
      .finally(() => setBootstrapped(true));
  }, [fetchMe]);

  useEffect(() => {
    if (!bootstrapped || hasSkillProfile) return;
    if (!questions.length) {
      fetchSkillQuestions().catch(() => undefined);
    }
  }, [bootstrapped, hasSkillProfile, fetchSkillQuestions, questions.length]);

  const preparedAnswers = useMemo(
    () =>
      questions
        .filter((question) => answers[question.id])
        .map((question) => ({ question_id: question.id, answer: answers[question.id] })),
    [answers, questions],
  );

  const isLast = index === total - 1;

  const submit = async () => {
    if (!preparedAnswers.length || attempts <= 0) return;
    setSubmitting(true);
    try {
      await analyzeSkills(preparedAnswers);
      await fetchMe();
      await fetchTopMatches();
      toast.success(t("assessment.completedToast"));
      router.push("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("assessment.failedToast"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {bootstrapped && hasSkillProfile ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("assessment.completedTitle")}</CardTitle>
            <CardDescription>
              {t("assessment.completedDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/professions">{t("assessment.toProfessions")}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard">{t("assessment.toDashboard")}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {!bootstrapped || hasSkillProfile ? null : (
        <>
      <Card>
        <CardHeader>
          <CardTitle>{t("assessment.title")}</CardTitle>
          <CardDescription>
            {t("assessment.subtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-zinc-400">
          {t("assessment.attempts", { count: attempts })}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-5 pt-6">
          {loading && !questions.length ? (
            <div className="flex min-h-56 items-center justify-center text-sm text-zinc-400">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("assessment.loadingQuestions")}
            </div>
          ) : current ? (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>
                    {t("assessment.questionOf", { current: index + 1, total })}
                  </span>
                  {current.category ? <Badge variant="muted">{current.category}</Badge> : null}
                </div>
                <Progress value={progress} />
              </div>

              <p className="text-base font-medium text-zinc-100">{current.question}</p>

              <div className="space-y-2">
                {current.options.map((option) => {
                  const active = selected === option.code;
                  return (
                    <button
                      key={`${current.id}:${option.code}`}
                      type="button"
                      onClick={() =>
                        setAnswers((prev) => ({
                          ...prev,
                          [current.id]: option.code,
                        }))
                      }
                      className={
                        active
                          ? "w-full rounded-xl border border-cyan-300/60 bg-cyan-300/10 px-4 py-3 text-left text-sm text-zinc-100"
                          : "w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-sm text-zinc-300 hover:bg-white/[0.06]"
                      }
                    >
                      <span className="mr-2 text-cyan-300">{option.code}.</span>
                      {option.text}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={submitting || index <= 0}
                  onClick={() => setIndex((prev) => Math.max(0, prev - 1))}
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t("app.back")}
                </Button>

                {isLast ? (
                  <Button type="button" disabled={!selected || submitting || attempts <= 0} onClick={submit}>
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {t("app.complete")}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    disabled={!selected || submitting}
                    onClick={() => setIndex((prev) => Math.min(total - 1, prev + 1))}
                  >
                    {t("app.next")}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </>
          ) : (
            <div className="py-10 text-center text-sm text-zinc-400">
              {t("assessment.unavailable")}
            </div>
          )}
        </CardContent>
      </Card>
        </>
      )}
    </div>
  );
}
