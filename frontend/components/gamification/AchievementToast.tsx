import { Trophy } from "lucide-react";
import { useT } from "@/hooks/useT";

export function AchievementToast({
  title,
  rarity,
}: {
  title: string;
  rarity: string;
}) {
  const { t } = useT();
  const glow =
    rarity === "legendary"
      ? "from-amber-300/70 to-yellow-500/60"
      : rarity === "epic"
        ? "from-fuchsia-300/60 to-cyan-300/60"
        : rarity === "rare"
          ? "from-cyan-300/60 to-lime-300/60"
          : "from-zinc-200/50 to-zinc-500/30";

  return (
    <div className="relative overflow-hidden rounded-xl border border-white/15 bg-[#090d17] p-3">
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-r opacity-25 ${glow}`} />
      <div className="relative flex items-start gap-3">
        <div className="rounded-lg border border-white/15 bg-white/5 p-2">
          <Trophy className="h-4 w-4 text-cyan-300" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-400">{t("gamification.achievementUnlocked")}</p>
          <p className="text-sm font-medium text-zinc-100">{title}</p>
        </div>
      </div>
    </div>
  );
}
