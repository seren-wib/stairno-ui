export type Theme = 'light' | 'dark';

// One key for every Stairno site, so a choice made on one site carries over
// to the others on the same origin when they share it, and never collides.
export const THEME_KEY = 'theme';

export function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark';
}

// Stored choice wins; otherwise follow the system preference. The inline
// script in ThemeInit.astro repeats this rule; the component test keeps the
// two in step.
export function resolveTheme(stored: string | null, prefersDark: boolean): Theme {
  if (isTheme(stored)) return stored;
  return prefersDark ? 'dark' : 'light';
}

export function nextTheme(current: Theme): Theme {
  return current === 'dark' ? 'light' : 'dark';
}
