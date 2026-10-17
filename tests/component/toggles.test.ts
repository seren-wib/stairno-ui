import { describe, expect, it } from 'vitest';
import LocaleSwitch from '../../src/components/LocaleSwitch.astro';
import ThemeToggle from '../../src/components/ThemeToggle.astro';
import { render } from './render';

describe('LocaleSwitch', () => {
  it('links from ko to the same page in en', async () => {
    const root = await render(LocaleSwitch, { locale: 'ko', label: 'English' });
    const link = root.querySelector('a.locale-switch');
    expect(link?.getAttribute('href')).toBe('/en/');
    expect(link?.getAttribute('hreflang')).toBe('en');
    expect(link?.getAttribute('lang')).toBe('en');
    expect(link?.getAttribute('rel')).toBe('alternate');
    expect(link?.text.trim()).toBe('English');
  });

  it('links from en back to ko and keeps the path', async () => {
    const root = await render(LocaleSwitch, { locale: 'en', path: 'about', label: 'Korean' });
    const link = root.querySelector('a');
    expect(link?.getAttribute('href')).toBe('/ko/about/');
    expect(link?.getAttribute('hreflang')).toBe('ko');
    expect(link?.text.trim()).toBe('Korean');
  });
});

describe('ThemeToggle', () => {
  const labels = {
    light: 'Switch to light mode',
    dark: 'Switch to dark mode',
    toggle: 'Toggle theme',
  };

  it('renders a labelled button carrying both state labels', async () => {
    const root = await render(ThemeToggle, { labels });
    const button = root.querySelector('button.theme-toggle');
    expect(button).not.toBeNull();
    expect(button?.getAttribute('type')).toBe('button');
    expect(button?.hasAttribute('data-theme-toggle')).toBe(true);
    expect(button?.getAttribute('aria-label')).toBe(labels.toggle);
    expect(button?.getAttribute('data-label-light')).toBe(labels.light);
    expect(button?.getAttribute('data-label-dark')).toBe(labels.dark);
  });

  it('draws a sun and a moon icon hidden from assistive tech', async () => {
    const root = await render(ThemeToggle, { labels });
    const icons = root.querySelectorAll('svg');
    expect(icons.map((svg) => svg.getAttribute('class'))).toEqual([
      'icon icon-sun',
      'icon icon-moon',
    ]);
    expect(icons.every((svg) => svg.getAttribute('aria-hidden') === 'true')).toBe(true);
  });
});
