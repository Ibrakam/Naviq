"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useT } from "@/hooks/useT";
import type { AssessmentQuestionOut } from "@/types/api";

type UserAnswer = {
  question_id: string;
  answer: string;
};

export function SkillAssessmentDialog({
  open,
  onOpenChange,
  questions,
  loading,
  submitting,
  onRequestQuestions,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questions: AssessmentQuestionOut[];
  loading: boolean;
  submitting: boolean;
  onRequestQuestions: () => Promise<void>;
  onSubmit: (answers: UserAnswer[]) => Promise<void>;
}) {
  const { t } = useT();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open && questions.length === 0 && !loading) {
      onRequestQuestions().catch(() => undefined);
    }
  }, [loading, onRequestQuestions, open, questions.length]);

  useEffect(() => {
    if (!open) {
      setIndex(0);
      setAnswers({});
    }
  }, [open]);

  const total = questions.length;
  const current = questions[index];
  const selected = current ? answers[current.id] : undefined;
  const progress = total ? ((index + 1) / total) * 100 : 0;

  const preparedAnswers = useMemo(
    () =>
      questions
        .filter((question) => answers[question.id])
        .map((question) => ({ question_id: question.id, answer: answers[question.id] })),
    [answers, questions],
  );

  const isLast = index === total - 1;
  const canContinue = Boolean(selected) && !submitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("assessment.title")}</DialogTitle>
          <DialogDescription>{t("assessment.subtitle")}</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex min-h-56 items-center justify-center text-sm text-zinc-400">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t("assessment.loadingQuestions")}
          </div>
        ) : current ? (
          <div className="space-y-5">
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
          </div>
        ) : (
          <div className="py-8 text-sm text-zinc-400">{t("assessment.unavailable")}</div>
        )}

        <DialogFooter className="mt-2 sm:justify-between">
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
            <Button
              type="button"
              disabled={!canContinue}
              onClick={async () => {
                if (!canContinue) return;
                await onSubmit(preparedAnswers);
              }}
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {t("app.submit")}
            </Button>
          ) : (
            <Button
              type="button"
              disabled={!canContinue}
              onClick={() => {
                if (!canContinue) return;
                setIndex((prev) => Math.min(total - 1, prev + 1));
              }}
            >
              {t("app.next")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
