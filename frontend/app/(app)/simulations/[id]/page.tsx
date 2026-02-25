"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { ChatInterface, type ChatMessage } from "@/components/simulation/ChatInterface";
import { FeedbackFlash } from "@/components/simulation/FeedbackFlash";
import { WorkArea } from "@/components/simulation/WorkArea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SkillRadar } from "@/components/charts/SkillRadar";
import { useT } from "@/hooks/useT";
import { useAuthStore } from "@/stores/authStore";
import { useSimulationStore } from "@/stores/simulationStore";
import { getAssistantMessageFromStep } from "@/lib/simulation-contract";

export default function SimulationLabPage() {
  const { t } = useT();
  const params = useParams<{ id: string }>();
  const simulationId = params.id;

  const startSimulation = useSimulationStore((s) => s.startSimulation);
  const answerStep = useSimulationStore((s) => s.answerStep);
  const active = useSimulationStore((s) => s.active);
  const loading = useSimulationStore((s) => s.loading);

  const user = useAuthStore((s) => s.user);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [answer, setAnswer] = useState("");
  const [feedbackState, setFeedbackState] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    startSimulation(simulationId)
      .then((result) => {
        const text = getAssistantMessageFromStep(result.step);
        setMessages([{ id: "init", role: "ai", text: text || t("simulationLab.initialized") }]);
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : t("simulationLab.startFailed")));
  }, [simulationId, startSimulation, t]);

  const progressText = useMemo(() => {
    if (!active) return "0/0";
    const current = active.session.current_step_order;
    const total = Math.max(current, active.session.answers.length + 1);
    return `${current}/${total}`;
  }, [active]);

  const submitAnswer = async () => {
    if (!answer.trim()) return;

    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: "user", text: answer };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const result = await answerStep(simulationId, answer);
      setAnswer("");

      const aiText = result.finished
        ? result.skill_update
          ? t("simulationLab.completeWithDelta", { delta: JSON.stringify(result.skill_update) })
          : t("simulationLab.completeNoDelta")
        : getAssistantMessageFromStep(result.step) || t("simulationLab.nextStep");

      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "ai", text: aiText }]);
      setFeedbackState("success");
      setTimeout(() => setFeedbackState("idle"), 550);
    } catch (err) {
      setFeedbackState("error");
      setTimeout(() => setFeedbackState("idle"), 700);
      toast.error(err instanceof Error ? err.message : t("simulationLab.submitFailed"));
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{t("simulationLab.mentorChat")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ChatInterface messages={messages} />
        </CardContent>
      </Card>

      <Card className="relative">
        <AnimatePresence>
          <FeedbackFlash state={feedbackState} />
        </AnimatePresence>

        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{t("simulationLab.workArea")}</span>
            <span className="text-sm text-zinc-400">{t("simulationLab.step", { value: progressText })}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <WorkArea step={active?.step ?? null} answer={answer} onAnswerChange={setAnswer} />

          <div className="flex justify-end">
            <Button onClick={submitAnswer} disabled={loading || !answer.trim()}>
              {t("simulationLab.submitStep")}
            </Button>
          </div>

          {active?.finished ? (
            <div className="rounded-2xl border border-lime-300/30 bg-lime-300/10 p-4">
              <h4 className="mb-2 font-space text-lg">{t("simulationLab.skillSnapshot")}</h4>
              <SkillRadar data={user?.skill_profile ?? null} />
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
