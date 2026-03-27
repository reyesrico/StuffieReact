/**
 * useLoans - Query hook for loan requests
 * 
 * Replaces Redux: fetchLoanRequests, fetchLoanRequestsHook, fetchLoanRequestsHookWithLoans
 */
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useContext } from 'react';
import { queryKeys } from './queryKeys';
import { getLoanRequests } from '../../api/loans.api';
import UserContext from '../../context/UserContext';
import type LoanRequest from '../../components/types/LoanRequest';

/**
 * Fetch all loan requests for the user (both sent and received)
 * 
 * @example
 * const { data: loans, isLoading } = useLoanRequests();
 */
export const useLoanRequests = () => {
  const { user } = useContext(UserContext);
  
  return useQuery({
    queryKey: queryKeys.loans.all(user?.id || 0),
    queryFn: () => getLoanRequests(user!.id!),
    enabled: !!user?.id,
  });
};

/**
 * Hook to get loan requests from cache
 */
export const useGetLoanRequestsData = () => {
  const queryClient = useQueryClient();
  const { user } = useContext(UserContext);
  
  return (): LoanRequest[] | undefined => {
    return queryClient.getQueryData(queryKeys.loans.all(user?.id || 0));
  };
};

/**
 * Hook to invalidate loan requests cache
 */
export const useInvalidateLoanRequests = () => {
  const queryClient = useQueryClient();
  const { user } = useContext(UserContext);
  
  return () => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.loans.all(user?.id || 0),
    });
  };
};

// Alias for consistency
export const useLoans = useLoanRequests;

export default useLoanRequests;
