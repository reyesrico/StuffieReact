/**
 * Subcategory Proposals API
 * User: POST /subcategory_proposals
 * Admin: GET /subcategory_proposals, PATCH .../approve, PATCH .../reject
 */
import { apiClient } from './client';

export interface SubcategoryProposal {
  _id: string;
  name: string;
  category_id: number;
  proposed_by: string;
  proposed_by_id: number;
  status: 'pending' | 'approved' | 'rejected';
  admin_note: string;
  _created: string;
}

/** User submits a new subcategory proposal */
export const createProposal = async (name: string, category_id: number): Promise<SubcategoryProposal> => {
  const res = await apiClient.post<SubcategoryProposal>('subcategory_proposals', { name, category_id });
  return res.data;
};

/** Admin: list proposals, optionally filter by status */
export const getProposals = async (status?: string): Promise<SubcategoryProposal[]> => {
  const params = status ? { status } : {};
  const res = await apiClient.get<SubcategoryProposal[]>('subcategory_proposals', { params });
  return res.data;
};

/** Admin: approve a proposal (also creates the subcategory in DB) */
export const approveProposal = async (_id: string, admin_note = ''): Promise<void> => {
  await apiClient.patch(`subcategory_proposals/${_id}/approve`, { admin_note });
};

/** Admin: reject a proposal */
export const rejectProposal = async (_id: string, admin_note = ''): Promise<void> => {
  await apiClient.patch(`subcategory_proposals/${_id}/reject`, { admin_note });
};
