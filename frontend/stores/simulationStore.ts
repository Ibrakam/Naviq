"use client";

import { create } from "zustand";
import { api } from "@/lib/api";
import type { SimulationOut, SimulationStepResponse } from "@/types/api";

type SimulationStore = {
  simulations: SimulationOut[];
  active: SimulationStepResponse | null;
  loading: boolean;
  error: string | null;
  fetchSimulations: () => Promise<SimulationOut[]>;
  startSimulation: (id: string) => Promise<SimulationStepResponse>;
  answerStep: (id: string, answer: string) => Promise<SimulationStepResponse>;
  reset: () => void;
};

export const useSimulationStore = create<SimulationStore>((set) => ({
  simulations: [],
  active: null,
  loading: false,
  error: null,
  fetchSimulations: async () => {
    const simulations = await api.get<SimulationOut[]>("/simulations");
    set({ simulations });
    return simulations;
  },
  startSimulation: async (id) => {
    set({ loading: true, error: null });
    try {
      const result = await api.post<SimulationStepResponse>(`/simulations/${id}/start`);
      set({ active: result });
      return result;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to start simulation" });
      throw err;
    } finally {
      set({ loading: false });
    }
  },
  answerStep: async (id, answer) => {
    set({ loading: true, error: null });
    try {
      const result = await api.post<SimulationStepResponse>(`/simulations/${id}/step`, { answer });
      set({ active: result });
      return result;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to submit answer" });
      throw err;
    } finally {
      set({ loading: false });
    }
  },
  reset: () => set({ active: null, error: null }),
}));
