"use client";

import { create } from "zustand";
import { api } from "@/lib/api";
import { getStoredTokens } from "@/lib/auth";
import type {
  AchievementOut,
  CareerIdentityCardOut,
  DailyQuestCompleteOut,
  DailyQuestOut,
  GamificationLevelOut,
  GamificationNotificationOut,
  GamificationProfileOut,
  UniversityLeaderboardEntryOut,
} from "@/types/api";

type GamificationStore = {
  profile: GamificationProfileOut | null;
  levels: GamificationLevelOut[];
  achievements: AchievementOut[];
  dailyQuest: DailyQuestOut | null;
  leaderboard: UniversityLeaderboardEntryOut[];
  notifications: GamificationNotificationOut[];
  careerCard: CareerIdentityCardOut | null;
  soundEnabled: boolean;
  wsConnected: boolean;
  loading: boolean;
  error: string | null;
  pollSince: string | null;
  ws: WebSocket | null;
  pollIntervalId: number | null;
  bootstrap: () => Promise<void>;
  fetchProfile: () => Promise<GamificationProfileOut | null>;
  fetchLevels: () => Promise<GamificationLevelOut[]>;
  fetchAchievements: () => Promise<AchievementOut[]>;
  fetchDailyQuest: () => Promise<DailyQuestOut | null>;
  completeDailyQuest: () => Promise<DailyQuestCompleteOut>;
  fetchLeaderboard: () => Promise<UniversityLeaderboardEntryOut[]>;
  fetchCareerCard: () => Promise<CareerIdentityCardOut | null>;
  fetchNotifications: (since?: string | null) => Promise<GamificationNotificationOut[]>;
  connectRealtime: () => void;
  disconnectRealtime: () => void;
  setSoundEnabled: (enabled: boolean) => Promise<void>;
  clearError: () => void;
};

function getWsUrl() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
  const wsBase = apiUrl.replace(/^http:/, "ws:").replace(/^https:/, "wss:");
  return `${wsBase}/ws/gamification`;
}

function pushNotification(
  current: GamificationNotificationOut[],
  next: GamificationNotificationOut,
): GamificationNotificationOut[] {
  const exists = current.some((item) => item.id === next.id);
  if (exists) return current;
  return [...current, next].slice(-120);
}

export const useGamificationStore = create<GamificationStore>((set, get) => ({
  profile: null,
  levels: [],
  achievements: [],
  dailyQuest: null,
  leaderboard: [],
  notifications: [],
  careerCard: null,
  soundEnabled: true,
  wsConnected: false,
  loading: false,
  error: null,
  pollSince: null,
  ws: null,
  pollIntervalId: null,

  clearError: () => set({ error: null }),

  bootstrap: async () => {
    set({ loading: true, error: null });
    try {
      await Promise.all([
        get().fetchLevels(),
        get().fetchProfile(),
        get().fetchAchievements(),
        get().fetchDailyQuest(),
        get().fetchLeaderboard(),
      ]);
      get().connectRealtime();
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to load gamification" });
    } finally {
      set({ loading: false });
    }
  },

  fetchProfile: async () => {
    try {
      const profile = await api.get<GamificationProfileOut>("/gamification/profile");
      set({ profile, soundEnabled: profile.sound_enabled });
      return profile;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to load profile" });
      return null;
    }
  },

  fetchLevels: async () => {
    const levels = await api.get<GamificationLevelOut[]>("/gamification/levels");
    set({ levels });
    return levels;
  },

  fetchAchievements: async () => {
    const achievements = await api.get<AchievementOut[]>("/gamification/achievements");
    set({ achievements });
    return achievements;
  },

  fetchDailyQuest: async () => {
    try {
      const dailyQuest = await api.get<DailyQuestOut>("/gamification/daily-quest");
      set({ dailyQuest });
      return dailyQuest;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to load daily quest" });
      return null;
    }
  },

  completeDailyQuest: async () => {
    const result = await api.post<DailyQuestCompleteOut>("/gamification/daily-quest/complete", {});
    await Promise.all([get().fetchProfile(), get().fetchAchievements(), get().fetchDailyQuest()]);
    return result;
  },

  fetchLeaderboard: async () => {
    const leaderboard = await api.get<UniversityLeaderboardEntryOut[]>(
      "/gamification/university-leaderboard?period=weekly",
    );
    set({ leaderboard });
    return leaderboard;
  },

  fetchCareerCard: async () => {
    try {
      const data = await api.get<CareerIdentityCardOut>("/gamification/career-card");
      set({ careerCard: data });
      return data;
    } catch {
      return null;
    }
  },

  fetchNotifications: async (since) => {
    const query = since ? `?since=${encodeURIComponent(since)}` : "";
    const items = await api.get<GamificationNotificationOut[]>(`/gamification/notifications${query}`);
    if (!items.length) return [];

    const latest = items[items.length - 1];
    set((state) => ({
      notifications: items.reduce(pushNotification, state.notifications),
      pollSince: latest.created_at,
    }));

    return items;
  },

  connectRealtime: () => {
    if (typeof window === "undefined") return;
    const state = get();
    if (state.ws) return;

    const token = getStoredTokens()?.access_token;
    if (!token) {
      return;
    }

    const ws = new WebSocket(`${getWsUrl()}?token=${encodeURIComponent(token)}`);

    ws.onopen = () => {
      set({ wsConnected: true });
      const { pollIntervalId } = get();
      if (pollIntervalId) {
        window.clearInterval(pollIntervalId);
        set({ pollIntervalId: null });
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as GamificationNotificationOut;
        set((prev) => ({
          notifications: pushNotification(prev.notifications, data),
          pollSince: data.created_at ?? prev.pollSince,
        }));

        if (data.type === "xp_gained" || data.type === "level_up") {
          get().fetchProfile().catch(() => undefined);
        }
        if (data.type === "achievement_unlocked") {
          get().fetchAchievements().catch(() => undefined);
        }
        if (data.type === "leaderboard_update") {
          get().fetchLeaderboard().catch(() => undefined);
        }
      } catch {
        // ignore malformed payload
      }
    };

    ws.onclose = () => {
      set({ ws: null, wsConnected: false });
      if (typeof window === "undefined") return;
      if (!get().pollIntervalId) {
        const interval = window.setInterval(() => {
          get().fetchNotifications(get().pollSince).catch(() => undefined);
        }, 15000);
        set({ pollIntervalId: interval });
      }
    };

    ws.onerror = () => {
      ws.close();
    };

    set({ ws });
  },

  disconnectRealtime: () => {
    const { ws, pollIntervalId } = get();
    if (ws) {
      ws.close();
    }
    if (pollIntervalId && typeof window !== "undefined") {
      window.clearInterval(pollIntervalId);
    }
    set({ ws: null, wsConnected: false, pollIntervalId: null });
  },

  setSoundEnabled: async (enabled) => {
    await api.patch("/users/me", { sound_enabled: enabled });
    set({ soundEnabled: enabled });
    await get().fetchProfile();
  },
}));
