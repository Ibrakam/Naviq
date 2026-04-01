"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Info,
  Loader2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useT } from "@/hooks/useT";
import { cn, hasCompletedSkillProfile } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { useSkillStore } from "@/stores/skillStore";

type UserAnswer = {
  question_id: string;
  answer: string;
};

function getModuleTitle(category: string | undefined) {
  switch ((category ?? "").toLowerCase()) {
    case "scenario":
      return "Leadership & Strategy Assessment";
    case "teaching":
      return "Communication & Teaching Assessment";
    case "incident":
      return "Systems Reliability Assessment";
    case "values":
      return "Values & Product Judgment";
    case "hackathon":
      return "Execution & Ownership Assessment";
    case "teamwork":
      return "Collaboration Intelligence Assessment";
    default:
      return "Career Orientation Assessment";
  }
}

function getBranchLabel(category: string | undefined) {
  switch ((category ?? "").toLowerCase()) {
    case "scenario":
      return "Decision Logic Branch";
    case "teaching":
      return "Knowledge Transfer Branch";
    case "incident":
      return "Incident Response Branch";
    case "values":
      return "Product Values Branch";
    case "hackathon":
      return "Builder Archetype Branch";
    case "teamwork":
      return "Team Dynamics Branch";
    default:
      return "Orientation Logic Branch";
  }
}

function getVisualLabel(category: string | undefined) {
  switch ((category ?? "").toLowerCase()) {
    case "scenario":
      return "Leadership simulation active";
    case "teaching":
      return "Knowledge systems active";
    case "incident":
      return "Response intelligence active";
    case "values":
      return "Career intelligence active";
    case "hackathon":
      return "Execution track active";
    case "teamwork":
      return "Collaboration intel active";
    default:
      return "Career intelligence active";
  }
}

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
  const answeredCount = Object.keys(answers).length;
  const progress = total ? Math.round(((index + 1) / total) * 100) : 0;
  const completionProgress = total ? Math.round((answeredCount / total) * 100) : 0;

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

  const preparedAnswers = useMemo<UserAnswer[]>(
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

  if (bootstrapped && hasSkillProfile) {
    return (
      <div className="space-y-6 pb-8">
        <section className="obsidian-glass obsidian-ghost-border rounded-[2rem] p-8 md:p-10">
          <p className="text-xs font-black uppercase tracking-[0.26em] text-[#7ca8ff]">Orientation Complete</p>
          <h1 className="mt-4 text-[3rem] font-black tracking-[-0.07em] text-[#20283b] md:text-[4rem]">
            Career profile already calibrated.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-[#6d7891]">
            Your assessment is already finished. You can review career matches or return to the dashboard for the next step.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Button asChild className="rounded-2xl bg-[linear-gradient(135deg,#b7cef9,#8fb1f4)] px-6 text-[#17305e] hover:opacity-95">
              <Link href="/professions">{t("assessment.toProfessions")}</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-2xl border-[#c7d4ea] bg-transparent text-[#284482] hover:bg-[#edf3ff]">
              <Link href="/dashboard">{t("assessment.toDashboard")}</Link>
            </Button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {!bootstrapped ? (
        <div className="obsidian-glass rounded-[2rem] px-6 py-12 text-sm text-[#6d7891]">
          Loading orientation shell...
        </div>
      ) : null}

      {bootstrapped && !hasSkillProfile ? (
        <div className="grid gap-8 xl:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
          <section className="space-y-6">
            <div className="obsidian-glass obsidian-ghost-border rounded-[1.8rem] p-8">
              <p className="text-xs font-black uppercase tracking-[0.26em] text-[#5d84f1]">Current Module</p>
              <h2 className="mt-5 text-[2.4rem] font-black leading-[1.02] tracking-[-0.06em] text-[#20283b]">
                {getModuleTitle(current?.category)}
              </h2>
              <p className="mt-6 text-base leading-8 text-[#6d7891]">
                This scenario-based test maps your instinctive reactions to work situations and projects your strongest career direction.
              </p>

              <div className="mt-10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#24304a]">Overall Progress</span>
                  <span className="text-sm font-black text-[#4f74d6]">{completionProgress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#e3e9f3]">
                  <div
                    className="h-full bg-[linear-gradient(90deg,#84a2f5,#5d84f1)] shadow-[0_0_12px_rgba(93,132,241,0.16)]"
                    style={{ width: `${Math.max(completionProgress, total ? 4 : 0)}%` }}
                  />
                </div>
                <p className="text-xs leading-6 text-[#8a92a9]">
                  {t("assessment.attempts", { count: attempts })}
                </p>
              </div>
            </div>

            <div className="relative aspect-video overflow-hidden rounded-[1.8rem]">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,#edf3ff,#dce7fb_35%,#f4efe6_72%,#fffaf1)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(182,221,255,0.56),transparent_18%),linear-gradient(180deg,rgba(255,255,255,0.26),transparent_48%)] opacity-90" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#f6f2ea] to-transparent px-5 py-4">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-[#4f74d6]" />
                  <span className="text-[11px] font-black uppercase tracking-[0.18em] text-[#20283b]">
                    {getVisualLabel(current?.category)}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <span className="rounded-full bg-[#edf3ff] px-4 py-2 text-sm font-black text-[#4f74d6]">
                Question {String(index + 1).padStart(2, "0")} of {String(Math.max(total, 1)).padStart(2, "0")}
              </span>
              <div className="h-px flex-1 bg-[#d9e1ec]" />
            </div>

            <div className="obsidian-glass obsidian-ghost-border rounded-[2rem] p-8 md:p-10">
              {loading && !questions.length ? (
                <div className="flex min-h-[28rem] items-center justify-center text-sm text-[#6d7891]">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("assessment.loadingQuestions")}
                </div>
              ) : current ? (
                <>
                  <div className="mb-10">
                    <h1 className="max-w-5xl text-[2.35rem] font-black leading-[1.08] tracking-[-0.06em] text-[#20283b] md:text-[3.3rem]">
                      {current.question}
                    </h1>
                    <div className="mt-6 flex items-center gap-2 text-[#4f74d6]">
                      <Sparkles className="h-4 w-4" />
                      <span className="text-xs font-black uppercase tracking-[0.2em]">
                        {getBranchLabel(current.category)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
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
                          className={cn(
                            "group relative flex items-start gap-6 rounded-[1.4rem] border px-6 py-6 text-left transition-all duration-200 active:scale-[0.995]",
                            active
                              ? "border-[#b7caf5] bg-[#eef4ff] shadow-[0_16px_36px_rgba(93,132,241,0.12)]"
                              : "border-[#d9e1ec] bg-[#fffdf8]/84 hover:border-[#c7d4ea] hover:bg-[#f8fbff]",
                          )}
                        >
                          <span
                            className={cn(
                              "flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] text-lg font-black transition-colors",
                              active
                                ? "bg-[#8fb1f4] text-[#17305e]"
                                : "bg-[#edf3ff] text-[#4f74d6] group-hover:bg-[#dbe7ff] group-hover:text-[#17305e]",
                            )}
                          >
                            {option.code}
                          </span>

                          <div className="flex-1 pt-0.5">
                            <span className={cn("block text-[1.1rem] font-semibold transition-colors", active ? "text-[#20283b]" : "text-[#24304a]")}>
                              {option.text}
                            </span>
                            <span className="mt-2 block text-sm leading-7 text-[#6d7891]">
                              Select the option that feels closest to your natural response.
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-[#d9e1ec] pt-8">
                    <button
                      type="button"
                      disabled={submitting || index <= 0}
                      onClick={() => setIndex((prev) => Math.max(0, prev - 1))}
                      className="inline-flex items-center gap-2 px-2 text-lg font-black text-[#8a92a9] transition-colors hover:text-[#20283b] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ArrowLeft className="h-5 w-5" />
                      Previous
                    </button>

                    {isLast ? (
                      <button
                        type="button"
                        disabled={!selected || submitting || attempts <= 0}
                        onClick={submit}
                        className="inline-flex items-center gap-3 rounded-[1.1rem] bg-[linear-gradient(135deg,#b7cef9,#8fb1f4)] px-8 py-4 text-lg font-black text-[#17305e] shadow-[0_10px_32px_rgba(93,132,241,0.18)] transition-all hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                        <span>{t("app.complete")}</span>
                        {!submitting ? <ArrowRight className="h-5 w-5" /> : null}
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={!selected || submitting}
                        onClick={() => setIndex((prev) => Math.min(total - 1, prev + 1))}
                        className="inline-flex items-center gap-3 rounded-[1.1rem] bg-[linear-gradient(135deg,#b7cef9,#8fb1f4)] px-8 py-4 text-lg font-black text-[#17305e] shadow-[0_10px_32px_rgba(93,132,241,0.18)] transition-all hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <span>Next Question</span>
                        <ArrowRight className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="py-10 text-center text-sm text-[#6d7891]">
                  {t("assessment.unavailable")}
                </div>
              )}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
