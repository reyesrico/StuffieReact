/**
 * UserContext — JWT refresh tests
 * File lives in src/context/ so all paths are relative to that directory.
 *
 * Covers:
 * 1. Expired token on mount → session cleared, user stays null
 * 2. Token > 5 min from expiry → no fetch call after 60s
 * 3. Token < 5 min from expiry → fetch POST /auth/refresh called
 * 4. Refresh success → new token stored in localStorage, user stays logged in
 * 5. Refresh network error → user logged out, session cleared
 * 6. Refresh non-ok response → user logged out, session cleared
 */
import React, { useContext } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import UserContextObj, { UserProvider } from './UserContext';

// Mock QueryProvider (imported by UserContext for queryClient.clear)
vi.mock('./QueryProvider', () => ({
  queryClient: { clear: vi.fn() },
}));

// ---------------------------------------------------------------------------
// fetch mock
// ---------------------------------------------------------------------------
const mockFetch = vi.fn();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const now = () => Math.floor(Date.now() / 1000);

const storeSession = (expiresAt: number, token = 'test-tok') => {
  localStorage.setItem('stuffie-session', JSON.stringify({
    accessToken: token,
    expiresAt,
    refreshToken: 'refresh-tok',
    refreshExpiresAt: expiresAt + 6 * 24 * 3600, // refresh valid for 7 days from now
  }));
  localStorage.setItem('stuffie-user', JSON.stringify({ id: 1, email: 'a@stuffie.net' }));
};

const sessionInStorage = () => {
  const raw = localStorage.getItem('stuffie-session');
  return raw ? JSON.parse(raw) : null;
};

const hookWrapper = ({ children }: { children: React.ReactNode }) => (
  <UserProvider>{children}</UserProvider>
);

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('UserContext JWT refresh', () => {
  beforeEach(() => {
    // Only fake timers we need; leaving queueMicrotask live keeps React 18's
    // scheduler from deadlocking inside act().
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] });
    localStorage.clear();
    mockFetch.mockReset();
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('clears session from localStorage when token is already expired on mount', async () => {
    // Store a session where the REFRESH token is also expired
    const pastExpiry = now() - 60;
    localStorage.setItem('stuffie-session', JSON.stringify({
      accessToken: 'old-tok',
      expiresAt:        pastExpiry,
      refreshToken:     'old-refresh',
      refreshExpiresAt: pastExpiry, // refresh also expired
    }));
    localStorage.setItem('stuffie-user', JSON.stringify({ id: 1, email: 'a@stuffie.net' }));

    renderHook(() => useContext(UserContextObj), { wrapper: hookWrapper });
    // Flush React 18 effects (mount useEffect runs here)
    await act(async () => {});

    expect(localStorage.getItem('stuffie-session')).toBeNull();
    expect(localStorage.getItem('stuffie-user')).toBeNull();
  });

  it('does not call fetch when token has plenty of time left', async () => {
    storeSession(now() + 3600); // 1 hour — well outside the 5-min window

    renderHook(() => useContext(UserContextObj), { wrapper: hookWrapper });

    await vi.advanceTimersByTimeAsync(60_000);

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('calls POST /auth/refresh when fewer than 5 minutes remain', async () => {
    storeSession(now() + 200); // ~3 min left on access token; refresh token valid for 7 days

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        accessToken: 'new-tok',
        expiresAt: now() + 3600,
        refreshToken: 'new-refresh-tok',
        refreshExpiresAt: now() + 7 * 24 * 3600,
      }),
    });

    renderHook(() => useContext(UserContextObj), { wrapper: hookWrapper });

    await vi.advanceTimersByTimeAsync(60_000);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('auth/refresh'),
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('stores the new token in localStorage after a successful refresh', async () => {
    storeSession(now() + 200);
    const newExpiry = now() + 3600;
    const newRefreshExpiry = now() + 7 * 24 * 3600;

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        accessToken: 'refreshed-tok',
        expiresAt: newExpiry,
        refreshToken: 'new-refresh-tok',
        refreshExpiresAt: newRefreshExpiry,
      }),
    });

    renderHook(() => useContext(UserContextObj), { wrapper: hookWrapper });

    await vi.advanceTimersByTimeAsync(60_000);

    const session = sessionInStorage();
    expect(session?.accessToken).toBe('refreshed-tok');
    expect(session?.expiresAt).toBe(newExpiry);
    expect(session?.refreshToken).toBe('new-refresh-tok');
    expect(session?.refreshExpiresAt).toBe(newRefreshExpiry);
  });

  it('logs the user out when refresh fetch throws a network error', async () => {
    storeSession(now() + 200);
    mockFetch.mockRejectedValueOnce(new Error('network'));

    const { result } = renderHook(() => useContext(UserContextObj), { wrapper: hookWrapper });

    await act(async () => { await vi.advanceTimersByTimeAsync(60_000); });

    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('stuffie-session')).toBeNull();
  });

  it('logs the user out when the refresh response is not ok', async () => {
    storeSession(now() + 200);
    mockFetch.mockResolvedValueOnce({ ok: false, json: async () => ({}) });

    const { result } = renderHook(() => useContext(UserContextObj), { wrapper: hookWrapper });

    await act(async () => { await vi.advanceTimersByTimeAsync(60_000); });

    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('stuffie-session')).toBeNull();
  });
});
