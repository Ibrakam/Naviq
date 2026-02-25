"use client";

import { Timer, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useT } from "@/hooks/useT";
import { useGamificationStore } from "@/stores/gamificationStore";

export function DailyQuestCard() {
  const { t } = useT();
  const quest = useGamificationStore((s) => s.dailyQuest);
  const complete = useGamificationStore((s) => s.completeDailyQuest);
  const fetchDailyQuest = useGamificationStore((s) => s.fetchDailyQuest);

  if (!quest) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("gamification.dailyQuest")}</CardTitle>
          <CardDescription>{t("gamification.loading")}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-cyan-300/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Timer className="h-4 w-4 text-cyan-300" />
          {quest.title}
        </CardTitle>
        <CardDescription className="text-zinc-300">{quest.prompt}</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-3">
        <p className="text-xs text-zinc-400">{t("gamification.questMeta", { xp: quest.xp_reward })}</p>
        <Button
          size="sm"
          disabled={quest.completed}
          onClick={async () => {
            try {
              const res = await complete();
              toast.success(t("gamification.dailyQuestDone", { xp: res.gained_xp }));
              await fetchDailyQuest();
            } catch (err) {
              toast.error(err instanceof Error ? err.message : t("gamification.dailyQuestFailed"));
            }
          }}
        >
          {quest.completed ? (
            <>
              <CheckCircle2 className="h-4 w-4" /> {t("gamification.completed")}
            </>
          ) : (
            t("gamification.complete")
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
