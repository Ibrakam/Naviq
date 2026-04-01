"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Award,
  Fingerprint,
  Pencil,
  QrCode,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { clamp, SKILL_KEYS } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { useGamificationStore } from "@/stores/gamificationStore";
import type { AchievementOut, UserOut } from "@/types/api";

function initialsFromName(name: string | undefined | null) {
  return (name ?? "Naviq User")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function formatMonthYear(value: string | undefined) {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(date);
}

function formatSkillLabel(raw: string) {
  return raw
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function rankTone(rank: string | undefined) {
  const normalized = (rank ?? "").toLowerCase();
  if (normalized.includes("legend")) return "bg-[#3c2c07] text-[#ffd27a]";
  if (normalized.includes("gold")) return "bg-[#3d300f] text-[#ffcf76]";
  if (normalized.includes("silver")) return "bg-[#eef2f8] text-[#60708d]";
  if (normalized.includes("bronze")) return "bg-[#31261b] text-[#ddb38a]";
  return "bg-[#edf3ff] text-[#4f74d6]";
}

function achievementTone(rarity: AchievementOut["rarity"]) {
  switch (rarity) {
    case "legendary":
      return "bg-[#35280e] text-[#ffd27a]";
    case "epic":
      return "bg-[#311a4d] text-[#f0b7ff]";
    case "rare":
      return "bg-[#edf3ff] text-[#4f74d6]";
    case "uncommon":
      return "bg-[#eef4ff] text-[#5a77cc]";
    default:
      return "bg-[#f0f3fa] text-[#64728f]";
  }
}

function getAchievementIcon(index: number) {
  return [Award, Sparkles, Fingerprint, QrCode][index] ?? Award;
}

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const fetchMe = useAuthStore((s) => s.fetchMe);

  const profile = useGamificationStore((s) => s.profile);
  const levels = useGamificationStore((s) => s.levels);
  const achievements = useGamificationStore((s) => s.achievements);
  const careerCard = useGamificationStore((s) => s.careerCard);
  const soundEnabled = useGamificationStore((s) => s.soundEnabled);
  const fetchProfile = useGamificationStore((s) => s.fetchProfile);
  const fetchAchievements = useGamificationStore((s) => s.fetchAchievements);
  const fetchCareerCard = useGamificationStore((s) => s.fetchCareerCard);
  const fetchLevels = useGamificationStore((s) => s.fetchLevels);
  const setSoundEnabled = useGamificationStore((s) => s.setSoundEnabled);

  const [bootstrapping, setBootstrapping] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [fullNameDraft, setFullNameDraft] = useState("");
  const [timezoneDraft, setTimezoneDraft] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFullNameDraft(user?.full_name ?? "");
    setTimezoneDraft(user?.timezone ?? "UTC");
  }, [user]);

  useEffect(() => {
    Promise.all([
      fetchMe(),
      fetchProfile(),
      fetchAchievements(),
      fetchCareerCard(),
      fetchLevels(),
    ])
      .catch(() => undefined)
      .finally(() => setBootstrapping(false));
  }, [fetchAchievements, fetchCareerCard, fetchLevels, fetchMe, fetchProfile]);

  const xp = profile?.xp ?? user?.xp ?? 0;
  const currentLevel = levels.find((level) => level.level === profile?.level);
  const nextLevel = levels.find((level) => level.level === (profile?.level ?? 0) + 1);
  const levelCap = profile?.next_level_xp ?? nextLevel?.xp_min ?? currentLevel?.xp_max ?? xp;
  const xpProgress = levelCap > 0 ? clamp(Math.round((xp / levelCap) * 100)) : 0;
  const remainingXp = Math.max(0, (profile?.next_level_xp ?? nextLevel?.xp_min ?? xp) - xp);
  const nextRankLabel = nextLevel?.title ?? "Max tier";

  const skillSource = useMemo<Record<string, number>>(() => {
    const raw = (careerCard?.skill_profile as Record<string, number> | undefined) ?? user?.skill_profile ?? {};
    return Object.fromEntries(
      SKILL_KEYS.map((key) => [key, typeof raw[key] === "number" ? raw[key] : 0]),
    );
  }, [careerCard?.skill_profile, user?.skill_profile]);

  const topSkills = useMemo(() => {
    return Object.entries(skillSource)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3) as Array<[string, number]>;
  }, [skillSource]);

  const dominantSkill = topSkills[0]?.[1] ? formatSkillLabel(topSkills[0][0]) : "Profile signals still calibrating";
  const archetypeScore = Math.round(
    Object.values(skillSource).reduce((sum, value) => sum + value, 0) / Math.max(1, Object.values(skillSource).length) * 100,
  );
  const simulatedRank = `#${Math.max(214, 9000 - xp).toLocaleString()}`;
  const specialization = topSkills[0]?.[1] ? formatSkillLabel(topSkills[0][0]) : "Skill profile pending";
  const badgeLabels = (careerCard?.top_badges?.length ? careerCard.top_badges : achievements
    .filter((achievement) => achievement.unlocked)
    .slice(0, 2)
    .map((achievement) => achievement.name)).slice(0, 2);
  const displayAchievements = [...achievements]
    .sort((a, b) => Number(b.unlocked) - Number(a.unlocked) || b.progress - a.progress)
    .slice(0, 4);

  async function saveProfile() {
    const payload: Partial<UserOut> & { full_name?: string; timezone?: string } = {};
    const trimmedName = fullNameDraft.trim();
    const trimmedTimezone = timezoneDraft.trim();

    if (!trimmedName) {
      toast.error("Full name is required");
      return;
    }

    if (trimmedName !== user?.full_name) payload.full_name = trimmedName;
    if (trimmedTimezone && trimmedTimezone !== user?.timezone) payload.timezone = trimmedTimezone;

    if (!Object.keys(payload).length) {
      setEditOpen(false);
      return;
    }

    setSaving(true);
    try {
      await api.patch<UserOut>("/users/me", payload);
      await Promise.all([fetchMe(), fetchProfile()]);
      toast.success("Profile updated");
      setEditOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  if (bootstrapping && !user) {
    return (
        <div className="obsidian-glass rounded-[2rem] px-6 py-12 text-sm text-[#6d7891]">
          Loading profile intelligence...
        </div>
    );
  }

  return (
    <>
      <div className="space-y-8 pb-8">
        <section className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_21rem] xl:items-end">
          <div className="flex flex-col gap-6 md:flex-row md:items-end">
            <div className="relative">
              <div className="absolute inset-[-10px] rounded-[2.3rem] bg-[radial-gradient(circle,rgba(133,173,255,0.26),transparent_70%)] blur-xl" />
              <div className="relative flex h-32 w-32 items-center justify-center rounded-[2rem] bg-[linear-gradient(135deg,#ffcf9d,#f3b67c_52%,#9ec7d6)] text-[2.9rem] font-black tracking-[-0.08em] text-[#20304a] shadow-[0_18px_50px_rgba(91,99,122,0.12)]">
                {initialsFromName(user?.full_name)}
              </div>
              <div className="absolute bottom-[-6px] right-[-6px] flex h-12 w-12 items-center justify-center rounded-full border-[5px] border-[#f6f2ea] bg-[linear-gradient(135deg,#b7cef9,#8fb1f4)] text-lg font-black text-[#17305e]">
                {profile?.level ?? careerCard?.level ?? 1}
              </div>
            </div>

            <div className="space-y-2 pb-1">
              <h1 className="text-[3rem] font-black leading-none tracking-[-0.07em] text-[#20283b] md:text-[4rem]">
                {user?.full_name ?? "Naviq User"}
              </h1>
              <p className="text-[1.05rem] text-[#4f74d6] md:text-[1.15rem]">
                {profile?.rank_title ?? careerCard?.title ?? "Career identity calibrating"}
                {" • "}
                {profile?.university?.name ?? user?.timezone ?? "Global track"}
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${rankTone(careerCard?.rank)}`}>
                  {careerCard?.rank ?? "Student"}
                </span>
                {badgeLabels.length ? (
                  badgeLabels.map((badge) => (
                    <span
                      key={badge}
                      className="rounded-full bg-[#edf3ff] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#4f74d6]"
                    >
                      {badge}
                    </span>
                  ))
                ) : (
                  <span className="rounded-full bg-[#edf3ff] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#4f74d6]">
                    Intelligence profile active
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="obsidian-glass obsidian-ghost-border rounded-[1.7rem] p-6">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-black uppercase tracking-[0.24em] text-[#8a92a9]">Progression Intel</span>
              <span className="text-sm font-black text-[#4f74d6]">
                {xp.toLocaleString()} / {levelCap.toLocaleString()} XP
              </span>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#e3e9f3]">
              <div
                className="h-full bg-[linear-gradient(90deg,#84a2f5,#5d84f1)]"
                style={{ width: `${Math.max(xpProgress, 6)}%` }}
              />
            </div>

            <p className="mt-4 text-sm italic leading-7 text-[#6d7891]">
              Next Rank: <span className="font-semibold text-[#20283b]">{nextRankLabel}</span>
              {nextLevel ? ` — ${remainingXp.toLocaleString()} XP remaining` : " — max tier reached"}
            </p>
          </div>
        </section>

        <section className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_28rem]">
          <div className="space-y-6">
            <div className="obsidian-glass obsidian-ghost-border rounded-[1.8rem] p-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-[2rem] font-extrabold tracking-[-0.05em] text-[#20283b]">Core Dossier</h2>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setEditOpen(true)}
                    className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#4f74d6] transition-opacity hover:opacity-80"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => setSoundEnabled(!soundEnabled).catch(() => toast.error("Failed to update sound setting"))}
                    className="inline-flex items-center gap-2 rounded-full bg-[#edf3ff] px-3 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-[#284482]"
                  >
                    {soundEnabled ? <Volume2 className="h-3.5 w-3.5 text-[#4f74d6]" /> : <VolumeX className="h-3.5 w-3.5 text-[#4f74d6]" />}
                    Sound {soundEnabled ? "On" : "Off"}
                  </button>
                </div>
              </div>

              <div className="mt-8 grid gap-x-12 gap-y-8 md:grid-cols-2">
                {[
                  { label: "Full Name", value: user?.full_name ?? "-" },
                  { label: "Email Address", value: user?.email ?? "-" },
                  { label: "University", value: profile?.university?.name ?? "Not connected yet" },
                  { label: "Timezone", value: user?.timezone ?? "UTC" },
                  { label: "Specialization", value: specialization },
                  { label: "Member Since", value: formatMonthYear(user?.created_at) },
                ].map((item) => (
                  <div key={item.label} className="space-y-1.5">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8a92a9]">{item.label}</p>
                    <p className="text-[1.05rem] font-semibold tracking-[-0.02em] text-[#20283b]">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="obsidian-glass obsidian-ghost-border rounded-[1.8rem] p-8">
              <h3 className="text-[1.9rem] font-extrabold tracking-[-0.05em] text-[#20283b]">Recent Achievements</h3>

              <div className="mt-8 flex gap-4 overflow-x-auto pb-2">
                {displayAchievements.length ? (
                  displayAchievements.map((achievement, index) => {
                    const Icon = getAchievementIcon(index);
                    return (
                      <div
                        key={achievement.key}
                        className="obsidian-glass obsidian-ghost-border flex min-h-36 min-w-36 shrink-0 flex-col items-center justify-center rounded-[1.4rem] p-4 text-center"
                        style={{ opacity: achievement.unlocked ? 1 : 0.64 }}
                      >
                        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${achievementTone(achievement.rarity)}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <p className="mt-4 text-sm font-bold leading-5 text-[#20283b]">{achievement.name}</p>
                        <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-[#8a92a9]">
                          {achievement.unlocked ? "Unlocked" : `${Math.round(achievement.progress * 100)}% progress`}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-[1.4rem] bg-[#f5f8ff] px-5 py-4 text-sm text-[#6d7891]">
                    Achievements will appear here once the first milestones unlock.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-[-1px] rounded-[2rem] bg-[linear-gradient(135deg,rgba(183,206,249,0.8),rgba(255,255,255,0.24),rgba(183,206,249,0.46))] blur-[6px] opacity-80" />
            <div className="relative overflow-hidden rounded-[2rem] border border-[#d7deea] bg-[linear-gradient(180deg,#fffdf8,#f8f4ec_46%,#f3eee5)] p-8 shadow-[0_28px_80px_rgba(91,99,122,0.12)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.32em] text-[#4f74d6]">Career Identity Passport</p>
                  <h2 className="mt-4 text-[3rem] font-black italic leading-none tracking-[-0.08em] text-[#20283b]">
                    {(careerCard?.title ?? profile?.rank_title ?? "The Explorer").toUpperCase()}
                  </h2>
                </div>
                <div className="flex h-20 w-20 items-center justify-center rounded-[1.2rem] border border-[#d7deea] bg-[#eef3ff] text-[#4f74d6]">
                  <Fingerprint className="h-9 w-9" />
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="rounded-[1.2rem] border border-[#dbe1eb] bg-white/58 p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8a92a9]">Archetype Score</p>
                  <p className="mt-4 text-[3rem] font-black leading-none tracking-[-0.06em] text-[#20283b]">
                    {archetypeScore}
                    <span className="ml-1 text-lg font-medium text-[#6d7891]">/100</span>
                  </p>
                </div>
                <div className="rounded-[1.2rem] border border-[#dbe1eb] bg-white/58 p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8a92a9]">Global Rank</p>
                  <p className="mt-4 text-[3rem] font-black leading-none tracking-[-0.06em] text-[#20283b]">{simulatedRank}</p>
                </div>
              </div>

              <div className="mt-10 space-y-5">
                <div className="flex items-end justify-between gap-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8a92a9]">Cognitive Blueprint</p>
                  <p className="text-[11px] font-semibold italic text-[#4f74d6]">Dominant: {dominantSkill}</p>
                </div>

                <div className="space-y-4">
                  {(topSkills.length ? topSkills : [["technical", 0], ["analytics", 0], ["leadership", 0]] as Array<[string, number]>).map(([skill, value]) => (
                    <div key={skill} className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.08em] text-[#8a92a9]">
                        <span>{formatSkillLabel(skill)}</span>
                        <span>{Math.round(value * 100)}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-[#e3e9f3]">
                        <div
                          className="h-full bg-[linear-gradient(90deg,#84a2f5,#5d84f1)]"
                          style={{ width: `${Math.max(Math.round(value * 100), 4)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-16 flex items-center justify-between border-t border-[#dfe5ee] pt-6">
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#8a92a9]">ID Hash</p>
                  <p className="font-mono text-xs text-[#4f74d6]">{user?.id?.slice(0, 12).toUpperCase() ?? "N/A"}</p>
                </div>
                <QrCode className="h-10 w-10 text-[#c1c8d6]" />
              </div>
            </div>
          </div>
        </section>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="border-[#d7deea] bg-[#fffdf8] text-[#20283b]">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-[0.18em] text-[#8a92a9]">Full Name</label>
              <Input
                value={fullNameDraft}
                onChange={(event) => setFullNameDraft(event.target.value)}
                className="border-[#d7deea] bg-white text-[#20283b]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-[0.18em] text-[#8a92a9]">Timezone</label>
              <Input
                value={timezoneDraft}
                onChange={(event) => setTimezoneDraft(event.target.value)}
                className="border-[#d7deea] bg-white text-[#20283b]"
                placeholder="UTC"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditOpen(false)} className="text-[#5d74ab] hover:bg-[#edf3ff] hover:text-[#20283b]">
              Cancel
            </Button>
            <Button
              onClick={saveProfile}
              disabled={saving}
              className="bg-[linear-gradient(135deg,#b7cef9,#8fb1f4)] text-[#17305e] hover:opacity-95"
            >
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
