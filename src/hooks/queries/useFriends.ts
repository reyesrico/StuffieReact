/**
 * useFriends - Query hook for friends
 * 
 * Replaces Redux: fetchFriends, fetchFriendsHook, fetchFriendsHookWithFriends, fetchFriendsProducts
 */
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
    staleTime: 0,
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
    staleTime: 0,
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
