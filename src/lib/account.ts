/* Account menu helpers and behaviour (account.stairno.com SDD 7.5). The component renders the
   markup; this module reads the session, signs out and runs the disclosure. */

export interface AccountUser {
  name: string;
  email: string;
}

type Fetch = (url: string, init?: RequestInit) => Promise<Response>;

/** First character of the name, else of the email, upper-cased for the locale. */
export function accountInitial(user: AccountUser | null | undefined, locale?: string): string {
  const source = user?.name.trim() || user?.email.trim() || '';
  const first = Array.from(source)[0] ?? '';
  return first.toLocaleUpperCase(locale);
}

/** Reads a Better Auth get-session body: `{ session, user }` or null. */
export function parseSession(body: unknown): AccountUser | null {
  if (typeof body !== 'object' || body === null) return null;
  const user = (body as { user?: unknown }).user;
  if (typeof user !== 'object' || user === null) return null;
  const { name, email } = user as { name?: unknown; email?: unknown };
  if (typeof email !== 'string' || email === '') return null;
  return { name: typeof name === 'string' ? name : '', email };
}

/** Asks the account API who is signed in. Anything but a user, in time, means signed out. */
export async function readSession(
  url: string,
  { fetch = globalThis.fetch, timeout = 3000 }: { fetch?: Fetch; timeout?: number } = {},
): Promise<AccountUser | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { credentials: 'include', signal: controller.signal });
    if (!response.ok) return null;
    return parseSession(await response.json());
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Ends the session. Errors are swallowed: the caller reloads and the page shows the truth. */
export async function signOut(url: string, fetch: Fetch = globalThis.fetch): Promise<void> {
  try {
    await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: '{}',
    });
  } catch {
    // the reload that follows shows whether the session is still there
  }
}

export interface MountOptions {
  fetch?: Fetch;
  reload?: () => void;
  timeout?: number;
}

/**
 * Wires one rendered `[data-account-menu]`: open and close, Esc, outside click, focus, sign out
 * and, when the element carries `data-session-url`, the browser-side session read. Resolves once
 * the session read (if any) has settled; everything else is wired before the first await.
 */
export async function mountAccountMenu(
  root: HTMLElement,
  options: MountOptions = {},
): Promise<void> {
  const fetch = options.fetch ?? globalThis.fetch.bind(globalThis);
  const reload = options.reload ?? (() => window.location.reload());
  const button = root.querySelector<HTMLButtonElement>('[data-account-button]');
  const card = root.querySelector<HTMLElement>('[data-account-card]');
  if (!button || !card) return;

  const isOpen = () => !card.hidden;

  const focusables = () =>
    Array.from(card.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')).filter(
      (el) => !el.closest('[hidden]'),
    );

  const open = () => {
    card.hidden = false;
    button.setAttribute('aria-expanded', 'true');
    focusables()[0]?.focus();
  };

  const close = (returnFocus: boolean) => {
    if (!isOpen()) return;
    card.hidden = true;
    button.setAttribute('aria-expanded', 'false');
    if (returnFocus) button.focus();
  };

  button.addEventListener('click', () => (isOpen() ? close(false) : open()));

  root.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !isOpen()) return;
    event.preventDefault();
    close(true);
  });

  // An outside click closes the card. Focus goes back to the button unless the click put it
  // somewhere else on purpose (a link or a field).
  document.addEventListener('click', (event) => {
    if (!isOpen() || root.contains(event.target as Node)) return;
    const active = document.activeElement;
    close(!active || active === document.body || root.contains(active));
  });

  // Tabbing out of the card closes it and leaves focus where it went.
  root.addEventListener('focusout', (event) => {
    const next = event.relatedTarget as Node | null;
    if (next && !root.contains(next)) close(false);
  });

  const signOutButton = root.querySelector<HTMLButtonElement>('[data-account-sign-out]');
  const signOutUrl = root.dataset.signOutUrl;
  if (signOutButton && signOutUrl) {
    signOutButton.addEventListener('click', async () => {
      signOutButton.disabled = true;
      await signOut(signOutUrl, fetch);
      reload();
    });
  }

  const sessionUrl = root.dataset.sessionUrl;
  if (!sessionUrl) return;
  const user = await readSession(sessionUrl, { fetch, timeout: options.timeout });
  if (user) showUser(root, user);
}

function showUser(root: HTMLElement, user: AccountUser): void {
  const find = (name: string) => root.querySelector<HTMLElement>(`[data-account-${name}]`);
  const initial = find('initial');
  const icon = find('icon');
  const name = find('name');
  const email = find('email');
  const signedIn = find('signed-in');
  const signedOut = find('signed-out');

  if (initial) {
    initial.textContent = accountInitial(user, root.dataset.locale);
    initial.hidden = false;
  }
  if (icon) icon.hidden = true;
  if (name) name.textContent = user.name.trim() || user.email;
  if (email) {
    email.textContent = user.email;
    email.hidden = user.name.trim() === '';
  }
  if (signedIn) signedIn.hidden = false;
  if (signedOut) signedOut.hidden = true;

  const label = root.dataset.labelSignedIn;
  if (label) root.querySelector('[data-account-button]')?.setAttribute('aria-label', label);
  root.dataset.state = 'signed-in';
}
