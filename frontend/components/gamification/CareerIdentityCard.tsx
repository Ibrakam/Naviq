"use client";

import { useEffect } from "react";
import { Radar, RadarChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useT } from "@/hooks/useT";
import { useGamificationStore } from "@/stores/gamificationStore";

function toRadarData(skills: Record<string, number>) {
  return Object.entries(skills).map(([name, value]) => ({
    name,
    value: Math.round(Number(value || 0) * 100),
  }));
}

export function CareerIdentityCard() {
  const { t } = useT();
  const card = useGamificationStore((s) => s.careerCard);
  const fetchCard = useGamificationStore((s) => s.fetchCareerCard);

  useEffect(() => {
    fetchCard().catch(() => undefined);
  }, [fetchCard]);

  if (!card) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("gamification.careerIdentityCard")}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-zinc-500">{t("app.loading")}</CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-cyan-300/20 bg-[linear-gradient(135deg,rgba(0,242,255,0.08),rgba(204,255,0,0.04))]">
      <CardHeader>
        <CardTitle className="text-base">{t("gamification.careerIdentityCard")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-[1fr,1.2fr,1fr]">
          <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-zinc-200">
            <p className="font-medium">{card.student_name}</p>
            <p className="text-zinc-400">{t("app.level")} {card.level}</p>
            <p className="text-zinc-400">{card.xp} {t("app.xp")}</p>
          </div>

          <div className="h-48 rounded-xl border border-white/10 bg-black/20 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={toRadarData(card.skill_profile as Record<string, number>)}>
                <PolarGrid stroke="rgba(255,255,255,0.12)" />
                <PolarAngleAxis dataKey="name" tick={{ fill: "#a1a1aa", fontSize: 10 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar dataKey="value" stroke="#00F2FF" fill="#00F2FF" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="text-sm font-semibold text-zinc-100">{card.title}</p>
            <Badge variant="lime">{card.rank}</Badge>
            <div className="flex flex-wrap gap-1">
              {card.top_badges.map((badge) => (
                <Badge key={badge} variant="muted" className="text-[10px]">
                  {badge}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
