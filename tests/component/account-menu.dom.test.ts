import { readFileSync } from 'node:fs';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { Window } from 'happy-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AccountMenu from '../../src/components/AccountMenu.astro';
import { mountAccountMenu } from '../../src/lib/account';

const labels = {
  signedIn: 'Account menu',
  signedOut: 'Sign in menu',
  manage: 'Manage account',
  signOut: 'Log out',
  signIn: 'Log in',
  signUp: 'Sign up',
};
const base = {
  locale: 'en',
  labels,
  accountUrl: 'https://account.stairno.com/en/',
  signInUrl: 'https://account.stairno.com/en/sign-in',
  signUpUrl: 'https://account.stairno.com/en/sign-up',
  signOutUrl: 'https://api.stairno.com/auth/sign-out',
};
const user = { name: 'yuseong', email: 'yuseong@example.com' };

type Fetch = (url: string, init?: RequestInit) => Promise<Response>;

// Astro renders in Node, so the markup goes into a happy-dom window built here rather than a
// happy-dom test environment, where the Container cannot render.
let window: Window;
let document: Document;

beforeEach(() => {
  window = new Window({ url: 'https://stairno.com/en/' });
  document = window.document as unknown as Document;
  vi.stubGlobal('document', document);
});

afterEach(async () => {
  vi.unstubAllGlobals();
  await window.happyDOM.close();
});

async function setup(props: Record<string, unknown>, options: { fetch?: Fetch } = {}) {
  const container = await AstroContainer.create();
  const html = await container.renderToString(AccountMenu, { props });
  document.body.innerHTML = `<a id="outside" href="#x">outside</a><p id="plain">text</p>${html}`;
  const root = document.querySelector<HTMLElement>('[data-account-menu]')!;
  const reload = vi.fn();
  const fetch = vi.fn<Fetch>(options.fetch ?? (async () => new Response('null')));
  const ready = mountAccountMenu(root, { fetch, reload });
  const button = root.querySelector<HTMLButtonElement>('.user-menu-button')!;
  const card = root.querySelector<HTMLElement>('.user-menu-card')!;
  return { root, button, card, reload, fetch, ready };
}

function press(key: string, target: Element) {
  target.dispatchEvent(
    new window.KeyboardEvent('keydown', { key, bubbles: true }) as unknown as Event,
  );
}

describe('AccountMenu behaviour', () => {
  it('opens on click and moves focus to the first link', async () => {
    const { button, card } = await setup({ ...base, user });
    button.click();
    expect(card.hidden).toBe(false);
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement?.textContent?.trim()).toBe('Manage account');
  });

  it('closes on a second click', async () => {
    const { button, card } = await setup({ ...base, user });
    button.click();
    button.click();
    expect(card.hidden).toBe(true);
    expect(button.getAttribute('aria-expanded')).toBe('false');
  });

  it('closes on Esc and returns focus to the button', async () => {
    const { button, card } = await setup({ ...base, user });
    button.click();
    press('Escape', document.activeElement!);
    expect(card.hidden).toBe(true);
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(button);
  });

  it('ignores Esc while closed', async () => {
    const { card, button } = await setup({ ...base, user });
    press('Escape', button);
    expect(card.hidden).toBe(true);
  });

  it('closes on an outside click and returns focus to the button', async () => {
    const { button, card } = await setup({ ...base, user });
    button.click();
    document.getElementById('plain')!.click();
    expect(card.hidden).toBe(true);
    expect(document.activeElement).toBe(button);
  });

  it('stays open on a click inside the card', async () => {
    const { button, card } = await setup({ ...base, user });
    button.click();
    card.querySelector<HTMLElement>('[data-account-name]')!.click();
    expect(card.hidden).toBe(false);
  });

  it('closes when focus leaves the menu, without pulling focus back', async () => {
    const { button, card } = await setup({ ...base, user });
    button.click();
    const outside = document.getElementById('outside')!;
    outside.focus();
    expect(card.hidden).toBe(true);
    expect(document.activeElement).toBe(outside);
  });

  it('signs out with a POST and reloads', async () => {
    const { button, root, fetch, reload } = await setup(
      { ...base, user },
      { fetch: async () => new Response('{"success":true}') },
    );
    button.click();
    const out = root.querySelector<HTMLButtonElement>('[data-account-sign-out]')!;
    out.click();
    await vi.waitFor(() => expect(reload).toHaveBeenCalledOnce());
    expect(fetch).toHaveBeenCalledWith(base.signOutUrl, {
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: '{}',
    });
    expect(out.disabled).toBe(true);
  });

  it('reloads even when sign-out fails', async () => {
    const { button, root, reload } = await setup(
      { ...base, user },
      {
        fetch: async () => {
          throw new TypeError('Failed to fetch');
        },
      },
    );
    button.click();
    root.querySelector<HTMLButtonElement>('[data-account-sign-out]')!.click();
    await vi.waitFor(() => expect(reload).toHaveBeenCalledOnce());
  });

  it('opens on the log in link when signed out', async () => {
    const { button, fetch } = await setup(base);
    button.click();
    expect(document.activeElement?.textContent?.trim()).toBe('Log in');
    expect(fetch).not.toHaveBeenCalled();
  });

  describe('with a session URL', () => {
    const sessionUrl = 'https://api.stairno.com/auth/get-session';

    it('switches to signed in when the session has a user', async () => {
      const { root, button, fetch, ready } = await setup(
        { ...base, sessionUrl },
        {
          fetch: async () =>
            new Response(
              JSON.stringify({ session: {}, user: { name: '김유성', email: 'k@x.io' } }),
            ),
        },
      );
      await ready;
      expect(fetch.mock.calls[0]?.[0]).toBe(sessionUrl);
      expect(fetch.mock.calls[0]?.[1]?.credentials).toBe('include');
      expect(root.dataset.state).toBe('signed-in');
      expect(button.getAttribute('aria-label')).toBe('Account menu');
      const initial = root.querySelector<HTMLElement>('[data-account-initial]')!;
      expect(initial.hidden).toBe(false);
      expect(initial.textContent).toBe('김');
      expect(root.querySelector<HTMLElement>('[data-account-icon]')!.hidden).toBe(true);
      expect(root.querySelector('[data-account-name]')!.textContent).toBe('김유성');
      expect(root.querySelector('[data-account-email]')!.textContent).toBe('k@x.io');
      expect(root.querySelector<HTMLElement>('[data-account-signed-in]')!.hidden).toBe(false);
      expect(root.querySelector<HTMLElement>('[data-account-signed-out]')!.hidden).toBe(true);
      button.click();
      expect(document.activeElement?.textContent?.trim()).toBe('Manage account');
    });

    it('shows the email as the name and hides the email line when there is no name', async () => {
      const { root, ready } = await setup(
        { ...base, sessionUrl },
        { fetch: async () => new Response(JSON.stringify({ user: { email: 'k@x.io' } })) },
      );
      await ready;
      expect(root.querySelector('[data-account-initial]')!.textContent).toBe('K');
      expect(root.querySelector('[data-account-name]')!.textContent).toBe('k@x.io');
      expect(root.querySelector<HTMLElement>('[data-account-email]')!.hidden).toBe(true);
    });

    it('stays signed out when there is no session', async () => {
      const { root, button, ready } = await setup({ ...base, sessionUrl });
      await ready;
      expect(root.dataset.state).toBe('signed-out');
      expect(button.getAttribute('aria-label')).toBe('Sign in menu');
      expect(root.querySelector<HTMLElement>('[data-account-signed-in]')!.hidden).toBe(true);
    });

    it('stays signed out when the request fails', async () => {
      const { root, ready } = await setup(
        { ...base, sessionUrl },
        {
          fetch: async () => {
            throw new TypeError('Failed to fetch');
          },
        },
      );
      await ready;
      expect(root.dataset.state).toBe('signed-out');
    });
  });

  it('keeps the behaviour free of inline styles and HTML strings', () => {
    const source = readFileSync('src/lib/account.ts', 'utf8');
    expect(source).not.toContain('.style');
    expect(source).not.toContain('innerHTML');
    expect(source).not.toContain("setAttribute('on");
  });
});
