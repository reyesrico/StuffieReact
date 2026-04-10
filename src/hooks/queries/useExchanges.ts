/**
 * useExchanges - Query hook for exchange requests
 * 
 * Replaces Redux: fetchExchangeRequests, fetchExchangeRequestsHook, fetchExchangeRequestsHookWithExchanges
 */
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useContext } from 'react';
import { queryKeys } from './queryKeys';
import { getExchangeRequests } from '../../api/exchanges.api';
import UserContext from '../../context/UserContext';
import type ExchangeRequest from '../../components/types/ExchangeRequest';

/**
 * Fetch all exchange requests for the user (both sent and received)
 * 
 * @example
 * const { data: exchanges, isLoading } = useExchangeRequests();
 */
export const useExchangeRequests = () => {
  const { user } = useContext(UserContext);
  
  return useQuery({
    queryKey: queryKeys.exchanges.all(user?.id || 0),
    queryFn: () => getExchangeRequests(user!.id!),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2, // 2 min — live social: new requests arrive without warning
    refetchOnMount: true,
  });
};

/**
 * Hook to get exchange requests from cache
 */
export const useGetExchangeRequestsData = () => {
  const queryClient = useQueryClient();
  const { user } = useContext(UserContext);
  
  return (): ExchangeRequest[] | undefined => {
    return queryClient.getQueryData(queryKeys.exchanges.all(user?.id || 0));
  };
};

/**
 * Hook to invalidate exchange requests cache
 */
export const useInvalidateExchangeRequests = () => {
  const queryClient = useQueryClient();
  const { user } = useContext(UserContext);
  
  return () => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.exchanges.all(user?.id || 0),
    });
  };
};

// Alias for consistency with existing code
export const useExchanges = useExchangeRequests;

export default useExchangeRequests;
