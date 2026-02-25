"use client";

import { create } from "zustand";
import { api } from "@/lib/api";
import type { AssessmentQuestionOut, GapAnalysisResponse, ProfessionOut, SkillVector } from "@/types/api";

type SkillStore = {
  skillProfile: SkillVector | null;
  professions: ProfessionOut[];
  skillQuestions: AssessmentQuestionOut[];
  topMatches: GapAnalysisResponse[];
  loading: boolean;
  error: string | null;
  analyzeSkills: (answers: { question_id: string; answer: string }[]) => Promise<SkillVector>;
  fetchSkillQuestions: () => Promise<AssessmentQuestionOut[]>;
  fetchProfessions: () => Promise<ProfessionOut[]>;
  fetchTopMatches: () => Promise<GapAnalysisResponse[]>;
};

export const useSkillStore = create<SkillStore>((set, get) => ({
  skillProfile: null,
  professions: [],
  skillQuestions: [],
  topMatches: [],
  loading: false,
  error: null,
  analyzeSkills: async (answers) => {
    set({ loading: true, error: null });
    try {
      const result = await api.post<SkillVector>("/skills/analyze", { answers });
      set({ skillProfile: result });
      return result;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to analyze skills" });
      throw err;
    } finally {
      set({ loading: false });
    }
  },
  fetchSkillQuestions: async () => {
    set({ loading: true, error: null });
    try {
      const questions = await api.get<AssessmentQuestionOut[]>("/skills/questions");
      set({ skillQuestions: questions });
      return questions;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to fetch skill questions" });
      return [];
    } finally {
      set({ loading: false });
    }
  },
  fetchProfessions: async () => {
    const professions = await api.get<ProfessionOut[]>("/professions");
    set({ professions });
    return professions;
  },
  fetchTopMatches: async () => {
    set({ loading: true, error: null });
    try {
      const professions = get().professions.length ? get().professions : await get().fetchProfessions();
      const gaps = await Promise.all(
        professions.map((profession) =>
          api
            .get<GapAnalysisResponse>(`/professions/${profession.id}/gap`)
            .catch(() => null),
        ),
      );

      const topMatches = gaps
        .filter((v): v is GapAnalysisResponse => Boolean(v))
        .sort((a, b) => b.match_percentage - a.match_percentage)
        .slice(0, 3);

      set({ topMatches });
      return topMatches;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to fetch matches" });
      return [];
    } finally {
      set({ loading: false });
    }
  },
}));
