// Locale routing shared by every Stairno site: two locales, both prefixed,
// Korean first. Dictionaries stay in each site; only the path rules live here.

export const locales = ['ko', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'ko';

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function localePath(locale: Locale, path = ''): string {
  const trimmed = path.replace(/^\/+|\/+$/g, '');
  return trimmed ? `/${locale}/${trimmed}/` : `/${locale}/`;
}

export function alternateLocale(locale: Locale): Locale {
  return locale === 'ko' ? 'en' : 'ko';
}
