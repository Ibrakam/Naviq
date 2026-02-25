"use client";

import { cn } from "@/lib/utils";
import { useT } from "@/hooks/useT";
import { useGamificationStore } from "@/stores/gamificationStore";

const rarityClass: Record<string, string> = {
  common: "border-zinc-300/20",
  uncommon: "border-cyan-300/25",
  rare: "border-lime-300/25",
  epic: "border-fuchsia-300/35",
  legendary: "border-amber-300/45",
};

export function AchievementGrid() {
  const { t } = useT();
  const achievements = useGamificationStore((s) => s.achievements);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {achievements.map((achievement) => (
        <div
          key={achievement.key}
          className={cn(
            "rounded-xl border bg-white/[0.03] p-3 transition",
            rarityClass[achievement.rarity] || "border-white/10",
            achievement.unlocked ? "opacity-100" : "opacity-70",
          )}
        >
          <p className="line-clamp-2 text-sm font-medium text-zinc-100">{achievement.name}</p>
          <p className="mt-1 text-xs uppercase text-zinc-400">{achievement.rarity}</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full bg-cyan-300" style={{ width: `${Math.max(0, Math.min(100, achievement.progress * 100))}%` }} />
          </div>
        </div>
      ))}
      {!achievements.length ? <p className="text-sm text-zinc-500">{t("gamification.noAchievements")}</p> : null}
    </div>
  );
}
