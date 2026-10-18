import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import AccountMenu from '../../src/components/AccountMenu.astro';
import { render } from './render';

const labels = {
  signedIn: 'Account menu',
  signedOut: 'Sign in menu',
  manage: 'Manage account',
  signOut: 'Log out',
  signIn: 'Log in',
  signUp: 'Sign up',
};
const urls = {
  accountUrl: 'https://account.stairno.com/en/',
  signInUrl: 'https://account.stairno.com/en/sign-in?redirect=https://stairno.com/en/',
  signUpUrl: 'https://account.stairno.com/en/sign-up',
  signOutUrl: 'https://api.stairno.com/auth/sign-out',
};
const base = { locale: 'en', labels, ...urls };
const user = { name: 'yuseong', email: 'yuseong@example.com' };

describe('AccountMenu', () => {
  it('is a disclosure: a button that controls a hidden card', async () => {
    const root = await render(AccountMenu, { ...base, user });
    const button = root.querySelector('[data-account-menu] > button.user-menu-button');
    const card = root.querySelector('[data-account-menu] > .user-menu-card');
    expect(button?.getAttribute('type')).toBe('button');
    expect(button?.getAttribute('aria-expanded')).toBe('false');
    expect(card?.getAttribute('id')).toBeTruthy();
    expect(button?.getAttribute('aria-controls')).toBe(card?.getAttribute('id'));
    expect(card?.hasAttribute('hidden')).toBe(true);
  });

  it('gives each menu its own card id', async () => {
    const a = await render(AccountMenu, { ...base, user });
    const b = await render(AccountMenu, { ...base, user });
    expect(a.querySelector('.user-menu-card')?.id).not.toBe(b.querySelector('.user-menu-card')?.id);
  });

  it('uses a given id when one is passed', async () => {
    const root = await render(AccountMenu, { ...base, user, id: 'hub-account' });
    expect(root.querySelector('.user-menu-card')?.id).toBe('hub-account');
    expect(root.querySelector('button')?.getAttribute('aria-controls')).toBe('hub-account');
  });

  describe('signed in', () => {
    it('shows the initial on the button and labels it for the signed-in state', async () => {
      const root = await render(AccountMenu, { ...base, user });
      const button = root.querySelector('button.user-menu-button');
      expect(button?.getAttribute('aria-label')).toBe('Account menu');
      expect(root.querySelector('[data-account-menu]')?.getAttribute('data-state')).toBe(
        'signed-in',
      );
      const initial = root.querySelector('[data-account-initial]');
      expect(initial?.text.trim()).toBe('Y');
      expect(initial?.hasAttribute('hidden')).toBe(false);
      expect(root.querySelector('[data-account-icon]')?.hasAttribute('hidden')).toBe(true);
    });

    it('falls back to the email initial when the name is empty', async () => {
      const root = await render(AccountMenu, {
        ...base,
        user: { name: '', email: 'claire@example.com' },
      });
      expect(root.querySelector('[data-account-initial]')?.text.trim()).toBe('C');
      expect(root.querySelector('[data-account-name]')?.text.trim()).toBe('claire@example.com');
    });

    it('lists the name, the email, the account link and the log out button', async () => {
      const root = await render(AccountMenu, { ...base, user });
      const section = root.querySelector('[data-account-signed-in]');
      expect(section?.hasAttribute('hidden')).toBe(false);
      expect(section?.querySelector('[data-account-name]')?.text.trim()).toBe('yuseong');
      expect(section?.querySelector('[data-account-email]')?.text.trim()).toBe(
        'yuseong@example.com',
      );
      const manage = section?.querySelector('a');
      expect(manage?.getAttribute('href')).toBe(urls.accountUrl);
      expect(manage?.text.trim()).toBe('Manage account');
      const out = section?.querySelector('button[data-account-sign-out]');
      expect(out?.getAttribute('type')).toBe('button');
      expect(out?.text.trim()).toBe('Log out');
      expect(root.querySelector('[data-account-menu]')?.getAttribute('data-sign-out-url')).toBe(
        urls.signOutUrl,
      );
    });

    it('renders no signed-out links and reads no session', async () => {
      const root = await render(AccountMenu, {
        ...base,
        user,
        sessionUrl: 'https://api.stairno.com/auth/get-session',
      });
      expect(root.querySelector('[data-account-signed-out]')).toBeNull();
      expect(root.querySelector('[data-account-menu]')?.hasAttribute('data-session-url')).toBe(
        false,
      );
    });
  });

  describe('signed out', () => {
    it('shows the person icon and labels the button for the signed-out state', async () => {
      const root = await render(AccountMenu, base);
      const button = root.querySelector('button.user-menu-button');
      expect(button?.getAttribute('aria-label')).toBe('Sign in menu');
      expect(root.querySelector('[data-account-menu]')?.getAttribute('data-state')).toBe(
        'signed-out',
      );
      const icon = root.querySelector('[data-account-icon]');
      expect(icon?.hasAttribute('hidden')).toBe(false);
      const svg = icon?.querySelector('svg');
      expect(svg?.getAttribute('aria-hidden')).toBe('true');
      expect(svg?.toString()).toContain('currentColor');
      expect(root.querySelector('[data-account-signed-in]')).toBeNull();
    });

    it('links to log in and sign up', async () => {
      const root = await render(AccountMenu, base);
      const links = root.querySelectorAll('[data-account-signed-out] a');
      expect(links.map((a) => a.getAttribute('href'))).toEqual([urls.signInUrl, urls.signUpUrl]);
      expect(links.map((a) => a.text.trim())).toEqual(['Log in', 'Sign up']);
    });
  });

  describe('session read in the browser', () => {
    const sessionUrl = 'https://api.stairno.com/auth/get-session';

    it('starts signed out and carries the session URL and both labels for the script', async () => {
      const root = await render(AccountMenu, { ...base, sessionUrl });
      const menu = root.querySelector('[data-account-menu]');
      expect(menu?.getAttribute('data-state')).toBe('signed-out');
      expect(menu?.getAttribute('data-session-url')).toBe(sessionUrl);
      expect(menu?.getAttribute('data-label-signed-in')).toBe('Account menu');
      expect(menu?.getAttribute('data-label-signed-out')).toBe('Sign in menu');
      expect(menu?.getAttribute('data-locale')).toBe('en');
      expect(root.querySelector('button')?.getAttribute('aria-label')).toBe('Sign in menu');
    });

    it('renders the signed-in section hidden and empty, ready to fill', async () => {
      const root = await render(AccountMenu, { ...base, sessionUrl });
      const signedIn = root.querySelector('[data-account-signed-in]');
      expect(signedIn?.hasAttribute('hidden')).toBe(true);
      expect(signedIn?.querySelector('[data-account-name]')?.text.trim()).toBe('');
      expect(root.querySelector('[data-account-signed-out]')?.hasAttribute('hidden')).toBe(false);
      expect(root.querySelector('[data-account-initial]')?.hasAttribute('hidden')).toBe(true);
    });
  });

  describe('styles', () => {
    const source = readFileSync('src/components/AccountMenu.astro', 'utf8');
    const style = source.split('<style>')[1]?.split('</style>')[0] ?? '';

    it('never lets a class display rule show a hidden element', () => {
      expect(style).toMatch(/\[hidden\]\s*\{\s*display:\s*none\s*!important;?\s*\}/);
    });

    it('draws a 36px round button in the on-night colours', () => {
      const button = style.split('.user-menu-button {')[1]?.split('}')[0] ?? '';
      expect(button).toContain('width: 36px');
      expect(button).toContain('height: 36px');
      expect(button).toContain('border-radius: 999px');
      expect(button).toMatch(/var\(--on-night/);
    });

    it('frames the card like the account center card', () => {
      const card = style.split('.user-menu-card {')[1]?.split('}')[0] ?? '';
      expect(card).toContain('width: 280px');
      expect(card).toContain('border: 1px solid var(--border)');
      expect(card).toContain('border-radius: calc(var(--radius) * 1.6)');
      expect(card).toContain('background: var(--bg)');
      expect(card).toContain('color: var(--fg)');
      expect(card).toContain('box-shadow:');
      expect(card).toMatch(/animation: user-menu-in 120ms/);
    });

    it('fits the card inside the gutters on narrow screens', () => {
      expect(style).toMatch(/@media \(max-width: \d+px\)[^@]*\.user-menu-card[^}]*var\(--gutter\)/);
    });

    it('drops the animation under reduced motion', () => {
      const reduced = style.split('@media (prefers-reduced-motion: reduce)')[1] ?? '';
      expect(reduced).toContain('.user-menu-card');
      expect(reduced).toContain('animation: none');
    });

    it('sets no inline styles and no inline handlers', () => {
      expect(source).not.toMatch(/\son[a-z]+=/);
      expect(source).not.toMatch(/\sstyle=/);
      expect(source).not.toContain('.style.');
      expect(source).not.toContain('innerHTML');
    });
  });
});
