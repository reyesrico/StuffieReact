/**
 * Purchases API - CRUD operations for product purchase requests
 *
 * Purchase = User A requests to buy Product X from User B (who set a cost)
 */
import { apiClient } from './client';
import { purchaseEndpoints } from './endpoints';
import type PurchaseRequest from '../components/types/PurchaseRequest';

// ============ READ ============

/**
 * Get all purchase requests for a user (both sent and received)
 */
export const getPurchaseRequests = async (userId: number): Promise<PurchaseRequest[]> => {
  const response = await apiClient.get<PurchaseRequest[]>(
    purchaseEndpoints.listByUser(userId)
  );
  return response.data;
};

// ============ CREATE ============

export interface CreatePurchaseInput {
  id_stuffier: number; // Owner (seller)
  id_stuff: number;    // Product being purchased
  id_friend: number;   // Buyer (current user)
  cost: number;        // Price at time of request
}

/**
 * Create a new purchase request
 */
export const createPurchaseRequest = async (data: CreatePurchaseInput): Promise<PurchaseRequest> => {
  const response = await apiClient.post<PurchaseRequest>(purchaseEndpoints.create(), data);
  return response.data;
};

// ============ DELETE ============

/**
 * Delete a purchase request by _id
 * Used for: cancel, reject, or complete
 */
export const deletePurchaseRequest = async (_id: string): Promise<void> => {
  await apiClient.delete(purchaseEndpoints.delete(_id));
};

/**
 * Accept a purchase request — changes status to 'accepted'
 */
export const acceptPurchaseRequest = async (_id: string): Promise<void> => {
  await apiClient.patch(purchaseEndpoints.update(_id), { status: 'accepted' });
};
