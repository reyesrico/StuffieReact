/**
 * crypto.ts — AUTH-005 tests
 *
 * Tests: pbkdf2v2, verifyPbkdf2v2, legacy pbkdf2, SHA256
 * These run in jsdom (vitest default) which has WebCrypto via globalThis.crypto.subtle
 */
import { describe, it, expect } from 'vitest';
import crypto from './crypto';

// ---------------------------------------------------------------------------
// pbkdf2v2 — format, uniqueness, and verify round-trip
// ---------------------------------------------------------------------------

describe('crypto.pbkdf2v2', () => {
  it('returns a v2:hexSalt:hexHash formatted string', async () => {
    const hash = await crypto.pbkdf2v2('mypassword');
    const parts = hash.split(':');
    expect(parts).toHaveLength(3);
    expect(parts[0]).toBe('v2');
    expect(parts[1]).toHaveLength(32); // 16 bytes → 32 hex chars
    expect(parts[2]).toHaveLength(64); // 32-byte SHA-256 → 64 hex chars
  });

  it('generates a different salt on each call (not deterministic)', async () => {
    const h1 = await crypto.pbkdf2v2('same-password');
    const h2 = await crypto.pbkdf2v2('same-password');
    expect(h1).not.toBe(h2); // different random salts
  });
});

// ---------------------------------------------------------------------------
// verifyPbkdf2v2 — correct password, wrong password, malformed input
// ---------------------------------------------------------------------------

describe('crypto.verifyPbkdf2v2', () => {
  it('returns true when password matches stored v2 hash', async () => {
    const stored = await crypto.pbkdf2v2('correct-horse-battery-staple');
    const ok = await crypto.verifyPbkdf2v2('correct-horse-battery-staple', stored);
    expect(ok).toBe(true);
  });

  it('returns false when password is wrong', async () => {
    const stored = await crypto.pbkdf2v2('correct-horse-battery-staple');
    const ok = await crypto.verifyPbkdf2v2('wrong-password', stored);
    expect(ok).toBe(false);
  });

  it('returns false for empty string password', async () => {
    const stored = await crypto.pbkdf2v2('realpassword');
    const ok = await crypto.verifyPbkdf2v2('', stored);
    expect(ok).toBe(false);
  });

  it('returns false for malformed stored hash (missing prefix)', async () => {
    const ok = await crypto.verifyPbkdf2v2('password', 'notav2hash');
    expect(ok).toBe(false);
  });

  it('returns false for malformed stored hash (wrong segment count)', async () => {
    const ok = await crypto.verifyPbkdf2v2('password', 'v2:onlytwoparts');
    expect(ok).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Legacy functions — still present for fallback chain
// ---------------------------------------------------------------------------

describe('crypto.pbkdf2 (legacy)', () => {
  it('returns a 64-char hex string', async () => {
    const h = await crypto.pbkdf2('password', 'user@example.com');
    expect(h).toHaveLength(64);
    expect(h).toMatch(/^[0-9a-f]+$/);
  });

  it('is deterministic with the same inputs', async () => {
    const h1 = await crypto.pbkdf2('password', 'salt');
    const h2 = await crypto.pbkdf2('password', 'salt');
    expect(h1).toBe(h2);
  });

  it('produces different hashes for different salts', async () => {
    const h1 = await crypto.pbkdf2('password', 'email1@example.com');
    const h2 = await crypto.pbkdf2('password', 'email2@example.com');
    expect(h1).not.toBe(h2);
  });
});

describe('crypto.encrypt (SHA256)', () => {
  it('returns a 64-char hex string', () => {
    const h = crypto.encrypt('hello');
    expect(h).toHaveLength(64);
    expect(h).toMatch(/^[0-9a-f]+$/);
  });

  it('is deterministic', () => {
    expect(crypto.encrypt('hello')).toBe(crypto.encrypt('hello'));
  });

  it('different inputs produce different hashes', () => {
    expect(crypto.encrypt('hello')).not.toBe(crypto.encrypt('world'));
  });
});
