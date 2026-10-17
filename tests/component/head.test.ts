import { describe, expect, it } from 'vitest';
import Fonts from '../../src/components/Fonts.astro';
import ThemeInit from '../../src/components/ThemeInit.astro';
import { resolveTheme } from '../../src/lib/theme';
import { render } from './render';

type FakeRoot = {
  attributes: Record<string, string>;
  style: Record<string, string>;
};

function run(script: string, stored: string | null, prefersDark: boolean, throws = false) {
  const fake: FakeRoot = { attributes: {}, style: {} };
  const fakeDocument = {
    documentElement: {
      style: fake.style,
      setAttribute: (name: string, value: string) => {
        fake.attributes[name] = value;
      },
    },
  };
  const fakeWindow = { matchMedia: () => ({ matches: prefersDark }) };
  const fakeStorage = {
    getItem: () => {
      if (throws) throw new Error('blocked');
      return stored;
    },
  };
  new Function('document', 'window', 'localStorage', script)(fakeDocument, fakeWindow, fakeStorage);
  return fake;
}

describe('ThemeInit', () => {
  it('renders one inline script and nothing else', async () => {
    const root = await render(ThemeInit, {});
    const scripts = root.querySelectorAll('script');
    expect(scripts).toHaveLength(1);
    expect(scripts[0]?.hasAttribute('src')).toBe(false);
    expect(root.childNodes.filter((n) => n.nodeType === 1)).toHaveLength(1);
  });

  it.each([
    [null, false],
    [null, true],
    ['light', true],
    ['dark', false],
    ['junk', true],
  ] as const)('matches resolveTheme for stored=%s prefersDark=%s', async (stored, prefersDark) => {
    const root = await render(ThemeInit, {});
    const fake = run(root.querySelector('script')?.text ?? '', stored, prefersDark);
    const expected = resolveTheme(stored, prefersDark);
    expect(fake.attributes['data-theme']).toBe(expected);
    expect(fake.style['colorScheme']).toBe(expected);
  });

  it('falls back to the system preference when storage throws', async () => {
    const root = await render(ThemeInit, {});
    const fake = run(root.querySelector('script')?.text ?? '', 'light', true, true);
    expect(fake.attributes['data-theme']).toBe('dark');
  });
});

describe('Fonts', () => {
  it('preconnects to jsDelivr and loads the Pretendard variable subset', async () => {
    const root = await render(Fonts, {});
    const preconnect = root.querySelector('link[rel="preconnect"]');
    expect(preconnect?.getAttribute('href')).toBe('https://cdn.jsdelivr.net');
    expect(preconnect?.hasAttribute('crossorigin')).toBe(true);
    const sheet = root.querySelector('link[rel="stylesheet"]');
    expect(sheet?.getAttribute('href')).toMatch(
      /^https:\/\/cdn\.jsdelivr\.net\/gh\/orioncactus\/pretendard@v[\d.]+\/dist\/web\/variable\/pretendardvariable-dynamic-subset\.min\.css$/,
    );
  });
});
