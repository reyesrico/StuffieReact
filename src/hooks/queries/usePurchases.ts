/**
 * usePurchases - Query hook for purchase requests
 */
import { useQuery } from '@tanstack/react-query';
import { useContext } from 'react';
import { queryKeys } from './queryKeys';
import { getPurchaseRequests } from '../../api/purchases.api';
import UserContext from '../../context/UserContext';
import type PurchaseRequest from '../../components/types/PurchaseRequest';

/**
 * Fetch all purchase requests for the user (both sent and received)
 *
 * @example
 * const { data: purchases, isLoading } = usePurchaseRequests();
 */
export const usePurchaseRequests = () => {
  const { user } = useContext(UserContext);

  return useQuery<PurchaseRequest[]>({
    queryKey: queryKeys.purchases.all(user?.id || 0),
    queryFn: () => getPurchaseRequests(user!.id!),
    enabled: !!user?.id,
  });
};
