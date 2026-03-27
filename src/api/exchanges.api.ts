/**
 * Exchanges API - CRUD operations for product exchange requests
 * 
 * Exchange = User A offers Product X for User B's Product Y
 */
import { apiClient } from './client';
import { exchangeEndpoints } from './endpoints';
import type ExchangeRequest from '../components/types/ExchangeRequest';

// ============ READ ============

/**
 * Get all exchange requests for a user (both sent and received)
 */
export const getExchangeRequests = async (userId: number): Promise<ExchangeRequest[]> => {
  const response = await apiClient.get<ExchangeRequest[]>(
    exchangeEndpoints.listByUser(userId)
  );
  return response.data;
};

// ============ CREATE ============

export interface CreateExchangeInput {
  id_stuffier: number;    // User creating the exchange
  id_stuff: number;       // Product being offered
  id_friend: number;      // Target user
  id_friend_stuff: number; // Product being requested
}

/**
 * Create a new exchange request
 */
export const createExchangeRequest = async (
  data: CreateExchangeInput
): Promise<ExchangeRequest> => {
  const response = await apiClient.post<ExchangeRequest>(
    exchangeEndpoints.create(), 
    data
  );
  return response.data;
};

// ============ DELETE (Accept/Reject/Cancel) ============

/**
 * Delete an exchange request by _id
 * Used for: accept, reject, or cancel
 */
export const deleteExchangeRequest = async (_id: string): Promise<void> => {
  await apiClient.delete(exchangeEndpoints.delete(_id));
};

/**
 * Accept an exchange request
 * In the future, this could also swap ownership in stuffiers_stuff
 * For now, it just deletes the request (UI handles the swap)
 */
export const acceptExchangeRequest = async (_id: string): Promise<void> => {
  // TODO: In future, implement actual product swap logic here
  await deleteExchangeRequest(_id);
};

/**
 * Reject an exchange request
 */
export const rejectExchangeRequest = async (_id: string): Promise<void> => {
  await deleteExchangeRequest(_id);
};

/**
 * Cancel an exchange request (by the requester)
 */
export const cancelExchangeRequest = async (_id: string): Promise<void> => {
  await deleteExchangeRequest(_id);
};

// Export all functions
export const exchangesApi = {
  list: getExchangeRequests,
  create: createExchangeRequest,
  delete: deleteExchangeRequest,
  accept: acceptExchangeRequest,
  reject: rejectExchangeRequest,
  cancel: cancelExchangeRequest,
};

export default exchangesApi;
