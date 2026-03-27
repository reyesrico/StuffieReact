/**
 * Loans API - CRUD operations for product loan requests
 * 
 * Loan = User A requests to borrow Product X from User B
 */
import { apiClient } from './client';
import { loanEndpoints } from './endpoints';
import type LoanRequest from '../components/types/LoanRequest';

// ============ READ ============

/**
 * Get all loan requests for a user (both sent and received)
 */
export const getLoanRequests = async (userId: number): Promise<LoanRequest[]> => {
  const response = await apiClient.get<LoanRequest[]>(
    loanEndpoints.listByUser(userId)
  );
  return response.data;
};

// ============ CREATE ============

export interface CreateLoanInput {
  id_stuffier: number;  // User requesting the loan
  id_stuff: number;     // Product being requested
  id_friend: number;    // Owner of the product
}

/**
 * Create a new loan request
 */
export const createLoanRequest = async (data: CreateLoanInput): Promise<LoanRequest> => {
  const response = await apiClient.post<LoanRequest>(loanEndpoints.create(), data);
  return response.data;
};

// ============ DELETE (Accept/Reject/Return) ============

/**
 * Delete a loan request by _id
 * Used for: accept, reject, cancel, or return
 */
export const deleteLoanRequest = async (_id: string): Promise<void> => {
  await apiClient.delete(loanEndpoints.delete(_id));
};

/**
 * Accept a loan request (product owner approves)
 */
export const acceptLoanRequest = async (_id: string): Promise<void> => {
  // TODO: In future, could mark product as "on loan"
  await deleteLoanRequest(_id);
};

/**
 * Reject a loan request
 */
export const rejectLoanRequest = async (_id: string): Promise<void> => {
  await deleteLoanRequest(_id);
};

/**
 * Cancel a loan request (by the requester)
 */
export const cancelLoanRequest = async (_id: string): Promise<void> => {
  await deleteLoanRequest(_id);
};

/**
 * Return a loaned item
 */
export const returnLoanedItem = async (_id: string): Promise<void> => {
  // TODO: In future, could mark product as "returned"
  await deleteLoanRequest(_id);
};

// Export all functions
export const loansApi = {
  list: getLoanRequests,
  create: createLoanRequest,
  delete: deleteLoanRequest,
  accept: acceptLoanRequest,
  reject: rejectLoanRequest,
  cancel: cancelLoanRequest,
  return: returnLoanedItem,
};

export default loansApi;
