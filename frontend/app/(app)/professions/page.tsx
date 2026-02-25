"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BriefcaseBusiness } from "lucide-react";
import { GapChart } from "@/components/charts/GapChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useT } from "@/hooks/useT";
import { useSkillStore } from "@/stores/skillStore";
import { api } from "@/lib/api";
import type { GapAnalysisResponse } from "@/types/api";

export default function ProfessionsPage() {
  const { t } = useT();
  const professions = useSkillStore((s) => s.professions);
  const fetchProfessions = useSkillStore((s) => s.fetchProfessions);
  const [selected, setSelected] = useState<string | null>(null);
  const [gap, setGap] = useState<GapAnalysisResponse | null>(null);

  useEffect(() => {
    fetchProfessions().then((list) => {
      if (list[0]) setSelected(list[0].id);
    }).catch(() => undefined);
  }, [fetchProfessions]);

  useEffect(() => {
    if (!selected) return;
    api.get<GapAnalysisResponse>(`/professions/${selected}/gap`).then(setGap).catch(() => setGap(null));
  }, [selected]);

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <Card className="xl:col-span-1">
        <CardHeader>
          <CardTitle>{t("professions.title")}</CardTitle>
          <CardDescription>{t("professions.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {professions.map((profession) => (
            <button
              key={profession.id}
              onClick={() => setSelected(profession.id)}
              className="flex w-full items-center justify-between rounded-xl border border-white/10 px-3 py-2 text-left text-sm text-zinc-200 hover:bg-white/5"
            >
              <span className="flex items-center gap-2">
                <BriefcaseBusiness className="h-4 w-4 text-cyan-300" />
                {profession.title}
              </span>
              <Button asChild size="sm" variant="ghost">
                <Link href={`/professions/${profession.id}`}>{t("professions.open")}</Link>
              </Button>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle>{t("professions.gapTitle")}</CardTitle>
          <CardDescription>
            {gap ? `${gap.profession_title}: ${gap.match_percentage}%` : t("professions.gapNoData")}
          </CardDescription>
        </CardHeader>
        <CardContent>{gap ? <GapChart gaps={gap.gaps} /> : <p className="text-sm text-zinc-400">{t("professions.noData")}</p>}</CardContent>
      </Card>
    </div>
  );
}
