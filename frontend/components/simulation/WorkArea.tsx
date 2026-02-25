"use client";

import { Code2, ListTodo, MessageSquareText } from "lucide-react";
import type { SimulationStepOut } from "@/types/api";
import { Textarea } from "@/components/ui/textarea";
import { parseSimulationStepContent } from "@/lib/simulation-contract";
import { Button } from "@/components/ui/button";
import { useT } from "@/hooks/useT";

export function WorkArea({
  step,
  answer,
  onAnswerChange,
}: {
  step: SimulationStepOut | null;
  answer: string;
  onAnswerChange: (value: string) => void;
}) {
  const { t } = useT();
  const content = parseSimulationStepContent(step);
  const type = content?.type ?? step?.type ?? "question";
  const placeholder = content?.placeholder ?? t("simulationLab.writeResponse");
  const panelTitle =
    type === "task" ? t("simulationLab.taskArea") : type === "dialog" ? t("simulationLab.dialogArea") : t("simulationLab.questionArea");

  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <div className="mb-4 flex items-center gap-2 text-zinc-300">
        {type === "task" && <ListTodo className="h-4 w-4" />}
        {type === "dialog" && <MessageSquareText className="h-4 w-4" />}
        {(type === "question" || !type) && <Code2 className="h-4 w-4" />}
        <span className="text-sm capitalize">{panelTitle}</span>
      </div>

      {content?.type === "question" ? (
        <div className="mb-4 space-y-2 rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <p className="text-sm text-zinc-200">{content.prompt}</p>
          {content.hint ? <p className="text-xs text-zinc-400">{t("simulationLab.hint")}: {content.hint}</p> : null}
          {content.options.length ? (
            <div className="flex flex-wrap gap-2">
              {content.options.map((option) => (
                <Button key={option} variant="outline" size="sm" onClick={() => onAnswerChange(option)}>
                  {option}
                </Button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {content?.type === "task" ? (
        <div className="mb-4 space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <h4 className="text-sm font-semibold text-zinc-200">{content.title}</h4>
          <p className="text-sm text-zinc-300">{content.instructions}</p>
          {content.checklist.length ? (
            <ul className="space-y-1 text-xs text-zinc-400">
              {content.checklist.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          ) : null}
          {content.starter_template ? (
            <pre className="max-h-40 overflow-auto rounded-lg border border-white/10 bg-black/40 p-2 text-xs text-zinc-300">
              {content.starter_template}
            </pre>
          ) : null}
        </div>
      ) : null}

      {content?.type === "dialog" ? (
        <div className="mb-4 space-y-2 rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <p className="text-sm text-zinc-200">{content.mentor_message}</p>
          {content.context ? <p className="text-xs text-zinc-400">{t("simulationLab.context")}: {content.context}</p> : null}
          {content.suggested_replies.length ? (
            <div className="flex flex-wrap gap-2">
              {content.suggested_replies.map((reply) => (
                <Button key={reply} variant="outline" size="sm" onClick={() => onAnswerChange(reply)}>
                  {reply}
                </Button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <Textarea
        value={answer}
        onChange={(event) => onAnswerChange(event.target.value)}
        placeholder={placeholder}
        className="min-h-[28vh]"
      />
    </div>
  );
}
