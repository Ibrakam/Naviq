import { cookies } from "next/headers";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n";

export async function getLocaleFromCookies(): Promise<Locale> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("naviq_locale")?.value;
  if (raw === "ru" || raw === "uz") return raw;
  return DEFAULT_LOCALE;
}
