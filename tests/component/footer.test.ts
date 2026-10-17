import { describe, expect, it } from 'vitest';
import Footer from '../../src/components/Footer.astro';
import { render } from './render';

const props = {
  locale: 'en',
  brand: 'Stairno',
  tagline: 'stairno, Gothic for star.',
  links: {
    heading: 'Projects',
    items: [
      { href: 'https://stairnoworks.com', label: 'Stairno Works' },
      { href: 'https://stairnolabs.com', label: 'Stairno Labs' },
    ],
  },
  source: { href: 'https://github.com/seren-wib/stairno.com', label: 'Source code' },
  switchLabel: 'Korean',
};

describe('Footer', () => {
  it('shows the brand, the tagline and the current year', async () => {
    const root = await render(Footer, props);
    expect(root.querySelector('footer.site-footer')).not.toBeNull();
    expect(root.querySelector('.footer-brand .brand')?.text.trim()).toBe('Stairno');
    expect(root.querySelector('.footer-etymology')?.text.trim()).toBe(props.tagline);
    expect(root.querySelector('.footer-copy')?.text.replace(/\s+/g, ' ').trim()).toBe(
      `© ${new Date().getFullYear()} Stairno`,
    );
  });

  it('uses a given year when one is passed', async () => {
    const root = await render(Footer, { ...props, year: 2030 });
    expect(root.querySelector('.footer-copy')?.text).toContain('2030');
  });

  it('lists the links under a heading in a labelled nav, same tab', async () => {
    const root = await render(Footer, props);
    const nav = root.querySelector('nav.footer-links');
    expect(nav?.getAttribute('aria-label')).toBe('Projects');
    expect(nav?.querySelector('.footer-heading')?.text.trim()).toBe('Projects');
    const links = nav?.querySelectorAll('a') ?? [];
    expect(links.map((a) => a.getAttribute('href'))).toEqual([
      'https://stairnoworks.com',
      'https://stairnolabs.com',
    ]);
    expect(links.map((a) => a.text.trim())).toEqual(['Stairno Works', 'Stairno Labs']);
    expect(links.every((a) => !a.hasAttribute('target'))).toBe(true);
  });

  it('closes with the source link and the locale switch', async () => {
    const root = await render(Footer, props);
    const column = root.querySelectorAll('.footer-links')[1];
    const anchors = column?.querySelectorAll('a') ?? [];
    expect(anchors[0]?.getAttribute('href')).toBe(props.source.href);
    expect(anchors[0]?.text.trim()).toBe('Source code');
    expect(anchors[1]?.getAttribute('class')).toBe('locale-switch');
    expect(anchors[1]?.getAttribute('href')).toBe('/ko/');
    expect(anchors[1]?.text.trim()).toBe('Korean');
  });

  it('reveals its three columns in sequence', async () => {
    const root = await render(Footer, props);
    const targets = root.querySelectorAll('footer [data-reveal]');
    expect(targets.map((el) => el.getAttribute('data-reveal'))).toEqual(['1', '2', '3']);
  });
});
