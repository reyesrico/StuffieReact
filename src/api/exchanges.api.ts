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
    { ...data, status: 'pending' }
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
 * Accept an exchange request — changes status to 'accepted'
 */
export const acceptExchangeRequest = async (_id: string): Promise<void> => {
  await apiClient.patch(exchangeEndpoints.update(_id), { status: 'accepted' });
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

/**
 * Complete an exchange — triggers ownership swap on the backend
 */
export const completeExchangeRequest = async (_id: string): Promise<void> => {
  await apiClient.post(`exchange_requests/${_id}/complete`, {});
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
