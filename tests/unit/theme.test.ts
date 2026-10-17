import { describe, expect, it } from 'vitest';
import { THEME_KEY, isTheme, nextTheme, resolveTheme } from '../../src/lib/theme';

describe('resolveTheme', () => {
  it('follows the system preference when nothing is stored', () => {
    expect(resolveTheme(null, false)).toBe('light');
    expect(resolveTheme(null, true)).toBe('dark');
  });

  it('uses the stored theme over the system preference', () => {
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
  });

  it('ignores unknown stored values', () => {
    expect(resolveTheme('junk', true)).toBe('dark');
    expect(resolveTheme('', false)).toBe('light');
  });
});

describe('nextTheme', () => {
  it('flips between light and dark', () => {
    expect(nextTheme('light')).toBe('dark');
    expect(nextTheme('dark')).toBe('light');
  });
});

describe('isTheme', () => {
  it('accepts only light and dark', () => {
    expect(isTheme('light')).toBe(true);
    expect(isTheme('dark')).toBe(true);
    expect(isTheme('auto')).toBe(false);
    expect(isTheme(undefined)).toBe(false);
  });
});

describe('storage', () => {
  it('stores the theme under a single known key shared by every site', () => {
    expect(THEME_KEY).toBe('theme');
  });
});
