/**
 * useAllUsers - Admin-only query hook for all registered users
 */
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import { getUsers } from '../../api/users.api';

/**
 * Fetch all registered users (admin use only).
 * Used in admin charts to show platform stats.
 */
export const useAllUsers = () => {
  return useQuery({
    queryKey: queryKeys.user.all(),
    queryFn: getUsers,
    staleTime: 5 * 60 * 1000, // 5 min
  });
};
