"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { AchievementToast } from "@/components/gamification/AchievementToast";
import { LevelUpModal } from "@/components/gamification/LevelUpModal";
import { getStoredTokens } from "@/lib/auth";
import { playSound, type SoundKind } from "@/lib/sound";
import { useT } from "@/hooks/useT";
import { useAuthStore } from "@/stores/authStore";
import { useGamificationStore } from "@/stores/gamificationStore";

type LevelPayload = {
  to_level?: number;
  title?: string;
};

export function GamificationRealtimeBridge() {
  const { t } = useT();
  const tokens = useAuthStore((s) => s.tokens);
  const bootstrap = useGamificationStore((s) => s.bootstrap);
  const notifications = useGamificationStore((s) => s.notifications);
  const connectRealtime = useGamificationStore((s) => s.connectRealtime);
  const disconnectRealtime = useGamificationStore((s) => s.disconnectRealtime);
  const soundEnabled = useGamificationStore((s) => s.soundEnabled);

  const seenRef = useRef<Set<string>>(new Set());
  const [levelPayload, setLevelPayload] = useState<LevelPayload | null>(null);

  useEffect(() => {
    if (!(tokens?.access_token || getStoredTokens()?.access_token)) {
      disconnectRealtime();
      return;
    }
    bootstrap().catch(() => undefined);
    connectRealtime();
    return () => disconnectRealtime();
  }, [bootstrap, connectRealtime, disconnectRealtime, tokens?.access_token]);

  const unseen = useMemo(
    () => notifications.filter((item) => !seenRef.current.has(item.id)),
    [notifications],
  );

  useEffect(() => {
    unseen.forEach((item) => {
      seenRef.current.add(item.id);
      if (item.type === "achievement_unlocked") {
        toast.custom(() => (
          <AchievementToast
            title={String(item.payload?.name || t("gamification.achievementUnlocked"))}
            rarity={String(item.payload?.rarity || "common")}
          />
        ));
        if (soundEnabled) playSound(String(item.payload?.sound || "major") as SoundKind);
        return;
      }
      if (item.type === "xp_gained") {
        toast.success(`+${String(item.payload?.gained_xp || 0)} ${t("app.xp")}`);
        if (soundEnabled) playSound(String(item.payload?.sound || "minor") as SoundKind);
        return;
      }
      if (item.type === "level_up") {
        setLevelPayload({
          to_level: Number(item.payload?.to_level || 0),
          title: String(item.payload?.title || ""),
        });
        if (soundEnabled) playSound(String(item.payload?.sound || "level_up_minor") as SoundKind);
      }
    });
  }, [soundEnabled, unseen]);

  return (
    <LevelUpModal
      open={Boolean(levelPayload)}
      onOpenChange={(open) => {
        if (!open) setLevelPayload(null);
      }}
      level={levelPayload?.to_level || 0}
      title={levelPayload?.title || ""}
    />
  );
}
