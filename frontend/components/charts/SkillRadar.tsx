"use client";

import { useMemo, useState } from "react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";
import { Badge } from "@/components/ui/badge";
import { useT } from "@/hooks/useT";
import type { SkillVector } from "@/types/api";
import { percentageFromSkill, SKILL_KEYS } from "@/lib/utils";

export function SkillRadar({ data }: { data: SkillVector | null }) {
  const [active, setActive] = useState<string | null>(null);
  const { t } = useT();

  const labels: Record<(typeof SKILL_KEYS)[number], string> = {
    communication: t("charts.skillLabels.communication"),
    leadership: t("charts.skillLabels.leadership"),
    analytics: t("charts.skillLabels.analytics"),
    creativity: t("charts.skillLabels.creativity"),
    technical: t("charts.skillLabels.technical"),
    teamwork: t("charts.skillLabels.teamwork"),
    problem_solving: t("charts.skillLabels.problem_solving"),
    time_management: t("charts.skillLabels.time_management"),
    adaptability: t("charts.skillLabels.adaptability"),
    critical_thinking: t("charts.skillLabels.critical_thinking"),
  };

  const tips: Record<string, string> = {
    communication: t("charts.skillTips.communication"),
    leadership: t("charts.skillTips.leadership"),
    analytics: t("charts.skillTips.analytics"),
    creativity: t("charts.skillTips.creativity"),
    technical: t("charts.skillTips.technical"),
    teamwork: t("charts.skillTips.teamwork"),
    problem_solving: t("charts.skillTips.problem_solving"),
    time_management: t("charts.skillTips.time_management"),
    adaptability: t("charts.skillTips.adaptability"),
    critical_thinking: t("charts.skillTips.critical_thinking"),
  };

  const chartData = useMemo(() => {
    if (!data) {
      return SKILL_KEYS.map((key) => ({ skill: labels[key], value: 0.4, key }));
    }

    return SKILL_KEYS.map((key) => ({
      skill: labels[key],
      value: Number(data[key] ?? 0),
      key,
    }));
  }, [data]);

  return (
    <div className="h-full w-full">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-space text-lg text-zinc-100">{t("charts.skillRadar")}</h3>
        {active ? <Badge>{tips[active]}</Badge> : <Badge variant="muted">{t("charts.hoverSkill")}</Badge>}
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData}>
            <PolarGrid stroke="rgba(255,255,255,0.12)" />
            <PolarAngleAxis dataKey="skill" tick={{ fill: "#a1a1aa", fontSize: 11 }} />
            <Tooltip
              formatter={(value) => `${percentageFromSkill(Number(value))}%`}
              contentStyle={{ background: "#0A0F1E", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }}
              cursor={{ stroke: "#00F2FF", strokeOpacity: 0.3 }}
            />
            <Radar
              dataKey="value"
              stroke="#00F2FF"
              fill="#00F2FF"
              fillOpacity={0.2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {chartData.map((entry) => (
          <button
            key={entry.key}
            onMouseEnter={() => setActive(entry.key)}
            onMouseLeave={() => setActive(null)}
            className="rounded-full border border-white/15 bg-white/5 px-2 py-1 text-[11px] text-zinc-300 hover:border-cyan-300/40 hover:text-cyan-200"
          >
            {entry.skill}
          </button>
        ))}
      </div>
    </div>
  );
}
