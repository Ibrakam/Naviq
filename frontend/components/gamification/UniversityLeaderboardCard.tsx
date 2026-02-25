"use client";

import { Crown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useT } from "@/hooks/useT";
import { useGamificationStore } from "@/stores/gamificationStore";

export function UniversityLeaderboardCard() {
  const { t } = useT();
  const leaderboard = useGamificationStore((s) => s.leaderboard);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Crown className="h-4 w-4 text-lime-300" /> {t("gamification.universityLeaderboard")}
        </CardTitle>
        <CardDescription>{t("gamification.universityLeaderboardSubtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {leaderboard.slice(0, 5).map((item) => (
          <div
            key={item.university_id}
            className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2"
          >
            <div>
              <p className="text-sm text-zinc-100">#{item.rank} {item.university_name}</p>
              <p className="text-xs text-zinc-400">
                {item.delta === null || item.delta === undefined
                  ? "-"
                  : item.delta > 0
                    ? `+${item.delta}`
                    : String(item.delta)}
              </p>
            </div>
            <p className="text-sm font-semibold text-cyan-200">{Math.round(item.score)}</p>
          </div>
        ))}
        {!leaderboard.length ? <p className="text-sm text-zinc-500">{t("gamification.noLeaderboard")}</p> : null}
      </CardContent>
    </Card>
  );
}
