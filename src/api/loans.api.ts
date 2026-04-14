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
  const response = await apiClient.post<LoanRequest>(loanEndpoints.create(), { ...data, status: 'pending' });
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
 * Accept a loan request — calls backend to set status 'active' + mark item on_loan
 */
export const acceptLoanRequest = async (_id: string): Promise<void> => {
  await apiClient.post(`loan_requests/${_id}/accept`, {});
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
 * Return a loaned item — borrower signals they are returning it
 */
export const requestReturnLoan = async (_id: string): Promise<void> => {
  await apiClient.patch(loanEndpoints.update(_id), { status: 'return_requested' });
};

/**
 * Complete a loan — owner confirms item was returned, restores ownership flags
 */
export const completeLoanRequest = async (_id: string): Promise<void> => {
  await apiClient.post(`loan_requests/${_id}/complete`, {});
};

// Export all functions
export const loansApi = {
  list: getLoanRequests,
  create: createLoanRequest,
  delete: deleteLoanRequest,
  accept: acceptLoanRequest,
  reject: rejectLoanRequest,
  cancel: cancelLoanRequest,
  requestReturn: requestReturnLoan,
  complete: completeLoanRequest,
};

export default loansApi;
