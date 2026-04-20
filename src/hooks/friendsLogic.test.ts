/**
 * Option E — Social / Friends logic
 *
 * Tests for:
 *   - relativeTime() helper from FriendPage.tsx
 *   - Friend suggestions fallback strategy (pure logic extracted from useFriendSuggestions)
 */
import { describe, it, expect } from 'vitest';
import type User from '../components/types/User';

// ─── relativeTime (copied from FriendPage.tsx — pure function) ────────────────
// Accepts optional `now` param for deterministic testing
const relativeTime = (dateStr: string | undefined, now = Date.now()): string => {
  if (!dateStr) return '';
  const diff = now - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
};

// ─── Suggestions logic (pure extraction of ranking + fallback) ────────────────

interface Suggestion { user: User; mutualCount: number }

function buildSuggestions(
  currentUserId: number,
  myFriendIds: Set<number>,
  fofLists: User[][],
  allUsers: User[],
  limit = 5,
): Suggestion[] {
  const suggestionsMap = new Map<number, Suggestion>();
  fofLists.forEach(list => {
    list.forEach(candidate => {
      if (!candidate.id) return;
      if (candidate.id === currentUserId) return;
      if (myFriendIds.has(candidate.id)) return;
      const existing = suggestionsMap.get(candidate.id);
      if (existing) {
        existing.mutualCount++;
      } else {
        suggestionsMap.set(candidate.id, { user: candidate, mutualCount: 1 });
      }
    });
  });

  let suggestions = Array.from(suggestionsMap.values())
    .sort((a, b) => b.mutualCount - a.mutualCount)
    .slice(0, limit);

  if (suggestions.length < limit) {
    const existingIds = new Set([...suggestionsMap.keys()]);
    const fallback = allUsers
      .filter(u => {
        if (!u.id) return false;
        if (u.id === currentUserId) return false;
        if (myFriendIds.has(u.id)) return false;
        if (existingIds.has(u.id)) return false;
        return true;
      })
      .slice(0, limit - suggestions.length)
      .map(u => ({ user: u, mutualCount: 0 }));
    suggestions = [...suggestions, ...fallback];
  }
  return suggestions;
}

// ─── relativeTime tests ───────────────────────────────────────────────────────

const FIXED_NOW = new Date('2026-04-19T12:00:00Z').getTime();
const ago = (days: number) => new Date(FIXED_NOW - days * 24 * 60 * 60 * 1000).toISOString();
const rt = (dateStr: string | undefined) => relativeTime(dateStr, FIXED_NOW);

describe('relativeTime (Option E)', () => {
  it('returns empty string for undefined', () => {
    expect(rt(undefined)).toBe('');
  });

  it('returns Today for a date within the same day', () => {
    expect(rt(ago(0))).toBe('Today');
  });

  it('returns Yesterday for exactly 1 day ago', () => {
    expect(rt(ago(1))).toBe('Yesterday');
  });

  it('returns Nd ago for 2–6 days', () => {
    expect(rt(ago(3))).toBe('3d ago');
  });

  it('returns Nw ago for 7–29 days', () => {
    expect(rt(ago(14))).toBe('2w ago');
  });

  it('returns Nmo ago for 30–364 days', () => {
    expect(rt(ago(90))).toBe('3mo ago');
  });

  it('returns Ny ago for 365+ days', () => {
    expect(rt(ago(730))).toBe('2y ago');
  });
});

// ─── Friend suggestions logic tests ──────────────────────────────────────────

const makeUser = (id: number, name = `User${id}`): User =>
  ({ id, first_name: name, last_name: 'Test', email: `user${id}@test.com` } as User);

describe('buildSuggestions (Option E)', () => {
  const ME = 1;
  const MY_FRIENDS = new Set([2, 3]);

  it('excludes current user from suggestions', () => {
    const suggestions = buildSuggestions(ME, MY_FRIENDS, [[makeUser(ME)]], [], 5);
    expect(suggestions.map(s => s.user.id)).not.toContain(ME);
  });

  it('excludes existing friends from suggestions', () => {
    const suggestions = buildSuggestions(ME, MY_FRIENDS, [[makeUser(2), makeUser(3)]], [], 5);
    expect(suggestions).toHaveLength(0);
  });

  it('ranks friend-of-friend by mutual count descending', () => {
    // User 4 appears in 2 friend lists, user 5 in 1
    const fofLists: User[][] = [
      [makeUser(4), makeUser(5)],
      [makeUser(4)],
    ];
    const suggestions = buildSuggestions(ME, MY_FRIENDS, fofLists, [], 5);
    expect(suggestions[0].user.id).toBe(4);
    expect(suggestions[0].mutualCount).toBe(2);
    expect(suggestions[1].user.id).toBe(5);
    expect(suggestions[1].mutualCount).toBe(1);
  });

  it('falls back to allUsers when fof pool is empty', () => {
    const allUsers = [makeUser(10), makeUser(11), makeUser(12)];
    const suggestions = buildSuggestions(ME, MY_FRIENDS, [], allUsers, 5);
    expect(suggestions).toHaveLength(3);
    expect(suggestions.every(s => s.mutualCount === 0)).toBe(true);
  });

  it('fills remaining slots from allUsers when fof pool is sparse', () => {
    const fofLists: User[][] = [[makeUser(4)]];
    const allUsers = [makeUser(4), makeUser(10), makeUser(11), makeUser(12), makeUser(13), makeUser(14)];
    const suggestions = buildSuggestions(ME, MY_FRIENDS, fofLists, allUsers, 5);
    expect(suggestions).toHaveLength(5);
    // user 4 from FoF, then fallbacks (not duplicated, not me, not friends)
    expect(suggestions[0].user.id).toBe(4);
    expect(suggestions[0].mutualCount).toBe(1);
    const fallbackIds = suggestions.slice(1).map(s => s.user.id);
    expect(fallbackIds).not.toContain(4); // no duplicate
  });

  it('respects the limit', () => {
    const allUsers = Array.from({ length: 20 }, (_, i) => makeUser(i + 10));
    const suggestions = buildSuggestions(ME, MY_FRIENDS, [], allUsers, 5);
    expect(suggestions).toHaveLength(5);
  });

  it('excludes allUsers who are already friends', () => {
    const allUsers = [makeUser(2), makeUser(3), makeUser(10)]; // 2,3 are friends
    const suggestions = buildSuggestions(ME, MY_FRIENDS, [], allUsers, 5);
    expect(suggestions).toHaveLength(1);
    expect(suggestions[0].user.id).toBe(10);
  });
});
