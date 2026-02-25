"use client";

import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";
import { getStoredTokens } from "@/lib/auth";
import { type Locale } from "@/lib/i18n";
import { GamificationRealtimeBridge } from "@/components/gamification/GamificationRealtimeBridge";
import { useAuthStore } from "@/stores/authStore";
import { LanguageProvider } from "@/components/providers/LanguageProvider";

export function AppProviders({ children, locale }: { children: ReactNode; locale: Locale }) {
  const fetchMe = useAuthStore((s) => s.fetchMe);

  useEffect(() => {
    const tokens = getStoredTokens();
    if (tokens?.access_token) {
      fetchMe().catch(() => undefined);
    }
  }, [fetchMe]);

  return (
    <LanguageProvider initialLocale={locale}>
      {children}
      <GamificationRealtimeBridge />
      <Toaster theme="dark" richColors position="top-right" />
    </LanguageProvider>
  );
}
