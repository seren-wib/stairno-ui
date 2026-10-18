import type { HTMLElement } from 'node-html-parser';
import { describe, expect, it } from 'vitest';
import Header from '../../src/components/Header.astro';
import { render } from './render';

const themeLabels = { light: 'Light', dark: 'Dark', toggle: 'Theme' };
const items = [
  { href: '#projects', label: 'Projects', labelAttrs: { 'data-dot-text': '' } },
  { href: '#news', label: 'News' },
  { href: '#contact', label: 'Contact' },
];
const props = { locale: 'ko', brand: 'Stairno', items, switchLabel: 'English', themeLabels };

// Element children only, minus the component scripts the Container renders inline.
// Element children only, minus the component scripts the Container renders inline.
function elements(parent: HTMLElement | null): HTMLElement[] {
  return (parent?.childNodes.filter((n) => n.nodeType === 1) ?? []).filter(
    (n) => !/^(script|style)$/i.test((n as HTMLElement).rawTagName),
  ) as HTMLElement[];
}

describe('Header', () => {
  it('is a fixed header the script can solidify on scroll', async () => {
    const root = await render(Header, props);
    expect(root.querySelector('header.site-header[data-sticky]')).not.toBeNull();
  });

  it('links the brand to the locale home', async () => {
    const root = await render(Header, props);
    const brand = root.querySelector('a.brand');
    expect(brand?.getAttribute('href')).toBe('/ko/');
    expect(brand?.text.trim()).toBe('Stairno');
  });

  it('links the brand where brandHref says, for a site whose home is elsewhere', async () => {
    const root = await render(Header, { ...props, brandHref: 'https://stairno.com/ko/' });
    expect(root.querySelector('a.brand')?.getAttribute('href')).toBe('https://stairno.com/ko/');
  });

  it('renders the menu items in order and starts with nothing current', async () => {
    const root = await render(Header, props);
    const links = root.querySelectorAll('ul.site-menu[data-menu] a');
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['#projects', '#news', '#contact']);
    expect(links.map((a) => a.text.trim())).toEqual(['Projects', 'News', 'Contact']);
    expect(root.querySelector('nav a[aria-current]')).toBeNull();
  });

  it('spreads label attributes onto the label span only', async () => {
    const root = await render(Header, props);
    const spans = root.querySelectorAll('.site-menu a > span');
    expect(spans).toHaveLength(3);
    expect(spans[0]?.hasAttribute('data-dot-text')).toBe(true);
    expect(spans[1]?.hasAttribute('data-dot-text')).toBe(false);
    expect(root.querySelector('.site-menu a[data-dot-text]')).toBeNull();
  });

  it('renders no menu list when there are no items', async () => {
    const root = await render(Header, { ...props, items: undefined });
    expect(root.querySelector('ul.site-menu')).toBeNull();
    expect(root.querySelector('a.brand')).not.toBeNull();
  });

  it('ends the nav with the locale switch and the theme toggle', async () => {
    const root = await render(Header, { ...props, locale: 'en', switchLabel: 'Korean' });
    const last = elements(root.querySelector('nav.site-nav')).slice(-2);
    expect(last[0]?.rawTagName).toBe('a');
    expect(last[0]?.getAttribute('href')).toBe('/ko/');
    expect(last[0]?.getAttribute('hreflang')).toBe('ko');
    expect(last[1]?.rawTagName).toBe('button');
    expect(last[1]?.getAttribute('aria-label')).toBe(themeLabels.toggle);
  });

  it('places the actions slot between the menu and the locale switch', async () => {
    const root = await render(Header, props, {
      actions: '<a class="sign-in" href="/ko/sign-in/">Sign in</a>',
    });
    const classes = elements(root.querySelector('nav.site-nav')).map((el) =>
      el.getAttribute('class'),
    );
    expect(classes).toEqual(['site-menu', 'sign-in', 'locale-switch', 'theme-toggle']);
  });
});
