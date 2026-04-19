/**
 * useFriends - Query hook for friends
 * 
 * Replaces Redux: fetchFriends, fetchFriendsHook, fetchFriendsHookWithFriends, fetchFriendsProducts
 */
import { useQuery, useQueryClient, useQueries } from '@tanstack/react-query';
import { useContext } from 'react';
import { queryKeys } from './queryKeys';
import { getFriends, getFriendRequests, getSentFriendRequests } from '../../api/friends.api';
import { getProductsForUsers, getProductsByIds } from '../../api/products.api';
import { getUsers } from '../../api/users.api';
import { getFriendProducts, mapStuff } from '../../components/helpers/StuffHelper';
import UserContext from '../../context/UserContext';
import type User from '../../components/types/User';

/**
 * Fetch user's friends list
 * 
 * @example
 * const { data: friends, isLoading } = useFriends();
 */
export const useFriends = () => {
  const { user } = useContext(UserContext);
  
  return useQuery({
    queryKey: queryKeys.friends.all(user?.email || ''),
    queryFn: () => getFriends(user!.id!),
    enabled: !!(user?.id),
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Fetch friends with their products populated
 * Used in Feed and Exchange views
 */
export const useFriendsWithProducts = () => {
  const { user } = useContext(UserContext);
  const { data: friends } = useFriends();
  
  return useQuery({
    queryKey: queryKeys.friends.withProducts(user?.email || ''),
    queryFn: async (): Promise<User[]> => {
      if (!friends || friends.length === 0) {
        return [];
      }
      
      // Get all user_items for all friends
      const stuffiersList = await getProductsForUsers(
        friends.map(f => ({ user_id: f.id! }))
      );
      
      if (stuffiersList.length === 0) {
        return friends.map(f => ({ ...f, products: [] }));
      }
      
      // Get product details
      const productIds = mapStuff(stuffiersList);
      const products = await getProductsByIds(productIds);
      
      // Map products to friends
      return getFriendProducts(friends, products, stuffiersList);
    },
    enabled: !!(user?.email && friends && friends.length > 0),
    staleTime: 1000 * 60 * 5, // 5 min — social data, friend products change occasionally
  });
};

/**
 * Fetch friend requests for the user
 */
export const useFriendRequests = () => {
  const { user } = useContext(UserContext);
  
  return useQuery({
    queryKey: queryKeys.friends.requests(user?.email || ''),
    queryFn: () => getFriendRequests(user!.id!),
    enabled: !!(user?.id),
    staleTime: 1000 * 30, // 30s — inbox, check on mount but not every render
    refetchOnMount: true,
  });
};

/**
 * Fetch pending friend requests sent BY the user (outgoing)
 */
export const useSentFriendRequests = () => {
  const { user } = useContext(UserContext);

  return useQuery({
    queryKey: [...queryKeys.friends.requests(user?.email || ''), 'sent'],
    queryFn: () => getSentFriendRequests(user!.id!),
    enabled: !!(user?.id),
    staleTime: 1000 * 30, // 30s — inbox
    refetchOnMount: true,
  });
};

/**
 * Hook to get friends data from cache
 */
export const useGetFriendsData = () => {
  const queryClient = useQueryClient();
  const { user } = useContext(UserContext);
  
  return (): User[] | undefined => {
    return queryClient.getQueryData(queryKeys.friends.all(user?.email || ''));
  };
};

/**
 * Hook to invalidate friends cache
 */
export const useInvalidateFriends = () => {
  const queryClient = useQueryClient();
  const { user } = useContext(UserContext);
  
  return () => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.friends.all(user?.email || ''),
    });
    // Also invalidate friends with products
    queryClient.invalidateQueries({
      queryKey: queryKeys.friends.withProducts(user?.email || ''),
    });
  };
};

export default useFriends;

/**
 * Friend suggestions — people you might know.
 * Strategy:
 *   1. Friends-of-friends (mutual connections) — ranked by mutual count.
 *   2. Fallback: any registered user not already a friend, up to 5.
 * Excludes: current user, existing friends, pending sent requests.
 */
export const useFriendSuggestions = () => {
  const { user } = useContext(UserContext);
  const { data: myFriends = [] } = useFriends();

  const myFriendIds = new Set((myFriends as User[]).map((f: User) => f.id));
  const friendsToQuery = (myFriends as User[]).slice(0, 8);

  // Parallel friends-of-friends queries
  const fofResults = useQueries({
    queries: friendsToQuery.map((friend: User) => ({
      queryKey: ['friendsOf', friend.id],
      queryFn: () => getFriends(friend.id!),
      enabled: !!friend.id && !!user?.id,
      staleTime: 1000 * 60 * 10,
    })),
  });

  // All-users fallback
  const { data: allUsers = [] } = useQuery<User[]>({
    queryKey: ['allUsers'],
    queryFn: getUsers,
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5,
  });

  // Build friends-of-friends ranked map
  const suggestionsMap = new Map<number, { user: User; mutualCount: number }>();
  fofResults.forEach((result) => {
    if (!result.data) return;
    (result.data as User[]).forEach((candidate: User) => {
      if (!candidate.id) return;
      if (candidate.id === user?.id) return;
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
    .slice(0, 5);

  // Fallback: fill up to 5 from all registered users if friend-of-friend pool is sparse
  if (suggestions.length < 5) {
    const existingIds = new Set([...suggestionsMap.keys()]);
    const fallback = (allUsers as User[])
      .filter((u: User) => {
        if (!u.id) return false;
        if (u.id === user?.id) return false;
        if (myFriendIds.has(u.id)) return false;
        if (existingIds.has(u.id)) return false;
        return true;
      })
      .slice(0, 5 - suggestions.length)
      .map((u: User) => ({ user: u, mutualCount: 0 }));
    suggestions = [...suggestions, ...fallback];
  }

  const isLoading = fofResults.some(r => r.isLoading);
  return { suggestions, isLoading };
};
