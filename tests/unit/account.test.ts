import { describe, expect, it, vi } from 'vitest';
import { accountInitial, parseSession, readSession, signOut } from '../../src/lib/account';

describe('accountInitial', () => {
  it('takes the first letter of the name, upper-cased', () => {
    expect(accountInitial({ name: 'yuseong', email: 'y@example.com' })).toBe('Y');
    expect(accountInitial({ name: '  김유성', email: 'y@example.com' })).toBe('김');
  });

  it('falls back to the first letter of the email', () => {
    expect(accountInitial({ name: '', email: 'claire@example.com' })).toBe('C');
    expect(accountInitial({ name: '   ', email: 'claire@example.com' })).toBe('C');
  });

  it('keeps a character outside the basic plane whole', () => {
    expect(accountInitial({ name: '𝒜da', email: '' })).toBe('𝒜');
  });

  it('upper-cases for the given locale', () => {
    expect(accountInitial({ name: 'ilker', email: '' }, 'tr')).toBe('İ');
  });

  it('is empty when there is nothing to show', () => {
    expect(accountInitial({ name: '', email: '' })).toBe('');
    expect(accountInitial(null)).toBe('');
  });
});

describe('parseSession', () => {
  it('reads the Better Auth get-session shape', () => {
    expect(
      parseSession({
        session: { id: 's1' },
        user: { id: 'u1', name: 'Yuseong', email: 'y@example.com', image: null },
      }),
    ).toEqual({ name: 'Yuseong', email: 'y@example.com' });
  });

  it('treats null, a missing user and junk as signed out', () => {
    expect(parseSession(null)).toBeNull();
    expect(parseSession({})).toBeNull();
    expect(parseSession({ user: null })).toBeNull();
    expect(parseSession({ user: { name: 'x' } })).toBeNull();
    expect(parseSession('signed in')).toBeNull();
  });

  it('accepts a user without a name', () => {
    expect(parseSession({ user: { email: 'y@example.com' } })).toEqual({
      name: '',
      email: 'y@example.com',
    });
  });
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

describe('readSession', () => {
  it('fetches with credentials and returns the user', async () => {
    const fetch = vi.fn(async () => json({ user: { name: 'Yuseong', email: 'y@example.com' } }));
    const user = await readSession('https://api.example.com/auth/get-session', { fetch });
    expect(user).toEqual({ name: 'Yuseong', email: 'y@example.com' });
    const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://api.example.com/auth/get-session');
    expect(init.credentials).toBe('include');
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it('is signed out on a null body, an error status, bad JSON or a network error', async () => {
    expect(await readSession('/s', { fetch: async () => json(null) })).toBeNull();
    expect(await readSession('/s', { fetch: async () => json({ user: {} }, 500) })).toBeNull();
    expect(await readSession('/s', { fetch: async () => new Response('<html>') })).toBeNull();
    expect(
      await readSession('/s', {
        fetch: async () => {
          throw new TypeError('Failed to fetch');
        },
      }),
    ).toBeNull();
  });

  it('gives up after the timeout and aborts the request', async () => {
    let signal: AbortSignal | undefined;
    const fetch = (_url: string, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        signal = init?.signal ?? undefined;
        signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')));
      });
    const started = Date.now();
    expect(await readSession('/s', { fetch, timeout: 30 })).toBeNull();
    expect(Date.now() - started).toBeLessThan(1000);
    expect(signal?.aborted).toBe(true);
  });

  it('waits three seconds by default', async () => {
    vi.useFakeTimers();
    try {
      let aborted = false;
      const fetch = (_url: string, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            aborted = true;
            reject(new DOMException('aborted', 'AbortError'));
          });
        });
      const pending = readSession('/s', { fetch });
      await vi.advanceTimersByTimeAsync(2999);
      expect(aborted).toBe(false);
      await vi.advanceTimersByTimeAsync(1);
      expect(aborted).toBe(true);
      expect(await pending).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('signOut', () => {
  it('posts an empty JSON body with credentials', async () => {
    const fetch = vi.fn(async () => json({ success: true }));
    await signOut('https://api.example.com/auth/sign-out', fetch);
    expect(fetch).toHaveBeenCalledWith('https://api.example.com/auth/sign-out', {
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: '{}',
    });
  });

  it('swallows a network error so the page can still reload', async () => {
    await expect(
      signOut('/out', async () => {
        throw new TypeError('Failed to fetch');
      }),
    ).resolves.toBeUndefined();
  });
});
