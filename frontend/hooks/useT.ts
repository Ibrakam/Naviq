"use client";

import { useCallback } from "react";
import { useTranslation } from "@/components/providers/LanguageProvider";
import { getTranslationValue, type TranslationKey, type TranslationValue } from "@/lib/i18n";

function applyParams(value: string, params?: Record<string, string | number>) {
  if (!params) return value;
  return value.replace(/\{(\w+)\}/g, (_, key: string) => {
    const replacement = params[key];
    return replacement === undefined ? `{${key}}` : String(replacement);
  });
}

export function useT() {
  const { locale, setLocale } = useTranslation();

  const t = useCallback(
    <K extends TranslationKey>(key: K, params?: Record<string, string | number>): TranslationValue<K> => {
      const value = getTranslationValue(locale, key);
      if (typeof value === "string") {
        return applyParams(value, params) as TranslationValue<K>;
      }
      return value;
    },
    [locale],
  );

  return { locale, setLocale, t };
}
