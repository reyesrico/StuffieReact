/**
 * Friends API - CRUD operations for friends and friend requests
 */
import { apiClient } from './client';
import { friendsEndpoints, friendRequestEndpoints, userEndpoints } from './endpoints';
import type User from '../components/types/User';
import type FriendRequest from '../components/types/FriendRequest';

// ============ Types ============

interface FriendRelation {
  _id?: string;
  email_stuffier: string;
  id_friend: number;
}

// ============ READ - Friends ============

/**
 * Get friends list for a user by email
 * Returns the friend relations (email_stuffier, id_friend)
 */
export const getFriendRelations = async (email: string): Promise<FriendRelation[]> => {
  const response = await apiClient.get<FriendRelation[]>(friendsEndpoints.listByUser(email));
  return response.data;
};

/**
 * Get friends with full user data
 * First gets relations, then fetches user details
 */
export const getFriends = async (email: string): Promise<User[]> => {
  const relations = await getFriendRelations(email);
  
  if (relations.length === 0) return [];
  
  // Map to ids for lookup
  const ids = relations.map(r => ({ id: r.id_friend }));
  
  const response = await apiClient.get<User[]>(userEndpoints.listByIds(ids));
  return response.data || [];
};

// ============ CREATE - Add Friend ============

/**
 * Add a friend relationship (after request is accepted)
 */
export const addFriend = async (email: string, friendId: number): Promise<FriendRelation> => {
  const response = await apiClient.post<FriendRelation>(friendsEndpoints.create(), {
    email_stuffier: email,
    id_friend: friendId,
  });
  return response.data;
};

// ============ DELETE - Remove Friend ============

/**
 * Remove a friend relationship
 */
export const removeFriend = async (_id: string): Promise<void> => {
  await apiClient.delete(friendsEndpoints.delete(_id));
};

// ============ READ - Friend Requests ============

/**
 * Get friend requests sent to a user
 */
export const getFriendRequests = async (email: string): Promise<FriendRequest[]> => {
  const response = await apiClient.get<FriendRequest[]>(
    friendRequestEndpoints.listByUser(email)
  );
  return response.data;
};

/**
 * Get a specific friend request
 */
export const getFriendRequest = async (
  email: string, 
  friendId: number
): Promise<FriendRequest | null> => {
  const response = await apiClient.get<(FriendRequest & { _id: string })[]>(
    friendRequestEndpoints.get(email, friendId)
  );
  return response.data[0] || null;
};

// ============ CREATE - Send Friend Request ============

/**
 * Send a friend request
 */
export const sendFriendRequest = async (
  targetEmail: string, 
  fromUserId: number
): Promise<FriendRequest> => {
  const response = await apiClient.post<FriendRequest>(friendRequestEndpoints.create(), {
    email_stuffier: targetEmail,
    id_friend: fromUserId,
  });
  return response.data;
};

// ============ DELETE - Accept/Reject Friend Request ============

/**
 * Delete a friend request by _id
 * Called when accepting or rejecting
 */
export const deleteFriendRequest = async (_id: string): Promise<void> => {
  await apiClient.delete(friendRequestEndpoints.delete(_id));
};

/**
 * Accept a friend request
 * - Deletes the request
 * - Creates the friend relationship
 */
export const acceptFriendRequest = async (
  email: string, 
  friendId: number
): Promise<FriendRelation> => {
  // First find and delete the request
  const request = await getFriendRequest(email, friendId) as FriendRequest & { _id: string };
  if (request?._id) {
    await deleteFriendRequest(request._id);
  }
  
  // Then add the friend relationship
  return addFriend(email, friendId);
};

/**
 * Reject a friend request
 * Just deletes the request without adding friend
 */
export const rejectFriendRequest = async (
  email: string, 
  friendId: number
): Promise<void> => {
  const request = await getFriendRequest(email, friendId) as FriendRequest & { _id: string };
  if (request?._id) {
    await deleteFriendRequest(request._id);
  }
};

// Export all functions
export const friendsApi = {
  // Friends
  list: getFriends,
  listRelations: getFriendRelations,
  add: addFriend,
  remove: removeFriend,
  
  // Friend Requests
  listRequests: getFriendRequests,
  getRequest: getFriendRequest,
  sendRequest: sendFriendRequest,
  acceptRequest: acceptFriendRequest,
  rejectRequest: rejectFriendRequest,
  deleteRequest: deleteFriendRequest,
};

export default friendsApi;
