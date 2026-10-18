import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const tokens = readFileSync('src/styles/tokens.css', 'utf8');
const base = readFileSync('src/styles/base.css', 'utf8');

function declared(css: string, selector: string): string[] {
  const block = css.split(selector)[1]?.split('}')[0] ?? '';
  return Array.from(block.matchAll(/--([a-z0-9-]+):/g), (m) => m[1] ?? '');
}

describe('tokens.css', () => {
  it('declares the same theme tokens for light and dark', () => {
    const light = declared(tokens, "html[data-theme='light'] {");
    const dark = declared(tokens, "html[data-theme='dark'] {");
    expect(light.length).toBeGreaterThan(0);
    expect(dark).toEqual(light);
  });

  it('keeps the night palette and Pretendard as brand constants', () => {
    expect(tokens).toContain('--night: #000000;');
    expect(tokens).toContain('--star: #ffffff;');
    expect(tokens).toMatch(/--font-sans:\s*'Pretendard Variable'/);
  });

  it('switches theme on the html attribute, never on a media query', () => {
    expect(tokens).not.toContain('prefers-color-scheme');
  });
});

describe('base.css', () => {
  it('imports the tokens first', () => {
    expect(base.trimStart().startsWith("@import './tokens.css';")).toBe(true);
  });

  it('styles the shared header, footer, locale switch and button', () => {
    for (const selector of [
      '.container {',
      '.site-header {',
      '.site-header.is-solid {',
      '.brand {',
      '.site-menu a {',
      ".site-menu a[aria-current='true'] {",
      '.locale-switch {',
      '.site-footer {',
      '.footer-grid {',
      '.footer-links .locale-switch {',
      '.button {',
    ]) {
      expect(base, selector).toContain(selector);
    }
  });

  it('keeps the footer at the bottom of the viewport on short pages', () => {
    const block = (selector: string) => base.split(`\n${selector} {`)[1]?.split('}')[0] ?? '';
    const body = block('body');
    expect(body).toContain('display: flex;');
    expect(body).toContain('flex-direction: column;');
    // 100vh first as the fallback, 100dvh after it so browsers that know it use it.
    expect(body).toMatch(/min-height: 100vh;\s*min-height: 100dvh;/);
    // The footer takes the leftover space above itself. Growing main instead would stretch a
    // grid main's rows (the hub's 404 page moves its second section down).
    const footer = block('.site-footer');
    expect(footer).toContain('margin-top: auto;');
    expect(footer).toContain('flex-shrink: 0;');
    expect(base).not.toMatch(/(^|\n)body > main\s*\{/);
  });

  it('turns its transitions off under reduced motion', () => {
    const reduced = base.split('@media (prefers-reduced-motion: reduce)')[1] ?? '';
    expect(reduced).toContain('.site-header');
    expect(reduced).toContain('.site-menu a');
    expect(reduced).toContain('.locale-switch');
    expect(reduced).toContain('transition: none');
  });

  it('leaves site-specific sections to the site', () => {
    for (const name of ['hero', 'section', 'slide', 'news-line', 'contact', 'not-found']) {
      expect(base, name).not.toMatch(new RegExp(`(^|[\s,])\.${name}[\s.{,:\[]`, 'm'));
    }
  });
});
