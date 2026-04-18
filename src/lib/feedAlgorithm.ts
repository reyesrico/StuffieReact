/**
 * Stuffie Feed Ranking Algorithm
 *
 * Converts a flat list of friends' products into a scored, diverse feed.
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  SCORE FORMULA  (max = 100)                                             │
 * │                                                                         │
 * │  score = recencyScore + imageScore + priceScore + affinityScore         │
 * │                                                                         │
 * │  recencyScore  = 40 × 2^(−ageDays / 14)    [0–40]  exponential decay  │
 * │  imageScore    = 20  if product.image_key   [0 or 20]                  │
 * │  priceScore    = 15  if product.cost > 0    [0 or 15]                  │
 * │  affinityScore = 25  if user owns same cat  [0 or 25]                  │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  DIVERSITY PASS  (after sorting by score desc)                          │
 * │                                                                         │
 * │  MAX_PER_FRIEND   = 3   (no single friend monopolises the feed)         │
 * │  MAX_PER_CATEGORY = 2   (variety of categories)                         │
 * │  FEED_SIZE        = 30  (hard cap)                                      │
 * │                                                                         │
 * │  Items excluded by diversity are appended as overflow (fill-slots)      │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * Inspired by:
 *  • Facebook News Feed: multi-signal scoring + diversity passes
 *  • Pinterest:          image quality + category interest matching
 *  • Amazon:             "owns same category" affinity
 *  • Twitter/X:          strong recency signal
 */

import type Product from '../components/types/Product';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface FeedItemInput {
  friend_id: number;
  friend_firstName: string;
  friend_lastName: string;
  product: Product;
  date: string;
}

export interface ScoreBreakdown {
  /** 0–40: exponential decay, half-life 14 days */
  recency: number;
  /** 0 or 20: product has an image */
  hasImage: number;
  /** 0 or 15: product has a listed price (Buy action available) */
  hasPrice: number;
  /** 0 or 25: user already owns products in the same category */
  categoryAffinity: number;
}

export interface ScoredFeedItem extends FeedItemInput {
  /** Composite score 0–100 */
  score: number;
  /** Breakdown for debugging / transparency */
  scoreBreakdown: ScoreBreakdown;
}

// ── Constants ─────────────────────────────────────────────────────────────────

/** Scoring weights.  Sum of max values = 100. */
export const FEED_WEIGHTS = {
  /** Maximum recency score (product added right now) */
  RECENCY_MAX: 40,
  /** Days at which recency score halves (exponential decay half-life) */
  RECENCY_HALF_LIFE_DAYS: 14,
  /** Bonus when product has an image attached */
  HAS_IMAGE: 20,
  /** Bonus when product has a listed price (makes Buy action available) */
  HAS_PRICE: 15,
  /** Bonus when user owns at least one product in the same category */
  CATEGORY_AFFINITY: 25,
} as const;

/** Diversity and size limits */
export const FEED_LIMITS = {
  /** Max items from the same friend in the final feed */
  MAX_PER_FRIEND: 3,
  /** Max items from the same category in the final feed */
  MAX_PER_CATEGORY: 2,
  /** Hard cap on total feed size */
  FEED_SIZE: 30,
} as const;

// ── Scoring functions ─────────────────────────────────────────────────────────

/**
 * Recency score using exponential decay:
 *   score = RECENCY_MAX × 2^(−ageDays / HALF_LIFE)
 *
 * Decay examples:
 *   0 days   → 40.0
 *   14 days  → 20.0
 *   28 days  → 10.0
 *   56 days  →  5.0
 *   90 days  →  1.8
 *
 * @param dateString  ISO date string (product._created or product.created_at)
 * @param now         Override "now" in milliseconds (useful for unit tests)
 */
export function computeRecencyScore(
  dateString: string | undefined,
  now = Date.now(),
): number {
  if (!dateString) return 0;
  const ageMs = now - new Date(dateString).getTime();
  if (ageMs < 0) return FEED_WEIGHTS.RECENCY_MAX; // future-dated → max score
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  return FEED_WEIGHTS.RECENCY_MAX * Math.pow(2, -ageDays / FEED_WEIGHTS.RECENCY_HALF_LIFE_DAYS);
}

/**
 * Score a single feed item given the current user's owned category IDs.
 *
 * @param item            Raw feed item
 * @param userCategoryIds Set of category_ids the logged-in user owns products in
 * @param now             Override "now" (useful for unit tests)
 */
export function scoreItem(
  item: FeedItemInput,
  userCategoryIds: Set<number>,
  now = Date.now(),
): ScoredFeedItem {
  const p = item.product;
  const dateString = p._created ?? p.created_at;

  const recency = computeRecencyScore(dateString, now);
  const hasImage = p.image_key ? FEED_WEIGHTS.HAS_IMAGE : 0;
  const hasPrice = (p.cost ?? 0) > 0 ? FEED_WEIGHTS.HAS_PRICE : 0;
  const categoryAffinity = userCategoryIds.has(p.category_id ?? -1)
    ? FEED_WEIGHTS.CATEGORY_AFFINITY
    : 0;

  return {
    ...item,
    score: recency + hasImage + hasPrice + categoryAffinity,
    scoreBreakdown: { recency, hasImage, hasPrice, categoryAffinity },
  };
}

/**
 * Flatten friends' product arrays into a list of raw FeedItemInputs.
 */
export function buildFeedItems(
  friends: Array<{
    id?: number;
    first_name?: string;
    last_name?: string;
    products?: Product[];
  }>,
): FeedItemInput[] {
  const items: FeedItemInput[] = [];
  for (const friend of friends) {
    if (!friend.id || !friend.products?.length) continue;
    for (const product of friend.products) {
      items.push({
        friend_id: friend.id,
        friend_firstName: friend.first_name ?? '',
        friend_lastName: friend.last_name ?? '',
        product,
        date: product._created ?? product.created_at ?? '',
      });
    }
  }
  return items;
}

/**
 * Diversity pass: cap items per friend and per category.
 *
 * Items that exceed the per-friend or per-category cap are collected as
 * overflow and appended after the primary selection to fill remaining slots.
 * This ensures the feed is never sparse when there are few friends.
 *
 * @param scored  Items already sorted by score (descending)
 */
export function applyDiversityPass(scored: ScoredFeedItem[]): ScoredFeedItem[] {
  const friendCount: Record<number, number> = {};
  const categoryCount: Record<number, number> = {};
  const primary: ScoredFeedItem[] = [];
  const overflow: ScoredFeedItem[] = [];

  for (const item of scored) {
    const fid = item.friend_id;
    const cid = item.product.category_id ?? -1;
    const fc = friendCount[fid] ?? 0;
    const cc = categoryCount[cid] ?? 0;

    if (fc < FEED_LIMITS.MAX_PER_FRIEND && cc < FEED_LIMITS.MAX_PER_CATEGORY) {
      primary.push(item);
      friendCount[fid] = fc + 1;
      categoryCount[cid] = cc + 1;
    } else {
      overflow.push(item);
    }
  }

  // Fill remaining slots with overflow (maintains relative score order)
  const result = [...primary];
  for (const item of overflow) {
    if (result.length >= FEED_LIMITS.FEED_SIZE) break;
    result.push(item);
  }

  return result.slice(0, FEED_LIMITS.FEED_SIZE);
}

/**
 * Full feed ranking pipeline.
 *
 * Pipeline:
 *   1. Flatten friends' products into raw items
 *   2. Score each item (recency + image + price + affinity)
 *   3. Sort by score descending (best first)
 *   4. Apply diversity pass (cap per-friend + per-category)
 *   5. Return up to FEED_SIZE items
 *
 * @param friends           Friends array (each must have `.products`)
 * @param userCategoryIds   Set of category IDs the current user owns items in
 * @param now               Override "now" in ms (useful for unit tests)
 */
export function rankFeed(
  friends: Array<{
    id?: number;
    first_name?: string;
    last_name?: string;
    products?: Product[];
  }>,
  userCategoryIds: Set<number> = new Set(),
  now = Date.now(),
): ScoredFeedItem[] {
  const items = buildFeedItems(friends);
  const scored = items.map(item => scoreItem(item, userCategoryIds, now));
  scored.sort((a, b) => b.score - a.score);
  return applyDiversityPass(scored);
}
