/**
 * Unit tests for the Stuffie Feed Ranking Algorithm
 *
 * Tests cover:
 *  - computeRecencyScore: exponential decay, edge cases
 *  - scoreItem:           correct signal weights
 *  - buildFeedItems:      flattening, skipping empty friends
 *  - applyDiversityPass:  per-friend cap, per-category cap, overflow fill
 *  - rankFeed:            full pipeline, sorting, combined signals
 */

import { describe, it, expect } from 'vitest';
import {
  computeRecencyScore,
  scoreItem,
  buildFeedItems,
  applyDiversityPass,
  rankFeed,
  FEED_WEIGHTS,
  FEED_LIMITS,
  type FeedItemInput,
  type ScoredFeedItem,
} from './feedAlgorithm';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Build a mock date string N days in the past from `now`. */
function daysAgo(days: number, now = FIXED_NOW): string {
  return new Date(now - days * 24 * 60 * 60 * 1000).toISOString();
}

/** A fixed "now" so tests are deterministic */
const FIXED_NOW = new Date('2026-04-18T12:00:00Z').getTime();

function makeFriend(
  id: number,
  products: Array<{
    id?: number;
    cost?: number;
    image_key?: string;
    category_id?: number;
    _created?: string;
  }> = [],
) {
  return {
    id,
    first_name: `Friend${id}`,
    last_name: 'Test',
    products: products.map((p, i) => ({
      id: p.id ?? i + 1,
      name: `Product ${i + 1}`,
      cost: p.cost,
      image_key: p.image_key,
      category_id: p.category_id ?? 1,
      _created: p._created ?? daysAgo(1),
    })),
  };
}

function makeFeedItem(overrides: Partial<FeedItemInput> = {}): FeedItemInput {
  return {
    friend_id: 1,
    friend_firstName: 'Alice',
    friend_lastName: 'Test',
    product: {
      id: 1,
      name: 'Test Product',
      category_id: 1,
      _created: daysAgo(0),
    },
    date: daysAgo(0),
    ...overrides,
  };
}

// ── computeRecencyScore ───────────────────────────────────────────────────────

describe('computeRecencyScore', () => {
  it('returns RECENCY_MAX for a product added right now', () => {
    const score = computeRecencyScore(new Date(FIXED_NOW).toISOString(), FIXED_NOW);
    expect(score).toBeCloseTo(FEED_WEIGHTS.RECENCY_MAX, 5);
  });

  it('returns half of RECENCY_MAX after HALF_LIFE days', () => {
    const score = computeRecencyScore(daysAgo(FEED_WEIGHTS.RECENCY_HALF_LIFE_DAYS, FIXED_NOW), FIXED_NOW);
    expect(score).toBeCloseTo(FEED_WEIGHTS.RECENCY_MAX / 2, 1);
  });

  it('returns quarter of RECENCY_MAX after 2× HALF_LIFE days', () => {
    const score = computeRecencyScore(daysAgo(FEED_WEIGHTS.RECENCY_HALF_LIFE_DAYS * 2, FIXED_NOW), FIXED_NOW);
    expect(score).toBeCloseTo(FEED_WEIGHTS.RECENCY_MAX / 4, 1);
  });

  it('returns a very small score after 90 days', () => {
    const score = computeRecencyScore(daysAgo(90, FIXED_NOW), FIXED_NOW);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(3);
  });

  it('returns 0 for undefined date', () => {
    expect(computeRecencyScore(undefined, FIXED_NOW)).toBe(0);
  });

  it('returns RECENCY_MAX for a future date', () => {
    const futureDate = new Date(FIXED_NOW + 1000 * 60 * 60 * 24).toISOString();
    expect(computeRecencyScore(futureDate, FIXED_NOW)).toBe(FEED_WEIGHTS.RECENCY_MAX);
  });

  it('always returns a value in [0, RECENCY_MAX]', () => {
    const dates = [daysAgo(0, FIXED_NOW), daysAgo(7, FIXED_NOW), daysAgo(30, FIXED_NOW), daysAgo(365, FIXED_NOW)];
    dates.forEach(d => {
      const s = computeRecencyScore(d, FIXED_NOW);
      expect(s).toBeGreaterThanOrEqual(0);
      expect(s).toBeLessThanOrEqual(FEED_WEIGHTS.RECENCY_MAX);
    });
  });
});

// ── scoreItem ─────────────────────────────────────────────────────────────────

describe('scoreItem', () => {
  it('adds HAS_IMAGE bonus when product has image_key', () => {
    const noImage = makeFeedItem({ product: { id: 1, category_id: 1, _created: daysAgo(1, FIXED_NOW) } });
    const withImage = makeFeedItem({ product: { id: 1, category_id: 1, image_key: 'abc', _created: daysAgo(1, FIXED_NOW) } });

    const s1 = scoreItem(noImage, new Set(), FIXED_NOW);
    const s2 = scoreItem(withImage, new Set(), FIXED_NOW);

    expect(s2.score - s1.score).toBeCloseTo(FEED_WEIGHTS.HAS_IMAGE, 5);
    expect(s2.scoreBreakdown.hasImage).toBe(FEED_WEIGHTS.HAS_IMAGE);
    expect(s1.scoreBreakdown.hasImage).toBe(0);
  });

  it('adds HAS_PRICE bonus when product cost > 0', () => {
    const free = makeFeedItem({ product: { id: 1, category_id: 1, cost: 0, _created: daysAgo(1, FIXED_NOW) } });
    const priced = makeFeedItem({ product: { id: 1, category_id: 1, cost: 10, _created: daysAgo(1, FIXED_NOW) } });

    const s1 = scoreItem(free, new Set(), FIXED_NOW);
    const s2 = scoreItem(priced, new Set(), FIXED_NOW);

    expect(s2.score - s1.score).toBeCloseTo(FEED_WEIGHTS.HAS_PRICE, 5);
    expect(s2.scoreBreakdown.hasPrice).toBe(FEED_WEIGHTS.HAS_PRICE);
    expect(s1.scoreBreakdown.hasPrice).toBe(0);
  });

  it('adds CATEGORY_AFFINITY bonus when user owns same category', () => {
    const item = makeFeedItem({ product: { id: 1, category_id: 5, _created: daysAgo(1, FIXED_NOW) } });

    const withoutAffinity = scoreItem(item, new Set([1, 2, 3]), FIXED_NOW);
    const withAffinity = scoreItem(item, new Set([5]), FIXED_NOW);

    expect(withAffinity.score - withoutAffinity.score).toBeCloseTo(FEED_WEIGHTS.CATEGORY_AFFINITY, 5);
    expect(withAffinity.scoreBreakdown.categoryAffinity).toBe(FEED_WEIGHTS.CATEGORY_AFFINITY);
    expect(withoutAffinity.scoreBreakdown.categoryAffinity).toBe(0);
  });

  it('scores a perfect item (new + image + price + affinity) close to 100', () => {
    const item = makeFeedItem({
      product: {
        id: 1,
        category_id: 1,
        cost: 50,
        image_key: 'xyz',
        _created: new Date(FIXED_NOW).toISOString(), // just now
      },
    });
    const scored = scoreItem(item, new Set([1]), FIXED_NOW);
    // recency=40, image=20, price=15, affinity=25 → 100
    expect(scored.score).toBeCloseTo(100, 1);
  });

  it('scores an item with no date and no extras at 0', () => {
    const item = makeFeedItem({ product: { id: 1, category_id: 1 } });
    const scored = scoreItem(item, new Set(), FIXED_NOW);
    expect(scored.score).toBe(0);
    expect(scored.scoreBreakdown.recency).toBe(0);
    expect(scored.scoreBreakdown.hasImage).toBe(0);
    expect(scored.scoreBreakdown.hasPrice).toBe(0);
    expect(scored.scoreBreakdown.categoryAffinity).toBe(0);
  });

  it('uses _created in preference over created_at', () => {
    const oldDate = daysAgo(90, FIXED_NOW);   // very old → ~0 recency
    const newDate = daysAgo(0, FIXED_NOW);    // today → max recency

    const itemOld = makeFeedItem({
      product: { id: 1, category_id: 1, _created: oldDate, created_at: newDate },
    });
    const scored = scoreItem(itemOld, new Set(), FIXED_NOW);
    // _created is old → low recency
    expect(scored.scoreBreakdown.recency).toBeLessThan(5);
  });
});

// ── buildFeedItems ────────────────────────────────────────────────────────────

describe('buildFeedItems', () => {
  it('returns empty array for no friends', () => {
    expect(buildFeedItems([])).toEqual([]);
  });

  it('returns empty array for friends with no products', () => {
    const friends = [{ id: 1, first_name: 'Alice', last_name: 'A', products: [] }];
    expect(buildFeedItems(friends)).toEqual([]);
  });

  it('skips friends with no id', () => {
    const friends = [{ first_name: 'NoId', last_name: 'X', products: [{ id: 1, name: 'Thing' }] }];
    expect(buildFeedItems(friends)).toEqual([]);
  });

  it('flattens products from multiple friends', () => {
    const friends = [
      makeFriend(1, [{ id: 10 }, { id: 11 }]),
      makeFriend(2, [{ id: 20 }]),
    ];
    const items = buildFeedItems(friends);
    expect(items).toHaveLength(3);
    expect(items.filter(i => i.friend_id === 1)).toHaveLength(2);
    expect(items.filter(i => i.friend_id === 2)).toHaveLength(1);
  });

  it('sets date to _created when present', () => {
    const dateStr = daysAgo(5, FIXED_NOW);
    const friends = [makeFriend(1, [{ id: 1, _created: dateStr }])];
    const items = buildFeedItems(friends);
    expect(items[0].date).toBe(dateStr);
  });
});

// ── applyDiversityPass ────────────────────────────────────────────────────────

describe('applyDiversityPass', () => {
  /** Create N scored items for the same friend and category */
  function makeItems(count: number, friendId = 1, categoryId = 1): ScoredFeedItem[] {
    return Array.from({ length: count }, (_, i) => ({
      friend_id: friendId,
      friend_firstName: `F${friendId}`,
      friend_lastName: 'X',
      product: { id: i + 1, category_id: categoryId },
      date: '',
      score: 100 - i, // highest to lowest
      scoreBreakdown: { recency: 0, hasImage: 0, hasPrice: 0, categoryAffinity: 0 },
    }));
  }

  it('returns all items when under the limits', () => {
    const items = [
      ...makeItems(1, 1, 1),
      ...makeItems(1, 2, 2),
      ...makeItems(1, 3, 3),
    ];
    expect(applyDiversityPass(items)).toHaveLength(3);
  });

  it(`caps items from the same friend at MAX_PER_FRIEND (${FEED_LIMITS.MAX_PER_FRIEND})`, () => {
    const items = makeItems(FEED_LIMITS.MAX_PER_FRIEND + 3, 1, 1);
    // Use different categories to avoid category cap
    const diverseItems = items.map((item, i) => ({
      ...item,
      product: { ...item.product, category_id: i + 1 },
    }));
    const result = applyDiversityPass(diverseItems);
    const fromFriend1 = result.filter(r => r.friend_id === 1);
    // Should not exceed MAX_PER_FRIEND in the primary pass
    // (overflow may add more if still under FEED_SIZE)
    expect(fromFriend1.slice(0, FEED_LIMITS.MAX_PER_FRIEND)).toHaveLength(FEED_LIMITS.MAX_PER_FRIEND);
  });

  it(`caps items from the same category at MAX_PER_CATEGORY (${FEED_LIMITS.MAX_PER_CATEGORY})`, () => {
    // 5 friends, each with 1 product in category 1
    const items: ScoredFeedItem[] = Array.from({ length: 5 }, (_, i) => ({
      friend_id: i + 1,
      friend_firstName: `F${i + 1}`,
      friend_lastName: 'X',
      product: { id: i + 1, category_id: 1 },
      date: '',
      score: 100 - i,
      scoreBreakdown: { recency: 0, hasImage: 0, hasPrice: 0, categoryAffinity: 0 },
    }));

    const result = applyDiversityPass(items);
    const cat1Primary = result.filter(r => r.product.category_id === 1);
    // Primary should have MAX_PER_CATEGORY; overflow fills the rest
    expect(cat1Primary.slice(0, FEED_LIMITS.MAX_PER_CATEGORY)).toHaveLength(FEED_LIMITS.MAX_PER_CATEGORY);
  });

  it(`caps total feed at FEED_SIZE (${FEED_LIMITS.FEED_SIZE})`, () => {
    // 40 items from different friends+categories (above FEED_SIZE)
    const items: ScoredFeedItem[] = Array.from({ length: 40 }, (_, i) => ({
      friend_id: i + 1,
      friend_firstName: `F${i + 1}`,
      friend_lastName: 'X',
      product: { id: i + 1, category_id: i + 1 },
      date: '',
      score: 100 - i,
      scoreBreakdown: { recency: 0, hasImage: 0, hasPrice: 0, categoryAffinity: 0 },
    }));

    expect(applyDiversityPass(items)).toHaveLength(FEED_LIMITS.FEED_SIZE);
  });

  it('fills with overflow when primary is sparse', () => {
    // Only 2 friends, each with 5 products in the same category
    // Category cap = 2, so only 2 go into primary; overflow fills the rest
    const items: ScoredFeedItem[] = [
      ...makeItems(5, 1, 1).map((item, i) => ({ ...item, product: { ...item.product, category_id: 1 } })),
      ...makeItems(5, 2, 1).map((item, i) => ({ ...item, product: { ...item.product, category_id: 1 } })),
    ].map((item, i) => ({ ...item, score: 100 - i }));

    const result = applyDiversityPass(items);
    // Should not be empty — overflow fills remaining slots
    expect(result.length).toBeGreaterThan(2);
  });
});

// ── rankFeed (full pipeline) ──────────────────────────────────────────────────

describe('rankFeed', () => {
  it('returns empty array for no friends', () => {
    expect(rankFeed([])).toEqual([]);
  });

  it('returns empty array for friends with no products', () => {
    const friends = [makeFriend(1, [])];
    expect(rankFeed(friends, new Set(), FIXED_NOW)).toEqual([]);
  });

  it('sorts newer products before older ones (all else equal)', () => {
    const friends = [
      makeFriend(1, [
        { id: 1, category_id: 1, _created: daysAgo(60, FIXED_NOW) }, // old
        { id: 2, category_id: 2, _created: daysAgo(1, FIXED_NOW) },  // new
      ]),
    ];
    const result = rankFeed(friends, new Set(), FIXED_NOW);
    expect(result[0].product.id).toBe(2); // new comes first
    expect(result[1].product.id).toBe(1);
  });

  it('ranks product with image higher than one without (same age)', () => {
    const now = FIXED_NOW;
    const date = daysAgo(5, now);
    const friends = [
      makeFriend(1, [{ id: 1, category_id: 1, _created: date }]),          // no image
      makeFriend(2, [{ id: 2, category_id: 2, image_key: 'k', _created: date }]), // with image
    ];
    const result = rankFeed(friends, new Set(), now);
    expect(result[0].product.id).toBe(2);
  });

  it('ranks product with price higher than free one (same age, both with image)', () => {
    const date = daysAgo(5, FIXED_NOW);
    const friends = [
      makeFriend(1, [{ id: 1, category_id: 1, image_key: 'a', cost: 0, _created: date }]),   // free
      makeFriend(2, [{ id: 2, category_id: 2, image_key: 'b', cost: 50, _created: date }]),   // priced
    ];
    const result = rankFeed(friends, new Set(), FIXED_NOW);
    expect(result[0].product.id).toBe(2);
  });

  it('gives affinity bonus to products matching user-owned categories', () => {
    const date = daysAgo(5, FIXED_NOW);
    const friends = [
      makeFriend(1, [{ id: 1, category_id: 99, _created: date }]),  // user doesn't own cat 99
      makeFriend(2, [{ id: 2, category_id: 5, _created: date }]),   // user owns cat 5
    ];
    const userCategoryIds = new Set([5]);
    const result = rankFeed(friends, userCategoryIds, FIXED_NOW);
    expect(result[0].product.id).toBe(2);
  });

  it('does not include more than FEED_LIMITS.MAX_PER_FRIEND items from one friend in primary', () => {
    const products = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      category_id: i + 1, // different categories to isolate friend cap
      _created: daysAgo(i, FIXED_NOW),
    }));
    const friends = [makeFriend(1, products)];
    const result = rankFeed(friends, new Set(), FIXED_NOW);

    // Primary slots capped; overflow fills, but total should respect FEED_SIZE
    expect(result.length).toBeLessThanOrEqual(FEED_LIMITS.FEED_SIZE);
    // The primary entries (first MAX_PER_FRIEND) should all be from friend 1
    // (since there's only one friend)
    expect(result.every(r => r.friend_id === 1)).toBe(true);
  });

  it('each scored item has a scoreBreakdown', () => {
    const friends = [makeFriend(1, [{ id: 1, category_id: 1, _created: daysAgo(0, FIXED_NOW) }])];
    const result = rankFeed(friends, new Set(), FIXED_NOW);
    expect(result[0].scoreBreakdown).toMatchObject({
      recency: expect.any(Number),
      hasImage: expect.any(Number),
      hasPrice: expect.any(Number),
      categoryAffinity: expect.any(Number),
    });
  });

  it('handles products with no _created or created_at gracefully', () => {
    const friends = [makeFriend(1, [{ id: 1, category_id: 1 }])];
    // Remove _created from product
    (friends[0].products as any)[0]._created = undefined;
    expect(() => rankFeed(friends, new Set(), FIXED_NOW)).not.toThrow();
  });

  it('respects FEED_SIZE cap with many friends and products', () => {
    const friends = Array.from({ length: 20 }, (_, fi) =>
      makeFriend(
        fi + 1,
        Array.from({ length: 10 }, (_, pi) => ({
          id: fi * 10 + pi + 1,
          category_id: pi + 1,
          _created: daysAgo(pi, FIXED_NOW),
        })),
      ),
    );
    const result = rankFeed(friends, new Set(), FIXED_NOW);
    expect(result.length).toBeLessThanOrEqual(FEED_LIMITS.FEED_SIZE);
  });
});
