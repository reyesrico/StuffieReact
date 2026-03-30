import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { uniq } from 'lodash';

import { getUsersByIds } from '../../api/users.api';
import { getProductsByIds } from '../../api/products.api';
import type User from '../../components/types/User';
import type ProductType from '../../components/types/Product';
import {
  useFriends,
  useExchangeRequests,
  useLoanRequests,
  usePurchaseRequests,
  useFriendRequests,
} from './index';

export const useNotifications = () => {
  const { data: friends = [], isLoading: friendsLoading } = useFriends();
  const { data: exchangeRequests = [], isLoading: exchangeLoading } = useExchangeRequests();
  const { data: loanRequests = [], isLoading: loanLoading } = useLoanRequests();
  const { data: purchaseRequests = [], isLoading: purchaseLoading } = usePurchaseRequests();
  const { data: rawFriendRequests = [], isLoading: friendReqLoading } = useFriendRequests();

  // Resolved User objects for friend requests (secondary fetch)
  const friendUserIds = rawFriendRequests.map((r: any) => r.id_friend as number);
  const { data: resolvedFriendUsers = [], isLoading: friendUsersLoading } = useQuery<User[]>({
    queryKey: ['friendRequestUsers', friendUserIds],
    queryFn: () => getUsersByIds(friendUserIds.map(id => ({ id }))) as Promise<User[]>,
    enabled: friendUserIds.length > 0,
  });

  // Local mirror for optimistic removal after accept/reject
  const [friendRequests, setFriendRequests] = useState<User[]>(resolvedFriendUsers);
  useEffect(() => {
    setFriendRequests(resolvedFriendUsers);
  }, [resolvedFriendUsers]);

  const removeFriendRequest = (id: number) => {
    setFriendRequests(prev => prev.filter(f => f.id !== id));
  };

  // Products needed to render exchange/loan/purchase request rows
  const productIds = uniq([
    ...loanRequests.map((r: any) => r.id_stuff as number),
    ...exchangeRequests.map((r: any) => r.id_stuff as number),
    ...exchangeRequests.map((r: any) => r.id_friend_stuff as number),
    ...purchaseRequests.map((r: any) => r.id_stuff as number),
  ]).filter(Boolean);

  const { data: requestedProducts = [], isLoading: productsLoading } = useQuery<ProductType[]>({
    queryKey: ['notificationProducts', productIds],
    queryFn: () => getProductsByIds(productIds.map(id => ({ id }))) as Promise<ProductType[]>,
    enabled: productIds.length > 0,
  });

  const isLoading =
    friendsLoading ||
    exchangeLoading ||
    loanLoading ||
    purchaseLoading ||
    friendReqLoading ||
    (friendUserIds.length > 0 && friendUsersLoading) ||
    (productIds.length > 0 && productsLoading);

  const totalRequests =
    exchangeRequests.length +
    loanRequests.length +
    purchaseRequests.length +
    rawFriendRequests.length;

  return {
    isLoading,
    friends,
    exchangeRequests,
    loanRequests,
    purchaseRequests,
    friendRequests,
    requestedProducts,
    totalRequests,
    removeFriendRequest,
  };
};
