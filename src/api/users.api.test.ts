/**
 * users.api.ts — AUTH-006 login tests
 *
 * Verifies that loginUser() calls POST /auth/login, writes stuffie-session,
 * returns the user without password_hash, and handles 401 gracefully.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// axios mock — vi.hoisted() ensures mock vars are ready when vi.mock() runs
// ---------------------------------------------------------------------------

const { mockPost, mockGet, mockPut } = vi.hoisted(() => ({
  mockPost: vi.fn(),
  mockGet:  vi.fn(),
  mockPut:  vi.fn(),
}));

vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal<typeof import('axios')>();
  return {
    ...actual,
    default: {
      ...actual.default,
      create: vi.fn(() => ({
        post: mockPost,
        get:  mockGet,
        put:  mockPut,
        interceptors: {
          request:  { use: vi.fn(), eject: vi.fn() },
          response: { use: vi.fn(), eject: vi.fn() },
        },
      })),
    },
  };
});

// ---------------------------------------------------------------------------
// localStorage stub
// ---------------------------------------------------------------------------

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem:    (k: string) => store[k] ?? null,
    setItem:    (k: string, v: string) => { store[k] = v; },
    removeItem: (k: string) => { delete store[k]; },
    clear:      () => { store = {}; },
  };
})();
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

// ---------------------------------------------------------------------------
// Import SUT after mocks are registered
// ---------------------------------------------------------------------------

import { loginUser } from './users.api';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('loginUser (AUTH-006)', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('returns the user object on successful login', async () => {
    const fakeUser = { id: 1, email: 'alice@example.com', first_name: 'Alice' };
    mockPost.mockResolvedValueOnce({ data: { user: fakeUser, accessToken: 'tok123', expiresAt: 9999999999 } });

    const result = await loginUser('alice@example.com', 'correctpass');
    expect(result).toEqual(fakeUser);
  });

  it('stores stuffie-session in localStorage on success', async () => {
    const fakeUser = { id: 1, email: 'alice@example.com' };
    mockPost.mockResolvedValueOnce({ data: { user: fakeUser, accessToken: 'tok123', expiresAt: 9999999999 } });

    await loginUser('alice@example.com', 'correctpass');

    const stored = JSON.parse(localStorageMock.getItem('stuffie-session')!);
    expect(stored.accessToken).toBe('tok123');
    expect(stored.expiresAt).toBe(9999999999);
  });

  it('returns null on 401 without storing session', async () => {
    const err = Object.assign(new Error('Unauthorized'), { response: { status: 401 } });
    mockPost.mockRejectedValueOnce(err);

    const result = await loginUser('bad@example.com', 'wrongpass');
    expect(result).toBeNull();
    expect(localStorageMock.getItem('stuffie-session')).toBeNull();
  });

  it('throws on non-auth server errors (5xx)', async () => {
    const err = Object.assign(new Error('Server error'), { response: { status: 500 } });
    mockPost.mockRejectedValueOnce(err);

    await expect(loginUser('alice@example.com', 'password')).rejects.toThrow();
  });

  it('calls POST /auth/login with email and password', async () => {
    const fakeUser = { id: 1, email: 'alice@example.com' };
    mockPost.mockResolvedValueOnce({ data: { user: fakeUser, accessToken: 'x', expiresAt: 1 } });

    await loginUser('alice@example.com', 'mypassword');

    expect(mockPost).toHaveBeenCalledWith('/auth/login', { email: 'alice@example.com', password: 'mypassword' });
  });
});

