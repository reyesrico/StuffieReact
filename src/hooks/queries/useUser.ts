/**
 * useUser - Query hook for user operations
 * 
 * Replaces Redux: fetchUser, fetchUserHook, fetchUserRequests, fetchUserRequestsHookWithUserRequests
 */
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import { getUserByEmail, getPendingUserRequests } from '../../api/users.api';
import type User from '../../components/types/User';

/**
 * Fetch user by email
 * Used for auto-login from localStorage
 * 
 * @example
 * const { data: user, isLoading } = useUserByEmail('user@example.com');
 */
export const useUserByEmail = (email: string) => {
  return useQuery({
    queryKey: queryKeys.user.current(email),
    queryFn: () => getUserByEmail(email),
    enabled: !!email,
    staleTime: 1000 * 60 * 10, // 10 min — user profile is stable; mutations update cache directly
  });
};

/**
 * Fetch pending user registration requests (admin only)
 */
export const useUserRequests = () => {
  return useQuery({
    queryKey: queryKeys.user.requests(),
    queryFn: getPendingUserRequests,
    staleTime: 1000 * 60 * 5, // 5 min — admin data, changes slowly
    refetchOnMount: true,
  });
};

/**
 * Hook to get user data from cache
 */
export const useGetUserData = (email: string) => {
  const queryClient = useQueryClient();
  
  return (): User | undefined => {
    return queryClient.getQueryData(queryKeys.user.current(email));
  };
};

/**
 * Hook to set user data in cache (after login)
 */
export const useSetUserData = () => {
  const queryClient = useQueryClient();
  
  return (user: User) => {
    if (user.email) {
      queryClient.setQueryData(queryKeys.user.current(user.email), user);
    }
  };
};

/**
 * Hook to invalidate user requests cache
 */
export const useInvalidateUserRequests = () => {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.user.requests(),
    });
  };
};

/**
 * Hook to clear all user-related cache (on logout)
 */
export const useClearUserCache = () => {
  const queryClient = useQueryClient();
  
  return (email: string) => {
    // Clear user data
    queryClient.removeQueries({
      queryKey: queryKeys.user.current(email),
    });
    // Clear friends
    queryClient.removeQueries({
      queryKey: queryKeys.friends.all(email),
    });
    // Note: Products are keyed by userId, handled separately
  };
};

export default useUserByEmail;
