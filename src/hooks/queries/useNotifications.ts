import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
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
  useSentFriendRequests,
} from './index';
import type Friendship from '../../components/types/Friendship';

export const useNotifications = () => {
  const { data: friends = [], isLoading: friendsLoading } = useFriends();
  const { data: exchangeRequests = [], isLoading: exchangeLoading } = useExchangeRequests();
  const { data: loanRequests = [], isLoading: loanLoading } = useLoanRequests();
  const { data: purchaseRequests = [], isLoading: purchaseLoading } = usePurchaseRequests();
  const { data: rawFriendRequests = [], isLoading: friendReqLoading } = useFriendRequests();
  const { data: rawSentRequests = [], isLoading: sentReqLoading } = useSentFriendRequests();

  // Memoize id arrays so query keys are stable across renders
  const friendUserIds = useMemo(
    () => rawFriendRequests.map((r: any) => r.friend_id as number),
    [rawFriendRequests]
  );
  const sentTargetIds = useMemo(
    () => rawSentRequests.map((r: Friendship) => r.user_id),
    [rawSentRequests]
  );

  const { data: resolvedFriendUsers = [], isLoading: friendUsersLoading } = useQuery<User[]>({
    queryKey: ['friendRequestUsers', friendUserIds],
    queryFn: () => getUsersByIds(friendUserIds.map(id => ({ id }))) as Promise<User[]>,
    enabled: friendUserIds.length > 0,
  });

  const { data: resolvedSentTargets = [], isLoading: sentTargetsLoading } = useQuery<User[]>({
    queryKey: ['sentRequestTargets', sentTargetIds],
    queryFn: () => getUsersByIds(sentTargetIds.map(id => ({ id }))) as Promise<User[]>,
    enabled: sentTargetIds.length > 0,
  });

  // Local mirror for optimistic removal after accept/reject
  // Derived directly — no useEffect setState loop
  const [removedIds, setRemovedIds] = useState<number[]>([]);
  const friendRequests = useMemo(
    () => resolvedFriendUsers.filter((u: User) => !removedIds.includes(u.id!)),
    [resolvedFriendUsers, removedIds]
  );

  const removeFriendRequest = (id: number) => {
    setRemovedIds(prev => [...prev, id]);
  };

  // Products needed to render exchange/loan/purchase request rows
  const productIds = useMemo(() => uniq([
    ...loanRequests.map((r: any) => r.id_stuff as number),
    ...exchangeRequests.map((r: any) => r.id_stuff as number),
    ...exchangeRequests.map((r: any) => r.id_friend_stuff as number),
    ...purchaseRequests.map((r: any) => r.id_stuff as number),
  ]).filter(Boolean), [loanRequests, exchangeRequests, purchaseRequests]);

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
    sentReqLoading ||
    (friendUserIds.length > 0 && friendUsersLoading) ||
    (sentTargetIds.length > 0 && sentTargetsLoading) ||
    (productIds.length > 0 && productsLoading);

  const totalRequests =
    exchangeRequests.filter((r: any) => ['pending', 'accepted'].includes(r.status)).length +
    loanRequests.filter((r: any) => ['pending', 'active', 'return_requested'].includes(r.status)).length +
    purchaseRequests.filter((r: any) => ['pending', 'accepted'].includes(r.status)).length +
    friendRequests.length +        // filtered (optimistic)
    rawSentRequests.length;

  return {
    isLoading,
    friends,
    exchangeRequests,
    loanRequests,
    purchaseRequests,
    friendRequests,
    sentFriendRequests: resolvedSentTargets,
    rawSentRequests,
    requestedProducts,
    totalRequests,
    removeFriendRequest,
  };
};
