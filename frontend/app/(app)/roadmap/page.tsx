"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  BrainCircuit,
  Check,
  ChevronRight,
  Code2,
  Palette,
  Sparkles,
  Users,
  WandSparkles,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import type { ProfessionOut } from "@/types/api";

type MilestoneState = "completed" | "current" | "locked";

type Milestone = {
  key: string;
  title: string;
  description: string;
  progress: number;
  state: MilestoneState;
  icon: typeof Code2;
  accent: string;
  positionClass: string;
  labelClass: string;
};

const defaultMilestones = [
  { key: "technical_mastery", title: "Technical Mastery", description: "Core engineering fundamentals are aligned." },
  { key: "visual_systems", title: "Visual Systems", description: "Shape product quality through design language." },
  { key: "problem_solving", title: "Problem Solving", description: "Unlock decision quality for higher-complexity work." },
  { key: "collaboration", title: "Collaboration", description: "Lead cross-functional delivery with clarity." },
] as const;

const milestonePositions = [
  {
    positionClass: "left-[1%] bottom-[4%]",
    labelClass: "items-start text-left",
  },
  {
    positionClass: "left-[34%] top-[9%]",
    labelClass: "items-center text-center",
  },
  {
    positionClass: "left-[71%] bottom-[9%]",
    labelClass: "items-center text-center",
  },
  {
    positionClass: "right-[1%] top-[18%]",
    labelClass: "items-end text-right",
  },
] as const;

function formatSkillLabel(raw: string) {
  return raw
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, value));
}

function getMilestoneIcon(index: number) {
  return [Code2, Palette, BrainCircuit, Users][index] ?? Sparkles;
}

function getMilestoneAccent(index: number) {
  return ["#8db3ff", "#9bbdff", "#7f98ff", "#b99cff"][index] ?? "#8db3ff";
}

function getTrackLabel(progress: number) {
  if (progress >= 82) return "Level 6: Lead";
  if (progress >= 68) return "Level 5: Architect";
  if (progress >= 54) return "Level 4: Specialist";
  if (progress >= 36) return "Level 3: Builder";
  return "Level 2: Explorer";
}

function getMentorCopy(category?: string) {
  const normalized = category?.toLowerCase() ?? "";

  if (normalized.includes("design")) {
    return {
      name: "Sarah Drasner",
      role: "Specialist in Creative Engineering",
      insight: "Review your system language before the next milestone unlock.",
    };
  }

  if (normalized.includes("data")) {
    return {
      name: "Cassie Kozyrkov",
      role: "Specialist in Decision Intelligence",
      insight: "Focus on signal quality before scaling complexity.",
    };
  }

  if (normalized.includes("product")) {
    return {
      name: "Marty Cagan",
      role: "Specialist in Product Strategy",
      insight: "Tie each sprint task to a measurable user outcome.",
    };
  }

  return {
    name: "Sarah Drasner",
    role: "Specialist in Creative Engineering",
    insight: "Push one visible systems skill to production this sprint.",
  };
}

export default function RoadmapPage() {
  const user = useAuthStore((s) => s.user);
  const [professions, setProfessions] = useState<ProfessionOut[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    api.get<ProfessionOut[]>("/professions")
      .then((list) => {
        if (cancelled) return;
        setProfessions(list);
        if (list[0]) {
          setSelected((current) => current || list[0].id);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setProfessions([]);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedProfession = useMemo(
    () => professions.find((profession) => profession.id === selected) ?? professions[0] ?? null,
    [professions, selected],
  );

  const milestones = useMemo<Milestone[]>(() => {
    const source = Object.entries(selectedProfession?.reference_skills ?? {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);

    const normalized = (source.length ? source : defaultMilestones.map((item) => [item.key, 0.58] as const))
      .slice(0, 4)
      .map(([skill, weight], index) => {
        const fallback = defaultMilestones[index];
        const progress = clamp(Math.round((weight ?? 0.58) * 100));
        const title = index < source.length ? formatSkillLabel(skill) : fallback.title;
        const description = index < source.length
          ? `${title} is the next capability layer for ${selectedProfession?.title ?? "your target track"}.`
          : fallback.description;

        return {
          key: skill,
          title,
          description,
          progress,
          state: (index === 0 ? "completed" : index === 1 ? "current" : "locked") as MilestoneState,
          icon: getMilestoneIcon(index),
          accent: getMilestoneAccent(index),
          positionClass: milestonePositions[index]?.positionClass ?? milestonePositions[0].positionClass,
          labelClass: milestonePositions[index]?.labelClass ?? milestonePositions[0].labelClass,
        };
      });

    return normalized;
  }, [selectedProfession]);

  const overallProgress = useMemo(() => {
    if (!milestones.length) return 0;
    const average = milestones.reduce((sum, milestone) => sum + milestone.progress, 0) / milestones.length;
    return clamp(Math.round(average * 0.82));
  }, [milestones]);

  const pivotTrack = getTrackLabel(overallProgress);
  const mentor = getMentorCopy(selectedProfession?.category);
  const upcomingSprint = milestones.filter((milestone) => milestone.state !== "completed").slice(0, 2);
  const firstName = user?.full_name?.trim().split(/\s+/)[0] ?? "You";

  return (
    <div className="space-y-8 pb-8">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.32em] text-[#5d84f1]">Architecture Selection</p>
          <h1 className="mt-3 text-[2.9rem] font-black leading-none tracking-[-0.07em] text-[#1f2739] md:text-[4.4rem]">
            Your Evolution.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#6d7891] md:text-lg">
            Map the skill sequence between your current momentum and the next role you want to own.
            The roadmap below adapts to the profession you choose.
          </p>
        </div>

        <div className="obsidian-glass obsidian-ghost-border rounded-[1.8rem] p-3.5">
          <p className="px-3 pb-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#8a92a9]">Current Pivot</p>
          <Select value={selectedProfession?.id ?? selected} onValueChange={setSelected}>
            <SelectTrigger className="h-auto border-0 bg-transparent px-3 py-2 shadow-none ring-0 outline-none focus:ring-0">
              <div className="flex min-w-0 items-center gap-4 text-left">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.2rem] bg-[linear-gradient(135deg,#bdd2fb,#8fb1f4)] shadow-[0_18px_40px_rgba(93,132,241,0.16)]">
                  <Code2 className="h-6 w-6 text-[#17305e]" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-lg font-extrabold tracking-[-0.04em] text-[#20283b]">
                    <SelectValue placeholder={loading ? "Loading roles..." : "Select a roadmap"} />
                  </div>
                  <p className="truncate text-sm text-[#6d7891]">{pivotTrack}</p>
                </div>
              </div>
            </SelectTrigger>
            <SelectContent className="border-[#d5dce8] bg-[#fffdf8] text-[#20283b]">
              {professions.map((profession) => (
                <SelectItem key={profession.id} value={profession.id}>
                  {profession.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      <section className="obsidian-glass obsidian-ghost-border relative overflow-hidden rounded-[2rem] p-5 md:p-8">
        <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(133,173,255,0.16),transparent_68%)]" />
        <div className="pointer-events-none absolute bottom-[-8rem] left-[-4rem] h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(127,152,255,0.12),transparent_68%)]" />

        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#5d84f1]">Roadmap Intelligence</p>
            <h2 className="mt-2 text-[2rem] font-extrabold tracking-[-0.05em] text-[#20283b]">
              {selectedProfession?.title ?? "Target roadmap"}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6d7891]">
              {selectedProfession?.description ?? "Track the milestones that convert raw skills into role readiness."}
            </p>
          </div>

          <div className="rounded-full border border-[#d7deea] bg-[#fffdf8]/88 px-4 py-2 text-sm font-semibold text-[#6d7891]">
            {firstName}&apos;s path
          </div>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="relative h-[34rem] min-w-[960px] rounded-[1.7rem] bg-[linear-gradient(180deg,#fcfaf4,#f6f2ea)] px-6 py-8">
            <svg
              viewBox="0 0 1000 500"
              className="pointer-events-none absolute inset-0 h-full w-full"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="road-complete" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#7a9bf1" />
                  <stop offset="100%" stopColor="#4f74d6" />
                </linearGradient>
                <linearGradient id="road-future" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#d1c6ef" />
                  <stop offset="100%" stopColor="#c0b1e6" />
                </linearGradient>
              </defs>
              <path
                d="M60 400C180 400 230 105 370 105C430 105 465 160 500 230"
                stroke="url(#road-complete)"
                strokeLinecap="round"
                strokeWidth="5"
                fill="none"
              />
              <path
                d="M500 230C590 360 620 430 730 430C845 430 885 175 960 145"
                stroke="url(#road-future)"
                strokeLinecap="round"
                strokeWidth="5"
                strokeDasharray="10 14"
                opacity="0.42"
                fill="none"
              />
            </svg>

            {milestones.map((milestone, index) => {
              const Icon = milestone.icon;
              const isCurrent = milestone.state === "current";
              const isCompleted = milestone.state === "completed";

              return (
                <div
                  key={milestone.key}
                  className={cn("absolute flex", milestone.positionClass, milestone.labelClass)}
                >
                  {isCurrent ? (
                    <div className="flex flex-col items-center">
                      <div className="relative flex h-24 w-24 items-center justify-center rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,#7ea9ff,#94b9ff)] shadow-[0_0_40px_rgba(133,173,255,0.4)]">
                        <div className="absolute inset-[-18px] rounded-[2rem] bg-[radial-gradient(circle,rgba(133,173,255,0.28),transparent_70%)]" />
                        <Icon className="relative h-9 w-9 text-[#07295f]" />
                      </div>

                        <div className="mt-5 w-[16rem] rounded-[1.2rem] border border-[#d9e1ec] bg-[#fffdf8]/96 p-5 shadow-[0_22px_60px_rgba(91,99,122,0.1)]">
                        <p className="text-xl font-bold tracking-[-0.04em] text-[#20283b]">{milestone.title}</p>
                        <p className="mt-2 text-sm leading-6 text-[#6d7891]">{milestone.description}</p>
                        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#e3e8f1]">
                          <div
                            className="h-full rounded-full bg-[linear-gradient(90deg,#84a2f5,#5d84f1)]"
                            style={{ width: `${Math.max(18, milestone.progress)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className={cn("flex flex-col gap-4", milestone.labelClass)}>
                      <div
                        className={cn(
                          "flex h-16 w-16 items-center justify-center rounded-[1.25rem] border transition-all duration-300",
                          isCompleted
                            ? "border-[#94b0ee] bg-[#f1f5ff] shadow-[0_0_26px_rgba(93,132,241,0.14)]"
                            : "border-[#e0e6ef] bg-[#f7f3ec] opacity-70",
                        )}
                      >
                        {isCompleted ? (
                          <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-[#e8f0ff]">
                            <Icon className="h-6 w-6 text-[#4f74d6]" />
                          </div>
                        ) : (
                          <Icon className="h-6 w-6 text-[#9aa2b6]" />
                        )}
                      </div>

                      <div className={cn("flex flex-col", milestone.labelClass)}>
                        <p className="text-[0.95rem] font-black uppercase tracking-[0.02em] text-[#20283b]">
                          {milestone.title}
                        </p>
                        <p className={cn("mt-1 text-xs font-bold uppercase tracking-[0.12em]", isCompleted ? "text-[#4f74d6]" : "text-[#8a92a9]")}>
                          {isCompleted ? "Completed" : `Level 0${index + 4} Unlock`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="obsidian-glass obsidian-ghost-border rounded-[1.8rem] p-7">
          <p className="text-xs font-black uppercase tracking-[0.26em] text-[#4f74d6]">Phase Progress</p>
          <div className="mt-6 flex items-end gap-3">
            <span className="text-[3.6rem] font-black leading-none tracking-[-0.08em] text-[#20283b]">
              {overallProgress}%
            </span>
            <span className="pb-2 text-base text-[#6d7891]">Total Completion</span>
          </div>

          <div className="mt-8 flex items-center gap-3">
            <div className="flex -space-x-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-[#c3d0ea] bg-[#edf3ff] text-[#4f74d6]"
                >
                  <Check className="h-3.5 w-3.5" />
                </div>
              ))}
              <div className="flex h-8 min-w-8 items-center justify-center rounded-full border border-[#d7deea] bg-[#fffdf8] px-2 text-[11px] font-bold text-[#4f74d6]">
                +{Math.max(1, milestones.length)}
              </div>
            </div>
            <span className="text-sm text-[#6d7891]">Milestones reached</span>
          </div>
        </div>

        <div className="obsidian-glass obsidian-ghost-border relative overflow-hidden rounded-[1.8rem] p-7">
          <div className="absolute right-[-4rem] top-[-4rem] h-36 w-36 rounded-full bg-[radial-gradient(circle,rgba(93,132,241,0.12),transparent_68%)]" />
          <p className="relative text-xs font-black uppercase tracking-[0.26em] text-[#6177d0]">Upcoming Sprint</p>

          <div className="relative mt-6 space-y-4">
            {upcomingSprint.map((milestone) => {
              const Icon = milestone.icon;
              return (
                <div
                  key={milestone.key}
                  className="flex items-center justify-between rounded-[1.2rem] border border-transparent bg-[#fffdf8]/84 px-4 py-4 transition-colors hover:border-[#d7deea]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-[0.95rem] bg-[#edf3ff] text-[#4f74d6]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold tracking-[-0.03em] text-[#20283b]">{milestone.title}</p>
                      <p className="text-sm text-[#6d7891]">Next capability unlock</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-[#9aa2b6]" />
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-[1.8rem] border border-[#d7deea] bg-[linear-gradient(180deg,#fffdf8,#f6f1e8)] p-7 shadow-[0_24px_60px_rgba(91,99,122,0.1)]">
          <p className="text-xs font-black uppercase tracking-[0.26em] text-[#8a92a9]">Elite Mentor</p>

          <div className="mt-6 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-[2rem] font-black tracking-[-0.05em] text-[#20283b]">{mentor.name}</h3>
              <p className="mt-1 text-sm font-medium text-[#4f74d6]">{mentor.role}</p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-[1.1rem] bg-[linear-gradient(135deg,#edf3ff,#dbe8ff)] text-[#4f74d6]">
              <WandSparkles className="h-6 w-6" />
            </div>
          </div>

          <p className="mt-5 text-sm leading-7 text-[#6d7891]">{mentor.insight}</p>

          <button
            type="button"
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-[1rem] bg-[#edf3ff] px-4 py-3.5 text-sm font-black uppercase tracking-[0.18em] text-[#284482] transition-colors hover:bg-[#e1ebff]"
          >
            <BarChart3 className="h-4 w-4" />
            Schedule Review
          </button>
        </div>
      </section>
    </div>
  );
}
