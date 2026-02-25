"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useGamificationStore } from "@/stores/gamificationStore";
import { AchievementGrid } from "@/components/gamification/AchievementGrid";
import { CareerIdentityCard } from "@/components/gamification/CareerIdentityCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useT } from "@/hooks/useT";

export default function ProfilePage() {
  const { t } = useT();
  const user = useAuthStore((s) => s.user);
  const profile = useGamificationStore((s) => s.profile);
  const fetchProfile = useGamificationStore((s) => s.fetchProfile);
  const fetchAchievements = useGamificationStore((s) => s.fetchAchievements);
  const soundEnabled = useGamificationStore((s) => s.soundEnabled);
  const setSoundEnabled = useGamificationStore((s) => s.setSoundEnabled);

  useEffect(() => {
    fetchProfile().catch(() => undefined);
    fetchAchievements().catch(() => undefined);
  }, [fetchAchievements, fetchProfile]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("profile.title")}</CardTitle>
          <CardDescription>{t("profile.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-zinc-300">{t("profile.name")}: {user?.full_name ?? "-"}</p>
          <p className="text-sm text-zinc-300">{t("profile.email")}: {user?.email ?? "-"}</p>
          <p className="text-sm text-zinc-300">{t("profile.university")}: {profile?.university?.name ?? "-"}</p>
          <p className="text-sm text-zinc-300">{t("profile.streak")}: {profile?.streak ?? 0} {t("profile.days")}</p>
          <div className="flex items-center gap-2">
            <Badge>{(user?.role ?? "student").toString().toUpperCase()}</Badge>
            <Badge variant="lime">{t("app.xp")}: {user?.xp ?? 0}</Badge>
            <Badge variant="muted">{t("profile.attempts")}: {user?.attempts_balance ?? 0}</Badge>
          </div>
          <div className="pt-2">
            <Button size="sm" variant={soundEnabled ? "outline" : "ghost"} onClick={() => setSoundEnabled(!soundEnabled)}>
              {t("profile.sound")}: {soundEnabled ? t("profile.on") : t("profile.off")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <CareerIdentityCard />

      <Card>
        <CardHeader>
          <CardTitle>{t("profile.artifactsTitle")}</CardTitle>
          <CardDescription>{t("profile.artifactsSubtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <AchievementGrid />
        </CardContent>
      </Card>
    </div>
  );
}
