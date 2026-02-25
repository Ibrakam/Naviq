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
        className="relative rounded-full border border-cyan-300/40 bg-[#050b14]/85 p-3 shadow-[0_0_30px_rgba(0,242,255,0.25)]"
      >
        <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(0,242,255,0.4),transparent_65%)] opacity-60" />
        <Bot className="relative h-5 w-5 text-cyan-200" />
      </motion.button>

      {open ? (
        <div className="mt-2 w-72 rounded-2xl border border-white/15 bg-[#070b16]/95 p-3 backdrop-blur-xl">
          <p className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-100">
            <Sparkles className="h-4 w-4 text-cyan-300" />
            {t("gamification.ghostMentor")}
          </p>
          <div className="space-y-2 text-xs text-zinc-300">
            <p>{t("gamification.todayQuest")}: {dailyQuest?.title ?? "-"}</p>
            <p>
              {t("gamification.nextLevelXp")}: {profile?.next_level_xp ? Math.max(0, profile.next_level_xp - profile.xp) : t("gamification.max")}
            </p>
            <p>{t("gamification.currentRank")}: {profile?.rank_title ?? "-"}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
