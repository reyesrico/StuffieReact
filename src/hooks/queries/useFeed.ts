/**
 * useFeed - Query hook for feed posts
 * 
 * The feed is generated from friends' products - it's computed data, not fetched from API.
 * Replaces Redux: fetchFeed, generateFeed
 */
import { useMemo } from 'react';
import { sortBy } from 'lodash';
import { useFriendsWithProducts } from './useFriends';

interface FeedItem {
  friend_id: number;
  friend_firstName: string;
  friend_lastName: string;
  product: any;
  date: string;
}

/**
 * Generate feed from friends with products
 */
const generateFeed = (friends: any[]): FeedItem[] => {
  const feed: FeedItem[] = [];

  friends.forEach(friend => {
    if (friend.products) {
      friend.products.forEach((product: any) => {
        feed.push({
          friend_id: friend.id,
          friend_firstName: friend.first_name || '',
          friend_lastName: friend.last_name || '',
          product,
          date: product._created
        });
      });
    }
  });

  return sortBy(feed, 'date');
};

/**
 * Fetch user's feed - computed from friends' products
 */
export const useFeed = () => {
  const { data: friendsWithProducts, isLoading, error } = useFriendsWithProducts();
  
  const feed = useMemo(() => {
    if (!friendsWithProducts) return [];
    return generateFeed(friendsWithProducts);
  }, [friendsWithProducts]);

  return {
    data: feed,
    isLoading,
    error,
  };
};

/**
 * Hook to get feed data directly (same as useFeed but named for consistency)
 */
export const useGetFeedData = () => {
  const { data } = useFeed();
  return () => data;
};
