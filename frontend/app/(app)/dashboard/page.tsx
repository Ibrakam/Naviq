"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Play,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useT } from "@/hooks/useT";
import { hasCompletedSkillProfile } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { useGamificationStore } from "@/stores/gamificationStore";
import { useSkillStore } from "@/stores/skillStore";

const meshLabelPositions = [
  "left-1/2 top-5 -translate-x-1/2",
  "right-10 top-1/2 -translate-y-1/2",
  "left-1/2 bottom-5 -translate-x-1/2",
  "left-10 top-1/2 -translate-y-1/2",
  "left-[20%] top-[24%]",
  "right-[20%] top-[24%] text-right",
];

function clampSkill(value: number | undefined) {
  return Math.max(0.12, Math.min(1, value ?? 0.52));
}

function average(...values: Array<number | undefined>) {
  const valid = values.filter((value): value is number => typeof value === "number");
  if (!valid.length) return 0.52;
  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
}

function polygonPoints(values: number[], radius: number) {
  return values
    .map((value, index) => {
      const angle = ((index * 60 - 90) * Math.PI) / 180;
      const scaledRadius = radius * clampSkill(value);
      const x = 50 + Math.cos(angle) * scaledRadius;
      const y = 50 + Math.sin(angle) * scaledRadius;
      return `${x},${y}`;
    })
    .join(" ");
}

function ringPoints(radius: number) {
  return Array.from({ length: 6 }, (_, index) => {
    const angle = ((index * 60 - 90) * Math.PI) / 180;
    const x = 50 + Math.cos(angle) * radius;
    const y = 50 + Math.sin(angle) * radius;
    return `${x},${y}`;
  }).join(" ");
}

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useT();

  const user = useAuthStore((s) => s.user);
  const fetchMe = useAuthStore((s) => s.fetchMe);

  const fetchTopMatches = useSkillStore((s) => s.fetchTopMatches);
  const professions = useSkillStore((s) => s.professions);
  const topMatches = useSkillStore((s) => s.topMatches);
  const skillProfile = useSkillStore((s) => s.skillProfile) ?? user?.skill_profile ?? null;

  const profile = useGamificationStore((s) => s.profile);
  const levels = useGamificationStore((s) => s.levels);
  const dailyQuest = useGamificationStore((s) => s.dailyQuest);

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

  const firstName = user?.full_name?.trim().split(/\s+/)[0] ?? "Alex";

  const recommendedCareers = useMemo(() => topMatches.slice(0, 3), [topMatches]);

  const professionMeta = useMemo(
    () => new Map(professions.map((profession) => [profession.id, profession])),
    [professions],
  );

  const focusRole = recommendedCareers[0]?.profession_title ?? "Staff Engineer";
  const strongestCareer = recommendedCareers[0];

  const currentLevel = levels.find((item) => item.level === profile?.level);
  const nextLevel = levels.find((item) => item.level === (profile?.level ?? 0) + 1);
  const milestoneProgress = useMemo(() => {
    if (!profile || !currentLevel || !nextLevel) return 68;
    const range = Math.max(1, nextLevel.xp_min - currentLevel.xp_min);
    return Math.max(0, Math.min(100, ((profile.xp - currentLevel.xp_min) / range) * 100));
  }, [currentLevel, nextLevel, profile]);

  const dailyQuestProgress = dailyQuest?.completed ? 100 : hasSkillProfile ? 67 : 34;
  const dailyQuestLabel = dailyQuest?.completed ? "1 / 1" : hasSkillProfile ? "2 / 3" : "1 / 3";

  const meshAxes = useMemo(
    () => [
      { label: "Leadership", value: skillProfile?.leadership ?? 0.58 },
      { label: "Product Thinking", value: average(skillProfile?.analytics, skillProfile?.communication) },
      { label: "System Architecture", value: average(skillProfile?.technical, skillProfile?.problem_solving) },
      { label: "Security", value: average(skillProfile?.critical_thinking, skillProfile?.adaptability) },
      { label: "Delivery", value: average(skillProfile?.time_management, skillProfile?.teamwork) },
      { label: "Creativity", value: skillProfile?.creativity ?? 0.52 },
    ],
    [skillProfile],
  );

  const strongestSkill = useMemo(() => {
    const entries = [
      ["Leadership", skillProfile?.leadership],
      ["Communication", skillProfile?.communication],
      ["Analytics", skillProfile?.analytics],
      ["Creativity", skillProfile?.creativity],
      ["Technical", skillProfile?.technical],
      ["Critical Thinking", skillProfile?.critical_thinking],
    ] as const;

    return entries.sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))[0];
  }, [skillProfile]);

  const biggestGap = useMemo(() => {
    if (!strongestCareer?.gaps) return null;
    return Object.entries(strongestCareer.gaps).sort((a, b) => b[1] - a[1])[0] ?? null;
  }, [strongestCareer]);

  const simulatedRank = profile ? `#${Math.max(1284, 9000 - profile.xp).toLocaleString()}` : "Rank pending";

  return (
    <div className="space-y-8 pb-8">
      <section className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#6c9fff]">Intelligence Overview</p>
          <h1 className="mt-2 text-[2.7rem] font-black leading-none tracking-[-0.06em] text-[#f2f4ff] md:text-[4rem]">
            <span className="italic">Welcome back, {firstName}.</span>
          </h1>
        </div>

        <div className="obsidian-glass flex w-full max-w-sm items-center justify-end rounded-[1.4rem] px-5 py-4">
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#7d86ad]">Global Rank</p>
            <p className="text-2xl font-black tracking-[-0.05em] text-[#9fc0ff]">{simulatedRank}</p>
          </div>
          <div className="mx-5 h-10 w-px bg-[#22316d]" />
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#7d86ad]">Current XP</p>
            <p className="text-2xl font-black tracking-[-0.05em] text-[#f2f4ff]">{(profile?.xp ?? user?.xp ?? 0).toLocaleString()}</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="obsidian-glass xl:col-span-8 rounded-[2rem] p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[2rem] font-extrabold tracking-[-0.05em] text-[#eef1ff]">Skill Competency Mesh</h2>
              <p className="mt-1 text-sm text-[#9ea8d5]">
                Visualizing your gaps for <span className="text-[#85adff]">{focusRole}</span>
              </p>
            </div>

            <button
              type="button"
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1a285f] text-[#a8b2db] transition-colors hover:text-[#eef1ff]"
            >
              <ArrowUpRight className="h-5 w-5" />
            </button>
          </div>

          <div className="relative mt-8 flex h-[430px] items-center justify-center overflow-hidden rounded-[1.75rem] bg-[radial-gradient(circle_at_center,rgba(133,173,255,0.08),transparent_55%),linear-gradient(180deg,rgba(9,18,61,0.96),rgba(9,18,61,0.6))]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(133,173,255,0.07),transparent_45%)]" />
            <div className="absolute h-64 w-64 rounded-full border border-[#22316d]/70" />
            <div className="absolute h-80 w-80 rounded-full border border-[#16245b]/55" />
            <div className="absolute h-96 w-96 rounded-full border border-[#101b48]/35" />

            {meshAxes.map((axis, index) => (
              <p
                key={axis.label}
                className={`absolute text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#7f89af] ${meshLabelPositions[index]}`}
              >
                {axis.label}
              </p>
            ))}

            <svg viewBox="0 0 100 100" className="relative z-10 h-72 w-72 overflow-visible drop-shadow-[0_0_22px_rgba(133,173,255,0.22)]">
              <polygon points={ringPoints(36)} fill="none" stroke="rgba(87,104,164,0.55)" strokeWidth="0.45" />
              <polygon points={ringPoints(28)} fill="none" stroke="rgba(87,104,164,0.28)" strokeWidth="0.45" />
              <polygon points={ringPoints(19)} fill="none" stroke="rgba(87,104,164,0.18)" strokeWidth="0.45" />
              <polygon
                points={polygonPoints(meshAxes.map((axis) => axis.value), 36)}
                fill="rgba(133,173,255,0.18)"
                stroke="#8db3ff"
                strokeWidth="1.1"
              />
              {meshAxes.map((axis, index) => {
                const angle = ((index * 60 - 90) * Math.PI) / 180;
                const radius = 36 * clampSkill(axis.value);
                const cx = 50 + Math.cos(angle) * radius;
                const cy = 50 + Math.sin(angle) * radius;
                return <circle key={axis.label} cx={cx} cy={cy} r="2.2" fill="#8db3ff" />;
              })}
            </svg>
          </div>
        </div>

        <div className="xl:col-span-4 flex flex-col gap-6">
          <div className="obsidian-gradient-card relative overflow-hidden rounded-[2rem] p-7 text-[#032359]">
            <div className="relative z-10 flex h-full min-h-[290px] flex-col">
              <span className="w-fit rounded-full bg-white/20 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.22em] text-white">
                Priority Task
              </span>

              <h2 className="mt-8 max-w-[10ch] text-[3.35rem] font-black leading-[0.92] tracking-[-0.08em] text-[#02265f]">
                Next Professional Simulation
              </h2>

              <p className="mt-5 max-w-sm text-lg leading-8 text-[#083575]/78">
                {dailyQuest?.prompt ?? "Handle a cross-functional architectural conflict in a high-growth environment."}
              </p>

              <div className="mt-auto flex items-end justify-between gap-4 pt-8">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#0d4e9f]/70">Estimated XP</p>
                  <p className="mt-2 text-[2.35rem] font-black tracking-[-0.06em]">+{(dailyQuest?.xp_reward ?? 2400).toLocaleString()}</p>
                </div>

                <button
                  type="button"
                  onClick={() => router.push("/simulations")}
                  className="flex h-16 w-16 items-center justify-center rounded-[1.3rem] bg-[#4b8ced]/30 text-[#02265f] backdrop-blur-sm transition-transform hover:scale-105"
                >
                  <Play className="ml-1 h-7 w-7 fill-current" />
                </button>
              </div>
            </div>

            <div className="absolute bottom-0 right-0 h-36 w-36 rounded-tl-[2rem] bg-white/8" />
            <div className="absolute bottom-6 right-8 h-24 w-24 rotate-45 rounded-3xl border border-white/12" />
          </div>

          <div className="obsidian-glass rounded-[2rem] p-7">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#9ea8d5]">Growth Progress</p>
              <p className="text-lg font-bold text-[#8db3ff]">Level {profile?.level ?? 24}</p>
            </div>

            <div className="mt-7 space-y-5">
              <div>
                <div className="mb-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.12em] text-[#7d86ad]">
                  <span>Weekly Milestone</span>
                  <span>{Math.round(milestoneProgress)}%</span>
                </div>
                <div className="h-2 rounded-full bg-[#1a285f]">
                  <div className="h-2 rounded-full bg-[linear-gradient(90deg,#8db3ff,#6c9fff)]" style={{ width: `${milestoneProgress}%` }} />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.12em] text-[#7d86ad]">
                  <span>Daily Quests</span>
                  <span>{dailyQuestLabel}</span>
                </div>
                <div className="h-2 rounded-full bg-[#1a285f]">
                  <div className="h-2 rounded-full bg-[linear-gradient(90deg,#7f98ff,#85adff)]" style={{ width: `${dailyQuestProgress}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="obsidian-glass xl:col-span-5 rounded-[2rem] p-7">
          <div className="flex items-center justify-between">
            <h2 className="text-[2rem] font-extrabold tracking-[-0.05em] text-[#eef1ff]">Recommended Careers</h2>
            <button
              type="button"
              onClick={() => router.push("/professions")}
              className="text-sm font-bold text-[#85adff] transition-colors hover:text-[#b6ceff]"
            >
              View All
            </button>
          </div>

          <div className="mt-7 space-y-4">
            {recommendedCareers.length ? (
              recommendedCareers.map((career, index) => {
                const profession = professionMeta.get(career.profession_id);
                const accent = [
                  "bg-[#18275b] text-[#8db3ff]",
                  "bg-[#172356] text-[#b6c7ff]",
                  "bg-[#231c55] text-[#d8a6ff]",
                ][index] ?? "bg-[#18275b] text-[#8db3ff]";

                return (
                  <button
                    type="button"
                    key={career.profession_id}
                    onClick={() => router.push(`/professions/${career.profession_id}`)}
                    className="flex w-full items-center justify-between rounded-[1.6rem] bg-[#101d4e]/72 px-5 py-5 text-left transition-transform hover:translate-y-[-1px] hover:bg-[#15255f]"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex h-14 w-14 items-center justify-center rounded-[1.1rem] ${accent}`}>
                        <BriefcaseBusiness className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-[1.45rem] font-bold tracking-[-0.04em] text-[#eef1ff]">{career.profession_title}</p>
                        <p className="text-sm text-[#92a0cf]">
                          {profession?.category ?? "High Demand"} • {index === 0 ? "Strategic Fit" : index === 1 ? "Growth Track" : "Leadership Lane"}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-[2.1rem] font-black tracking-[-0.06em] text-[#8db3ff]">{Math.round(career.match_percentage)}%</p>
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#6f7dad]">Match Score</p>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="rounded-[1.6rem] bg-[#101d4e]/72 px-5 py-8 text-[#92a0cf]">
                Complete the assessment to unlock tailored career matches.
              </div>
            )}
          </div>
        </div>

        <div className="obsidian-glass xl:col-span-7 overflow-hidden rounded-[2rem]">
          <div className="p-7">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-[2rem] font-extrabold tracking-[-0.05em] text-[#eef1ff]">Career Roadmap Insights</h2>
              <span className="rounded-xl bg-[#18275b] px-3 py-2 text-xs font-semibold text-[#a9b8ea]">Past 30d</span>
            </div>

            <div className="relative mt-6 h-[280px] overflow-hidden rounded-[1.7rem] bg-[linear-gradient(135deg,rgba(50,98,184,0.42),rgba(9,18,61,0.15)_42%,rgba(9,18,61,0.95))]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(133,173,255,0.18),transparent_35%)]" />
              <div className="absolute inset-x-[10%] top-0 h-full bg-[linear-gradient(90deg,transparent,rgba(8,15,48,0.55)_48%,transparent)]" />
              <div className="absolute left-[12%] top-[16%] h-px w-[76%] rotate-[18deg] bg-[#27417f]/70" />
              <div className="absolute left-[4%] top-[40%] h-px w-[92%] rotate-[-12deg] bg-[#20376f]/60" />
              <div className="absolute bottom-[22%] left-[18%] h-px w-[68%] rotate-[4deg] bg-[#2d4f95]/60" />

              <div className="absolute inset-x-5 bottom-5 grid gap-4 md:grid-cols-2">
                <div className="obsidian-glass rounded-[1.45rem] p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#95a3d6]">Top Skill Growth</p>
                  <p className="mt-2 text-[1.8rem] font-bold tracking-[-0.04em] text-[#eef1ff]">{strongestSkill?.[0] ?? "Cloud Migration"}</p>
                  <div className="mt-3 flex items-center gap-2 text-[#8db3ff]">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-lg font-semibold">
                      +{Math.round(((strongestSkill?.[1] ?? 0.62) as number) * 14 + 6).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="obsidian-glass rounded-[1.45rem] p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#95a3d6]">Hiring Demand</p>
                  <p className="mt-2 text-[1.8rem] font-bold tracking-[-0.04em] text-[#eef1ff]">
                    {recommendedCareers[1]?.profession_title ?? focusRole}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-[#8db3ff]">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-lg font-semibold">
                      +{Math.round((recommendedCareers[1]?.match_percentage ?? 78) / 3).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 bg-[#091440]/72 px-7 py-5 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-[#95a3d6]">
              {biggestGap ? `Largest gap to close next: ${biggestGap[0].replaceAll("_", " ")}.` : "Based on current trend data from your learning graph."}
            </p>
            <button
              type="button"
              onClick={() => router.push("/roadmap")}
              className="w-fit rounded-2xl bg-[#15255f] px-4 py-2.5 text-sm font-bold text-[#eef1ff] transition-colors hover:bg-[#1a2d70]"
            >
              Generate Report
            </button>
          </div>
        </div>
      </section>

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
              {hasSkillProfile ? "Review Profile" : t("app.start")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
