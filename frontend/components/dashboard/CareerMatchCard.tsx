"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useT } from "@/hooks/useT";
import type { GapAnalysisResponse } from "@/types/api";

export function CareerMatchCard({ match }: { match: GapAnalysisResponse }) {
  const { t } = useT();
  return (
    <div>
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="line-clamp-1">{match.profession_title}</span>
            <Sparkles className="h-4 w-4 text-cyan-300" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-3xl font-semibold text-lime-300">{match.match_percentage}%</p>
          <p className="text-sm text-zinc-400">{t("charts.matchScoreDesc")}</p>
          <Link
            href={`/professions/${match.profession_id}`}
            className="inline-flex h-9 w-full items-center justify-between rounded-md border border-white/15 bg-transparent px-4 text-sm font-medium text-zinc-100 transition hover:bg-white/5"
          >
            {t("charts.openRoadmap")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
