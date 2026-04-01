"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  Database,
  Lightbulb,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useSkillStore } from "@/stores/skillStore";
import type { CourseOut, GapAnalysisResponse } from "@/types/api";

function formatSkillLabel(raw: string) {
  return raw
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function skillIcon(skill: string) {
  const normalized = skill.toLowerCase();
  if (normalized.includes("technical")) return "TE";
  if (normalized.includes("analytics")) return "AN";
  if (normalized.includes("creativity")) return "CR";
  if (normalized.includes("problem")) return "PS";
  if (normalized.includes("communication")) return "CM";
  if (normalized.includes("teamwork")) return "TW";
  return skill.slice(0, 2).toUpperCase();
}

function courseHours(course: CourseOut) {
  const density = Object.keys(course.skill_tags ?? {}).length;
  return Math.max(6, Math.round(course.difficulty * 4 + density * 1.4));
}

function professionAccent(title: string) {
  const normalized = title.toLowerCase();
  if (normalized.includes("frontend") || normalized.includes("ux")) return TrendingUp;
  if (normalized.includes("backend") || normalized.includes("devops")) return Database;
  if (normalized.includes("data") || normalized.includes("scientist")) return Sparkles;
  return BriefcaseBusiness;
}

export default function ProfessionsPage() {
  const professions = useSkillStore((s) => s.professions);
  const fetchProfessions = useSkillStore((s) => s.fetchProfessions);

  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [gap, setGap] = useState<GapAnalysisResponse | null>(null);
  const [recommendedCourses, setRecommendedCourses] = useState<CourseOut[]>([]);
  const [loadingGap, setLoadingGap] = useState(false);

  useEffect(() => {
    fetchProfessions()
      .then((list) => {
        if (list[0]) {
          setSelected((current) => current ?? list[0].id);
        }
      })
      .catch(() => undefined);
  }, [fetchProfessions]);

  useEffect(() => {
    if (!selected) return;

    let cancelled = false;
    setLoadingGap(true);

    Promise.all([
      api.get<GapAnalysisResponse>(`/professions/${selected}/gap`),
      api.get<CourseOut[]>(`/courses/recommend/${selected}`),
    ])
      .then(([gapResponse, courses]) => {
        if (cancelled) return;
        setGap(gapResponse);
        setRecommendedCourses(courses);
      })
      .catch(() => {
        if (cancelled) return;
        setGap(null);
        setRecommendedCourses([]);
      })
      .finally(() => {
        if (cancelled) return;
        setLoadingGap(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selected]);

  const filteredProfessions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return professions;
    return professions.filter((profession) => {
      const haystack = `${profession.title} ${profession.description ?? ""} ${profession.category ?? ""}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [professions, search]);

  const selectedProfession = useMemo(
    () => professions.find((profession) => profession.id === selected) ?? filteredProfessions[0] ?? professions[0] ?? null,
    [filteredProfessions, professions, selected],
  );

  const coreCompetencies = useMemo(() => {
    const source = selectedProfession?.reference_skills ?? {};
    return Object.entries(source)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([skill, value]) => ({
        key: skill,
        label: formatSkillLabel(skill),
        percent: Math.round(value * 100),
      }));
  }, [selectedProfession]);

  const criticalGaps = useMemo(() => {
    return Object.entries(gap?.gaps ?? {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([skill, value], index) => ({
        key: skill,
        label: formatSkillLabel(skill),
        intensity: value,
        tone: index < 2 ? "bg-[#ff8b84]" : "bg-[#d887ff]",
      }));
  }, [gap?.gaps]);

  const topCourse = recommendedCourses[0] ?? null;
  const overallMatch = Math.round((gap?.match_percentage ?? 0) * 100);
  const highlightedMessage = useMemo(() => {
    if (!selectedProfession) return "Select a profession to view benchmark requirements.";
    if (!criticalGaps.length) {
      return `You are aligned with the current benchmark for ${selectedProfession.title}.`;
    }
    return `Biggest growth opportunity: ${criticalGaps[0].label} for the ${selectedProfession.title} track.`;
  }, [criticalGaps, selectedProfession]);

  return (
    <div className="relative space-y-8 overflow-hidden pb-8">
      <div className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(93,132,241,0.1),transparent_66%)]" />
      <div className="pointer-events-none absolute bottom-12 left-20 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(255,224,193,0.14),transparent_66%)]" />

      <div className="grid gap-8 xl:grid-cols-[minmax(0,30rem)_minmax(0,1fr)]">
        <section className="space-y-6">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-[#5d84f1]">Selection Hub</p>
              <h1 className="mt-3 text-[3rem] font-black leading-none tracking-[-0.07em] text-[#20283b]">Career Paths</h1>
            </div>

            <div className="obsidian-input flex items-center gap-3 rounded-[1.4rem] px-4 py-3">
              <Search className="h-4 w-4 text-[#8792ab]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search professions or skills..."
                className="w-full bg-transparent text-sm text-[#24304a] outline-none placeholder:text-[#8a95ac]"
              />
            </div>
          </div>

          <div className="max-h-[calc(100vh-18rem)] space-y-3 overflow-y-auto pr-2">
            {filteredProfessions.map((profession) => {
              const active = profession.id === selectedProfession?.id;
              const AccentIcon = professionAccent(profession.title);
              const topSkills = Object.entries(profession.reference_skills)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3);

              return (
                <div
                  key={profession.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelected(profession.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelected(profession.id);
                    }
                  }}
                  className={cn(
                    "obsidian-glass rounded-[1.5rem] border p-5 transition-all duration-300",
                    active
                      ? "border-[#b7caf5] shadow-[0_16px_40px_rgba(93,132,241,0.12)]"
                      : "border-white/5 hover:border-[#d8dfeb] hover:bg-[#fffefd]",
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                        <h3 className="text-[1.75rem] font-bold leading-tight tracking-[-0.05em] text-[#20283b]">
                          {profession.title}
                        </h3>
                        <p className="mt-2 text-base leading-7 text-[#6d7891]">
                          {profession.description ?? profession.category ?? "Professional track"}
                        </p>
                    </div>

                    {active ? (
                      <span className="rounded-lg border border-[#bdd0f5] bg-[#edf3ff] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-[#4f74d6]">
                        Active
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-6 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        {topSkills.map(([skill]) => (
                          <div
                            key={skill}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d7deea] bg-[#f5f8ff] text-[10px] font-black text-[#284482]"
                          >
                            {skillIcon(skill)}
                          </div>
                        ))}
                        {Object.keys(profession.reference_skills).length > 3 ? (
                          <div className="flex h-8 min-w-8 items-center justify-center rounded-full border border-[#d7deea] bg-[#f5f8ff] px-2 text-[10px] font-black text-[#284482]">
                            +{Object.keys(profession.reference_skills).length - 3}
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <Link
                      href={`/professions/${profession.id}`}
                      onClick={(event) => event.stopPropagation()}
                      className={cn(
                        "inline-flex items-center justify-center rounded-[0.9rem] px-5 py-3 text-xs font-black uppercase tracking-[0.18em] transition-all",
                        active
                          ? "bg-[linear-gradient(135deg,#b7cef9,#8fb1f4)] text-[#17305e]"
                          : "border border-[#d7deea] text-[#20283b] hover:bg-[#f5f8ff]",
                      )}
                    >
                      Open
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-[#ba7ce6]">Analytical View</p>
              <h2 className="mt-3 text-[3rem] font-black leading-[0.96] tracking-[-0.07em] text-[#20283b]">
                Gap Analysis:{" "}
                <span className="text-[#4f74d6]">{selectedProfession?.title ?? "Select a profession"}</span>
              </h2>
            </div>

            <div className="shrink-0 text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8a92a9]">Overall Match</p>
              <p className="mt-1 text-[4rem] font-black leading-none tracking-[-0.07em] text-[#20283b]">
                {overallMatch}
                <span className="text-[#4f74d6]">%</span>
              </p>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <div className="obsidian-glass obsidian-ghost-border xl:col-span-2 rounded-[1.8rem] p-8">
              <div className="flex items-center justify-between gap-4">
                <h3 className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.2em] text-[#33405c]">
                  <TrendingUp className="h-5 w-5 text-[#4f74d6]" />
                  Core Competencies
                </h3>
                <p className="text-sm text-[#7a859c]">
                  Benchmark: {selectedProfession?.category ?? "Professional"} track benchmark
                </p>
              </div>

              <div className="mt-8 space-y-6">
                {coreCompetencies.map((competency) => (
                  <div key={competency.key} className="space-y-2.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-[#20283b]">{competency.label}</span>
                      <span className="font-black text-[#4f74d6]">{competency.percent}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[#e3e9f3]">
                      <div
                        className="h-full rounded-full bg-[linear-gradient(90deg,#6f93ef,#4f74d6)]"
                        style={{ width: `${competency.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="obsidian-glass obsidian-ghost-border rounded-[1.8rem] p-6">
              <h4 className="text-xs font-black uppercase tracking-[0.22em] text-[#8a92a9]">Critical Gaps</h4>
              <ul className="mt-6 space-y-4">
                {criticalGaps.length ? (
                  criticalGaps.map((item) => (
                    <li key={item.key} className="flex items-center gap-3">
                      <span className={`h-2.5 w-2.5 rounded-full ${item.tone} shadow-[0_0_12px_rgba(255,113,108,0.35)]`} />
                      <span className="text-[1.05rem] leading-7 text-[#20283b]">{item.label}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-[#6d7891]">
                    {loadingGap ? "Calculating skill deltas..." : "Gap data will appear once a profession is selected."}
                  </li>
                )}
              </ul>
            </div>

            <div className="obsidian-glass obsidian-ghost-border rounded-[1.8rem] p-6">
              <h4 className="text-xs font-black uppercase tracking-[0.22em] text-[#6177d0]">Next Priority</h4>

              {topCourse ? (
                <div className="mt-6 flex h-full min-h-[12rem] flex-col">
                  <div className="flex-1">
                    <p className="text-[2rem] font-black leading-[1.02] tracking-[-0.05em] text-[#20283b]">
                      {topCourse.title}
                    </p>
                    <p className="mt-3 text-base leading-7 text-[#6d7891]">
                      Estimated {courseHours(topCourse)} hours to close the highest-priority gap.
                    </p>
                  </div>

                  <Link
                    href={`/courses/${topCourse.id}`}
                    className="mt-6 inline-flex w-full items-center justify-center rounded-[1rem] bg-[linear-gradient(135deg,#b7cef9,#8fb1f4)] px-5 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-[#17305e] transition-colors hover:opacity-95"
                  >
                    Start Module
                  </Link>
                </div>
              ) : (
                <p className="mt-6 text-sm leading-7 text-[#6d7891]">
                  No course recommendations are available for this profession yet.
                </p>
              )}
            </div>
          </div>

          <div className="obsidian-glass obsidian-ghost-border flex flex-col gap-4 rounded-[1.5rem] p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-[#edf3ff] text-[#4f74d6]">
                <Lightbulb className="h-5 w-5" />
              </div>
              <p className="max-w-2xl text-[1.05rem] leading-7 text-[#20283b]">{highlightedMessage}</p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  const currentIndex = filteredProfessions.findIndex((profession) => profession.id === selectedProfession?.id);
                  const next = filteredProfessions[(currentIndex + 1) % Math.max(filteredProfessions.length, 1)];
                  if (next) setSelected(next.id);
                }}
                className="px-4 py-2 text-sm font-semibold text-[#6d7891] transition-colors hover:text-[#20283b]"
              >
                Compare Others
              </button>
              <Link
                href={selectedProfession ? `/professions/${selectedProfession.id}` : "/roadmap"}
                className="inline-flex items-center gap-2 rounded-[1rem] bg-[linear-gradient(135deg,#fffdf8,#f5f8ff)] px-5 py-3 text-sm font-black text-[#17305e] transition-colors hover:bg-[#eef3ff]"
              >
                View Full Roadmap
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
