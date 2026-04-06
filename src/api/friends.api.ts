/**
 * Friends API - CRUD operations using the new friendships collection (Stage 7)
 *
 * Schema: { user_id, friend_id, status: 'accepted'|'pending', initiated_by }
 * Both directions stored: A→B and B→A for accepted friendships.
 */
import { apiClient } from './client';
import { friendshipEndpoints, userEndpoints } from './endpoints';
import type User from '../components/types/User';
import type Friendship from '../components/types/Friendship';

// ============ READ - Friends ============

/**
 * Get accepted friends for a user (returns full User objects)
 */
export const getFriends = async (userId: number): Promise<User[]> => {
  const response = await apiClient.get<Friendship[]>(
    friendshipEndpoints.listByUser(userId)
  );
  const accepted = (response.data || []).filter(f => f.status === 'accepted');
  if (accepted.length === 0) return [];

  const ids = accepted.map(f => ({ id: f.friend_id }));
  const users = await apiClient.get<User[]>(userEndpoints.listByIds(ids));
  return users.data || [];
};

/**
 * Get raw friendship records for a user (accepted only)
 */
export const getFriendships = async (userId: number): Promise<Friendship[]> => {
  const response = await apiClient.get<Friendship[]>(
    friendshipEndpoints.listByUser(userId)
  );
  return (response.data || []).filter(f => f.status === 'accepted');
};

// ============ READ - Friend Requests ============

/**
 * Get pending friend requests targeting this user
 */
export const getFriendRequests = async (userId: number): Promise<Friendship[]> => {
  const response = await apiClient.get<Friendship[]>(
    friendshipEndpoints.listPendingForUser(userId)
  );
  return response.data || [];
};

/**
 * Get outgoing pending requests sent by this user
 */
export const getSentFriendRequests = async (userId: number): Promise<Friendship[]> => {
  const response = await apiClient.get<Friendship[]>(
    friendshipEndpoints.listSentByUser(userId)
  );
  return response.data || [];
};

/**
 * Get a specific pending request between two users
 */
export const getFriendRequest = async (
  userId: number,
  requesterId: number
): Promise<Friendship | null> => {
  const response = await apiClient.get<Friendship[]>(
    friendshipEndpoints.get(userId, requesterId)
  );
  return response.data?.[0] || null;
};

// ============ CREATE - Send Friend Request ============

/**
 * Send a friend request (creates one pending record)
 */
export const sendFriendRequest = async (
  targetUserId: number,
  fromUserId: number
): Promise<Friendship> => {
  const response = await apiClient.post<Friendship>(friendshipEndpoints.create(), {
    user_id: targetUserId,
    friend_id: fromUserId,
    status: 'pending',
    initiated_by: fromUserId,
  });
  return response.data;
};

// ============ UPDATE - Accept Friend Request ============

/**
 * Accept a friend request:
 * - Updates the pending record to accepted
 * - Creates the reverse record (so both parties can query by user_id)
 */
export const acceptFriendRequest = async (
  userId: number,
  requesterId: number
): Promise<void> => {
  // Find the pending record targeting this user
  const pending = await getFriendRequest(userId, requesterId) as Friendship & { _id: string };
  if (pending?._id) {
    await apiClient.put(friendshipEndpoints.update(pending._id), {
      ...pending,
      status: 'accepted',
    });
  }

  // Create the reverse record so the requester also sees the friendship
  await apiClient.post<Friendship>(friendshipEndpoints.create(), {
    user_id: requesterId,
    friend_id: userId,
    status: 'accepted',
    initiated_by: requesterId,
  });
};

// ============ DELETE - Reject / Remove ============

/**
 * Reject a friend request — deletes the pending record
 */
export const rejectFriendRequest = async (
  userId: number,
  requesterId: number
): Promise<void> => {
  const pending = await getFriendRequest(userId, requesterId) as Friendship & { _id: string };
  if (pending?._id) {
    await apiClient.delete(friendshipEndpoints.delete(pending._id));
  }
};

/**
 * Cancel a sent friend request — deletes the pending record by its _id
 */
export const cancelFriendRequest = async (requestId: string): Promise<void> => {
  await apiClient.delete(friendshipEndpoints.delete(requestId));
};

/**
 * Remove an accepted friendship — deletes both directions
 */
export const removeFriend = async (userId: number, friendId: number): Promise<void> => {
  const [a, b] = await Promise.all([
    apiClient.get<Friendship[]>(friendshipEndpoints.get(userId, friendId)),
    apiClient.get<Friendship[]>(friendshipEndpoints.get(friendId, userId)),
  ]);
  const toDelete = [
    ...(a.data || []),
    ...(b.data || []),
  ] as (Friendship & { _id: string })[];

  await Promise.all(toDelete.map(r => apiClient.delete(friendshipEndpoints.delete(r._id))));
};

// Export all functions
export const friendsApi = {
  list: getFriends,
  listRaw: getFriendships,
  listRequests: getFriendRequests,
  listSentRequests: getSentFriendRequests,
  getRequest: getFriendRequest,
  sendRequest: sendFriendRequest,
  acceptRequest: acceptFriendRequest,
  rejectRequest: rejectFriendRequest,
  cancelRequest: cancelFriendRequest,
  remove: removeFriend,
};
