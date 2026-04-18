/**
 * useFeed - Query hook for feed posts
 *
 * The feed is generated from friends' products — computed client-side using
 * the Stuffie Feed Ranking Algorithm (src/lib/feedAlgorithm.ts).
 *
 * Algorithm pipeline:
 *   1. Flatten all friends' products
 *   2. Score each item: recency + has_image + has_price + category_affinity
 *   3. Sort by score descending (best first)
 *   4. Diversity pass: max 3/friend, max 2/category, cap at 30
 *
 * See .github/copilot/FEED-ALGORITHM.md for full documentation.
 */
import { useMemo, useContext } from 'react';
import { rankFeed } from '../../lib/feedAlgorithm';
import { useFriendsWithProducts } from './useFriends';
import { useProducts } from './useProducts';
import type ProductsMap from '../../components/types/ProductsMap';
import UserContext from '../../context/UserContext';

/**
 * Returns a ranked, diverse feed of friends' products.
 * Uses the Stuffie Feed Ranking Algorithm for scoring and diversity.
 */
export const useFeed = () => {
  const { user } = useContext(UserContext);
  const { data: friendsWithProducts, isLoading, error } = useFriendsWithProducts();

  // User's own products (ProductsMap keyed by category_id) — used for affinity scoring
  // Only enabled when user is logged in; on error we degrade gracefully (affinity = 0)
  const { data: userProductsMap = {} as ProductsMap } = useProducts();

  const feed = useMemo(() => {
    if (!friendsWithProducts) return [];

    // Derive the set of category IDs the user already owns products in
    const userCategoryIds = new Set<number>(
      Object.keys(userProductsMap).map(Number).filter(n => !Number.isNaN(n))
    );

    return rankFeed(friendsWithProducts, userCategoryIds);
  }, [friendsWithProducts, userProductsMap]);

  return { data: feed, isLoading, error };
};

/**
 * Returns a getter for the current feed data (for non-reactive access).
 */
export const useGetFeedData = () => {
  const { data } = useFeed();
  return () => data;
};

