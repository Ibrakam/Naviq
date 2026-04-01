"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Bot, Sparkles } from "lucide-react";
import { useT } from "@/hooks/useT";
import { useGamificationStore } from "@/stores/gamificationStore";

export function GhostMentor() {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const profile = useGamificationStore((s) => s.profile);
  const dailyQuest = useGamificationStore((s) => s.dailyQuest);

  return (
    <div className="fixed bottom-5 right-5 z-40">
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        animate={{ y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
        className="obsidian-gradient-card relative flex h-16 w-16 items-center justify-center rounded-[1.35rem] text-[#05215a] shadow-[0_24px_60px_rgba(24,94,205,0.3)]"
      >
        <span className="absolute inset-0 rounded-[1.35rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent)]" />
        <Bot className="relative h-6 w-6" />
      </motion.button>

      {open ? (
        <div className="obsidian-glass obsidian-ghost-border mt-3 w-80 rounded-[1.5rem] p-4">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#eef1ff]">
            <Sparkles className="h-4 w-4 text-[#85adff]" />
            {t("gamification.ghostMentor")}
          </p>
          <div className="space-y-2 text-xs leading-5 text-[#aeb7de]">
            <p>{t("gamification.todayQuest")}: {dailyQuest?.title ?? "-"}</p>
            <p>
              {t("gamification.nextLevelXp")}:{" "}
              {profile?.next_level_xp ? Math.max(0, profile.next_level_xp - profile.xp) : t("gamification.max")}
            </p>
            <p>{t("gamification.currentRank")}: {profile?.rank_title ?? "-"}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
