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
 * Friend suggestions — people you might know via mutual friends.
 * Fires up to 8 parallel queries (one per friend) to load friends-of-friends,
 * then computes candidates not already in the user's friend list.
 */
export const useFriendSuggestions = () => {
  const { user } = useContext(UserContext);
  const { data: myFriends = [] } = useFriends();

  const myFriendIds = new Set((myFriends as User[]).map((f: User) => f.id));
  const friendsToQuery = (myFriends as User[]).slice(0, 8);

  const results = useQueries({
    queries: friendsToQuery.map((friend: User) => ({
      queryKey: ['friendsOf', friend.id],
      queryFn: () => getFriends(friend.id!),
      enabled: !!friend.id && !!user?.id,
      staleTime: 1000 * 60 * 10,
    })),
  });

  const suggestionsMap = new Map<number, { user: User; mutualCount: number }>();
  results.forEach((result) => {
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

  const suggestions = Array.from(suggestionsMap.values())
    .sort((a, b) => b.mutualCount - a.mutualCount)
    .slice(0, 5);

  return { suggestions, isLoading: results.some(r => r.isLoading) };
};
