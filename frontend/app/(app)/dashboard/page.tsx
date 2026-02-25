"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Target, Zap } from "lucide-react";
import { BentoGrid, BentoItem } from "@/components/dashboard/BentoGrid";
import { CareerMatchCard } from "@/components/dashboard/CareerMatchCard";
import { SkillRadar } from "@/components/charts/SkillRadar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DailyQuestCard } from "@/components/gamification/DailyQuestCard";
import { UniversityLeaderboardCard } from "@/components/gamification/UniversityLeaderboardCard";
import { useT } from "@/hooks/useT";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/stores/authStore";
import { useSkillStore } from "@/stores/skillStore";
import { hasCompletedSkillProfile } from "@/lib/utils";

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useT();

  const user = useAuthStore((s) => s.user);
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const fetchTopMatches = useSkillStore((s) => s.fetchTopMatches);
  const topMatches = useSkillStore((s) => s.topMatches);
  const skillProfile = useSkillStore((s) => s.skillProfile) ?? user?.skill_profile ?? null;

  const [showAssessmentPrompt, setShowAssessmentPrompt] = useState(false);
  const [bootstrapped, setBootstrapped] = useState(false);
  const [promptShownOnce, setPromptShownOnce] = useState(false);

  useEffect(() => {
    fetchMe()
      .then(() => fetchTopMatches())
      .catch(() => undefined)
      .finally(() => setBootstrapped(true));
  }, [fetchMe, fetchTopMatches]);

  const attempts = user?.attempts_balance ?? 0;
  const hasSkillProfile = hasCompletedSkillProfile(skillProfile);

  useEffect(() => {
    if (!bootstrapped || promptShownOnce) return;
    if (!hasSkillProfile) {
      setShowAssessmentPrompt(true);
    }
    setPromptShownOnce(true);
  }, [bootstrapped, hasSkillProfile, promptShownOnce]);

  useEffect(() => {
    if (hasSkillProfile && showAssessmentPrompt) {
      setShowAssessmentPrompt(false);
    }
  }, [hasSkillProfile, showAssessmentPrompt]);

  const topTwo = useMemo(() => topMatches.slice(0, 2), [topMatches]);

  return (
    <div className="space-y-4">
      <BentoGrid>
        <BentoItem className="lg:col-span-3 lg:row-span-2">
          <SkillRadar data={skillProfile} />
        </BentoItem>

        <BentoItem className="lg:col-span-1">
          {topTwo[0] ? (
            <CareerMatchCard match={topTwo[0]} />
          ) : (
            <Card className="h-full">
              <CardHeader>
                <CardTitle>{t("dashboard.noMatchesTitle")}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-zinc-400">{t("dashboard.noMatchesDesc")}</CardContent>
            </Card>
          )}
        </BentoItem>

        <BentoItem className="lg:col-span-1">
          {topTwo[1] ? (
            <CareerMatchCard match={topTwo[1]} />
          ) : (
            <Card className="h-full">
              <CardHeader>
                <CardTitle>{t("dashboard.secondMatchTitle")}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-zinc-400">{t("dashboard.secondMatchDesc")}</CardContent>
            </Card>
          )}
        </BentoItem>

        <BentoItem className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Zap className="h-4 w-4 text-lime-300" />
                XP
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-zinc-100">{user?.xp ?? 0}</p>
              <p className="text-xs text-zinc-400">{t("dashboard.currentProgress")}</p>
            </CardContent>
          </Card>
        </BentoItem>

        <BentoItem className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Target className="h-4 w-4 text-cyan-300" />
                {t("dashboard.attemptsTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-zinc-100">{attempts}</p>
              <p className="text-xs text-zinc-400">{t("dashboard.attemptsRemaining")}</p>
            </CardContent>
          </Card>
        </BentoItem>

        <BentoItem className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Sparkles className="h-4 w-4 text-cyan-300" />
                {t("dashboard.quickActions")}
              </CardTitle>
              <CardDescription>
                {hasSkillProfile ? t("dashboard.completedDesc") : t("dashboard.needAssessmentDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              {hasSkillProfile ? (
                <Button onClick={() => router.push("/professions")}>{t("dashboard.viewProfessions")}</Button>
              ) : (
                <Button disabled={attempts <= 0} onClick={() => router.push("/assessment")}>
                  {t("dashboard.takeAssessment")}
                </Button>
              )}
            </CardContent>
          </Card>
        </BentoItem>

        <BentoItem className="lg:col-span-2">
          <DailyQuestCard />
        </BentoItem>

        <BentoItem className="lg:col-span-2">
          <UniversityLeaderboardCard />
        </BentoItem>
      </BentoGrid>

      <Dialog open={showAssessmentPrompt} onOpenChange={setShowAssessmentPrompt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("dashboard.modalTitle")}</DialogTitle>
            <DialogDescription>
              {t("dashboard.modalDesc")}
              {attempts <= 0 ? ` ${t("dashboard.noAttempts")}` : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssessmentPrompt(false)}>
              {t("app.later")}
            </Button>
            <Button disabled={attempts <= 0} onClick={() => router.push("/assessment")}>
              {t("app.start")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
