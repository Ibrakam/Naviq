"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { setStoredLocale } from "@/lib/auth";
import { api } from "@/lib/api";
import { DEFAULT_LOCALE, type Locale, translations } from "@/lib/i18n";
import type { Translations } from "@/i18n/translations/ru";
import { useAuthStore } from "@/stores/authStore";
import type { UserOut } from "@/types/api";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ initialLocale = DEFAULT_LOCALE, children }: { initialLocale?: Locale; children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const preferredLanguage = useAuthStore((s) => s.user?.preferred_language);

  const setLocale = useCallback((value: Locale) => {
    setLocaleState(value);
    setStoredLocale(value);

    const currentUser = useAuthStore.getState().user;
    if (currentUser && currentUser.preferred_language !== value) {
      api
        .patch<UserOut>("/users/me", { preferred_language: value })
        .then((updatedUser) => {
          useAuthStore.setState({ user: updatedUser });
        })
        .catch(() => undefined);
    }
  }, []);

  useEffect(() => {
    if (!preferredLanguage || preferredLanguage === locale) return;
    setLocaleState(preferredLanguage);
    setStoredLocale(preferredLanguage);
  }, [locale, preferredLanguage]);

  const value = useMemo(
    () => ({ locale, setLocale, t: translations[locale] }),
    [locale, setLocale],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used inside LanguageProvider");
  }

  return context;
}
