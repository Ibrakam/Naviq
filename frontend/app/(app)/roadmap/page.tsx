"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { ProfessionOut } from "@/types/api";
import { SVGPathJourney } from "@/components/roadmap/SVGPathJourney";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useT } from "@/hooks/useT";

export default function RoadmapPage() {
  const { t } = useT();
  const [professions, setProfessions] = useState<ProfessionOut[]>([]);
  const [selected, setSelected] = useState<string>("");

  useEffect(() => {
    api.get<ProfessionOut[]>("/professions").then((list) => {
      setProfessions(list);
      if (list[0]) setSelected(list[0].id);
    });
  }, []);

  const selectedProfession = professions.find((p) => p.id === selected);
  const steps = Object.entries(selectedProfession?.reference_skills ?? {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([skill], index) => ({ title: skill.replaceAll("_", " "), completed: index < 2 }));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("roadmapPage.title")}</CardTitle>
          <CardDescription>{t("roadmapPage.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="max-w-sm">
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger>
              <SelectValue placeholder={t("roadmapPage.chooseProfession")} />
            </SelectTrigger>
            <SelectContent>
              {professions.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <SVGPathJourney steps={steps} />
    </div>
  );
}
