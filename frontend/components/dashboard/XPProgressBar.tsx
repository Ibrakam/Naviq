import { Progress } from "@/components/ui/progress";
import { useT } from "@/hooks/useT";

export function XPProgressBar({
  xp,
  level,
  rankTitle,
  progress,
}: {
  xp: number;
  level?: number;
  rankTitle?: string;
  progress?: number;
}) {
  const { t } = useT();
  const fallbackLevel = Math.floor(xp / 500) + 1;
  const currentLevel = level ?? fallbackLevel;
  const fallbackProgress = ((xp % 500) / 500) * 100;
  const barValue = Math.max(0, Math.min(100, progress ?? fallbackProgress));

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs text-zinc-400">
        <span>
          {t("app.level")} {currentLevel}
          {rankTitle ? ` • ${rankTitle}` : ""}
        </span>
        <span>{xp} {t("app.xp")}</span>
      </div>
      <Progress value={barValue} />
    </div>
  );
}
