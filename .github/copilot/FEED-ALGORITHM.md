# Stuffie Feed Ranking Algorithm

> **File**: `src/lib/feedAlgorithm.ts`  
> **Tests**: `src/lib/feedAlgorithm.test.ts`  
> **Hook**: `src/hooks/queries/useFeed.ts`  
> **Added**: 2026-04-18 (Week 34)

---

## Problem: What Was Wrong Before

The original `generateFeed` had three critical issues:

| Issue | Impact |
|-------|--------|
| `sortBy(feed, 'date')` — **ascending** | Oldest products appeared first |
| No friend cap | One friend with 50 products flooded the entire feed |
| No scoring | A 2-year-old unnamed item ranked the same as a brand-new priced item with a photo |

---

## Platform Research Summary

| Platform | Primary signal | Diversity mechanism | Quality signal |
|----------|----------------|---------------------|----------------|
| **Facebook News Feed** | Multi-objective ML scoring | Content-type diversity pass | Engagement prediction |
| **Pinterest** | Interest/category matching | Board/category caps | Image quality |
| **Amazon** | Category overlap with purchase history | — | Reviews, price |
| **Twitter/X** | Recency (strong) | Max N from same author | Engagement |

**Stuffie's adaptation**: No ML training data exists yet. We use hand-crafted signals that match Stuffie's product-first, social P2P model — optimised for users who want to *borrow, trade, or buy* things from friends.

---

## Score Formula

$$\text{score} = \underbrace{40 \cdot 2^{-d/14}}_{\text{recency}} + \underbrace{20}_{\text{has image}} + \underbrace{15}_{\text{has price}} + \underbrace{25}_{\text{category affinity}}$$

**Maximum possible score: 100**

### Signal breakdown

| Signal | Weight | Condition |
|--------|--------|-----------|
| **Recency** | 0–40 | Exponential decay: full score today, halves every 14 days |
| **Has image** | 0 or 20 | `product.image_key` is set |
| **Has price** | 0 or 15 | `product.cost > 0` (Buy action will be shown) |
| **Category affinity** | 0 or 25 | User owns at least one product in the same category |

### Recency decay table

| Age | Score |
|-----|-------|
| Today | 40.0 |
| 1 week | 25.4 |
| 2 weeks (half-life) | 20.0 |
| 4 weeks | 10.0 |
| 8 weeks | 5.0 |
| 90 days | 1.8 |

### Score examples

| Product | Age | Image | Price | Affinity | **Total** |
|---------|-----|-------|-------|----------|-----------|
| New guitar for sale (with photo) — you own guitars | 0d | ✓ | ✓ | ✓ | **100** |
| New book for sale (with photo) — different category | 0d | ✓ | ✓ | ✗ | **75** |
| Old jacket (with photo, free) — same category | 60d | ✓ | ✗ | ✓ | **47** |
| Old, no photo, free, different category | 90d | ✗ | ✗ | ✗ | **1.8** |

---

## Diversity Pass

After sorting by score (descending), a single-pass diversity filter is applied:

```
MAX_PER_FRIEND   = 3   → No single friend monopolises the feed
MAX_PER_CATEGORY = 2   → Variety of categories in the feed
FEED_SIZE        = 30  → Hard cap on total items
```

Items that exceed the per-friend or per-category cap go into an **overflow** list. After the primary pass, overflow items fill remaining slots up to `FEED_SIZE`. This ensures the feed is never sparse for users with few friends.

### Diversity pass example

```
Scored list (descending):
  A: friend=1, cat=Electronics, score=90  ← ✓ primary
  B: friend=1, cat=Books,       score=80  ← ✓ primary  (friend1 = 2)
  C: friend=2, cat=Electronics, score=75  ← ✓ primary  (cat=Electronics, count=2)
  D: friend=1, cat=Clothing,    score=70  ← ✓ primary  (friend1 = 3, max reached)
  E: friend=2, cat=Electronics, score=65  ← ✗ overflow (cat=Electronics full)
  F: friend=1, cat=Games,       score=60  ← ✗ overflow (friend1 full)
  G: friend=3, cat=Books,       score=55  ← ✗ overflow (cat=Books full at 2)

Primary = [A, B, C, D]
Overflow fill → [A, B, C, D, E, F, G]  (all within FEED_SIZE=30)
```

---

## Pipeline

```
useFeed()
  │
  ├── useFriendsWithProducts()    [React Query — friends with .products populated]
  │
  ├── useProducts()               [React Query — user's own ProductsMap]
  │   └── Object.keys(map) → Set<categoryId>  (affinity signal)
  │
  └── rankFeed(friends, userCategoryIds)
        │
        ├── buildFeedItems()      [flatten friends[] → FeedItemInput[]]
        │
        ├── scoreItem() × N       [score each item]
        │   ├── computeRecencyScore()
        │   ├── +HAS_IMAGE
        │   ├── +HAS_PRICE
        │   └── +CATEGORY_AFFINITY
        │
        ├── sort by score desc
        │
        └── applyDiversityPass()  [cap per-friend + per-category, overflow fill]
              └── ScoredFeedItem[] (max 30)
```

---

## Data flow

```
API: GET /userproducts/:friendId  ← for each friend
API: GET /userproducts/:userId    ← for affinity (user's own products)
         ↓
   useFriendsWithProducts()    useProducts()
         ↓                          ↓
      friends[].products     Set<categoryId>
              ↘                  ↙
               rankFeed(...)
                    ↓
            ScoredFeedItem[]
                    ↓
            Content.tsx → FeedRow.tsx
```

---

## Constants (configurable in `feedAlgorithm.ts`)

```typescript
FEED_WEIGHTS = {
  RECENCY_MAX:            40,   // max recency score
  RECENCY_HALF_LIFE_DAYS: 14,   // exponential decay half-life
  HAS_IMAGE:              20,
  HAS_PRICE:              15,
  CATEGORY_AFFINITY:      25,
}

FEED_LIMITS = {
  MAX_PER_FRIEND:   3,
  MAX_PER_CATEGORY: 2,
  FEED_SIZE:        30,
}
```

---

## Testing

Run tests:
```bash
npm test -- feedAlgorithm
```

Test coverage:
- `computeRecencyScore` — decay formula, edge cases (undefined, future date)
- `scoreItem` — each signal weight, perfect item = 100, no-date item = 0
- `buildFeedItems` — flatten, skip friends without id, skip empty products
- `applyDiversityPass` — per-friend cap, per-category cap, overflow fill, FEED_SIZE cap
- `rankFeed` — full pipeline, sort order, combined signals, graceful error handling

---

## Future improvements

| Enhancement | Complexity | When |
|-------------|------------|------|
| **Seen/unseen tracking** (don't re-show items) | Medium | When we add a `user_activity` collection |
| **Engagement-based weight tuning** | High | When we track Borrow/Trade/Buy actions |
| **Personalised half-life** per user | High | After engagement data exists |
| **"Freshly added" badge** on FeedRow | Low | Any sprint |
| **Pinned items** (friend highlights a product) | Medium | When `product.pinned` flag is added |
| **Push notifications** on new friend products | High | When push infra is ready |
