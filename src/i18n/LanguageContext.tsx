import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { ru, type Translations } from "./translations/ru";
import { uz } from "./translations/uz";

export type Locale = "ru" | "uz";

const translations: Record<Locale, Translations> = { ru, uz };

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getInitialLocale(): Locale {
  try {
    const saved = localStorage.getItem("naviq-locale");
    if (saved === "ru" || saved === "uz") return saved;
  } catch {}
  return "ru";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem("naviq-locale", newLocale);
    } catch {}
  }, []);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t: translations[locale] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useTranslation must be used within LanguageProvider");
  return ctx;
}
