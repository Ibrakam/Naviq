"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { api } from "@/lib/api";
import { clearStoredTokens, setRoleCookie, setStoredTokens } from "@/lib/auth";
import type { LoginRequest, RegisterRequest, TokenPair, UserOut } from "@/types/api";
import { normalizeRole } from "@/lib/utils";

type AuthStore = {
  user: UserOut | null;
  tokens: TokenPair | null;
  isHydrated: boolean;
  isLoading: boolean;
  error: string | null;
  setHydrated: (hydrated: boolean) => void;
  login: (payload: LoginRequest) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  fetchMe: () => Promise<UserOut | null>;
  logout: () => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isHydrated: false,
      isLoading: false,
      error: null,
      setHydrated: (hydrated) => set({ isHydrated: hydrated }),
      login: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          const tokens = await api.post<TokenPair>("/auth/login", payload, { auth: false });
          setStoredTokens(tokens);
          set({ tokens });
          await get().fetchMe();
        } catch (err) {
          set({ error: err instanceof Error ? err.message : "Login failed" });
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },
      register: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          const tokens = await api.post<TokenPair>("/auth/register", payload, { auth: false });
          setStoredTokens(tokens);
          set({ tokens });
          await get().fetchMe();
        } catch (err) {
          set({ error: err instanceof Error ? err.message : "Registration failed" });
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },
      fetchMe: async () => {
        try {
          const user = await api.get<UserOut>("/users/me");
          setRoleCookie(normalizeRole(user.role).toLowerCase());
          set({ user });
          return user;
        } catch {
          set({ user: null });
          return null;
        }
      },
      logout: () => {
        clearStoredTokens();
        set({ user: null, tokens: null, error: null });
      },
    }),
    {
      name: "naviq-auth-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, tokens: state.tokens }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
