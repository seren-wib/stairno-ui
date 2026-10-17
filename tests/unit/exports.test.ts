import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import * as index from '../../src/index';

describe('package entry', () => {
  it('re-exports the theme and locale helpers', () => {
    expect(typeof index.resolveTheme).toBe('function');
    expect(typeof index.nextTheme).toBe('function');
    expect(typeof index.localePath).toBe('function');
    expect(typeof index.alternateLocale).toBe('function');
    expect(index.THEME_KEY).toBe('theme');
    expect([...index.locales]).toEqual(['ko', 'en']);
  });

  it('maps every export path to a file that exists', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as {
      exports: Record<string, string>;
    };
    for (const [key, target] of Object.entries(pkg.exports)) {
      if (key.includes('*')) continue;
      expect(() => readFileSync(target), key).not.toThrow();
    }
    expect(pkg.exports['./components/*']).toBe('./src/components/*');
  });
});
