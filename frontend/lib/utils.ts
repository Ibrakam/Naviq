import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

export function normalizeRole(role: string | undefined | null) {
  if (!role) return "student" as const;
  return role.toLowerCase() === "admin" ? ("admin" as const) : ("student" as const);
}

export function percentageFromSkill(value: number | undefined) {
  return Math.round((value ?? 0) * 100);
}

export const SKILL_KEYS = [
  "communication",
  "leadership",
  "analytics",
  "creativity",
  "technical",
  "teamwork",
  "problem_solving",
  "time_management",
  "adaptability",
  "critical_thinking",
] as const;

export type SkillKey = (typeof SKILL_KEYS)[number];

export function hasCompletedSkillProfile(profile: unknown): boolean {
  if (!profile || typeof profile !== "object") return false;
  const record = profile as Record<string, unknown>;
  return SKILL_KEYS.every((key) => typeof record[key] === "number");
}
