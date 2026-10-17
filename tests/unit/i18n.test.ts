import { describe, expect, it } from 'vitest';
import { alternateLocale, defaultLocale, isLocale, localePath, locales } from '../../src/lib/i18n';

describe('locales', () => {
  it('supports exactly ko and en with ko as default', () => {
    expect([...locales]).toEqual(['ko', 'en']);
    expect(defaultLocale).toBe('ko');
  });

  it('isLocale accepts only supported locales', () => {
    expect(isLocale('ko')).toBe(true);
    expect(isLocale('en')).toBe(true);
    expect(isLocale('fr')).toBe(false);
    expect(isLocale('')).toBe(false);
    expect(isLocale('KO')).toBe(false);
  });

  it('localePath builds a prefixed path with a trailing slash', () => {
    expect(localePath('ko')).toBe('/ko/');
    expect(localePath('en')).toBe('/en/');
    expect(localePath('ko', 'about')).toBe('/ko/about/');
    expect(localePath('en', '/about/')).toBe('/en/about/');
  });

  it('alternateLocale swaps ko and en', () => {
    expect(alternateLocale('ko')).toBe('en');
    expect(alternateLocale('en')).toBe('ko');
  });
});
