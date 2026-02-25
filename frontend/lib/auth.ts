import type { TokenPair } from "@/types/api";

const TOKEN_KEY = "naviq_token_pair";
const LOCALE_KEY = "naviq_locale";

export function getStoredTokens(): TokenPair | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(TOKEN_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TokenPair;
  } catch {
    return null;
  }
}

export function setStoredTokens(tokens: TokenPair) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
  document.cookie = `naviq_access_token=${tokens.access_token}; path=/; samesite=lax`;
}

export function clearStoredTokens() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  document.cookie = "naviq_access_token=; path=/; max-age=0; samesite=lax";
  document.cookie = "naviq_role=; path=/; max-age=0; samesite=lax";
}

export function setRoleCookie(role: string) {
  if (typeof window === "undefined") return;
  document.cookie = `naviq_role=${role.toLowerCase()}; path=/; samesite=lax`;
}

export function getStoredLocale(): "ru" | "uz" {
  if (typeof window === "undefined") return "ru";
  const fromLs = window.localStorage.getItem(LOCALE_KEY);
  if (fromLs === "ru" || fromLs === "uz") return fromLs;
  const cookieMatch = document.cookie.match(/(?:^|;\s*)naviq_locale=(ru|uz)(?:;|$)/);
  if (cookieMatch?.[1] === "ru" || cookieMatch?.[1] === "uz") {
    return cookieMatch[1];
  }
  return "ru";
}

export function setStoredLocale(locale: "ru" | "uz") {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCALE_KEY, locale);
  document.cookie = `naviq_locale=${locale}; path=/; max-age=31536000; samesite=lax`;
}
