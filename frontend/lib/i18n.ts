import { ru, type Translations } from "@/i18n/translations/ru";
import { uz } from "@/i18n/translations/uz";

export type Locale = "ru" | "uz";

export const translations: Record<Locale, Translations> = {
  ru,
  uz,
};

export const DEFAULT_LOCALE: Locale = "ru";

type Primitive = string | number | boolean | null | undefined;
type Join<K, P> = K extends string ? (P extends string ? `${K}.${P}` : never) : never;

type Leaves<T> = T extends Primitive
  ? never
  : {
      [K in keyof T & string]:
        T[K] extends Primitive
          ? K
          : T[K] extends Array<infer U>
            ? U extends Primitive
              ? K
              : Join<K, Leaves<U>>
            : Join<K, Leaves<T[K]>>;
    }[keyof T & string];

type ValueAtPath<T, P extends string> =
  P extends `${infer K}.${infer Rest}`
    ? K extends keyof T
      ? ValueAtPath<T[K], Rest>
      : never
    : P extends keyof T
      ? T[P]
      : never;

export type TranslationKey = Leaves<Translations>;
export type TranslationValue<K extends TranslationKey> = ValueAtPath<Translations, K>;

export function getTranslationValue<K extends TranslationKey>(
  locale: Locale,
  key: K,
): TranslationValue<K> {
  const segments = key.split(".");
  let current: unknown = translations[locale];

  for (const segment of segments) {
    if (typeof current !== "object" || current === null) {
      return key as TranslationValue<K>;
    }
    current = (current as Record<string, unknown>)[segment];
  }

  return current as TranslationValue<K>;
}
