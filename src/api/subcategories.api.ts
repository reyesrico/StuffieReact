/**
 * Subcategories API - CRUD operations for subcategories
 */
import { apiClient } from './client';
import { subcategoryEndpoints } from './endpoints';
import type Subcategory from '../components/types/Subcategory';

// ============ READ ============

/**
 * Get all subcategories
 */
export const getSubcategories = async (): Promise<Subcategory[]> => {
  const response = await apiClient.get<Subcategory[]>(subcategoryEndpoints.list());
  return response.data;
};

/**
 * Get subcategory by id
 */
export const getSubcategory = async (id: number): Promise<Subcategory | null> => {
  const response = await apiClient.get<Subcategory[]>(subcategoryEndpoints.get(id));
  return response.data[0] || null;
};

// ============ CREATE ============

export interface CreateSubcategoryInput {
  id: number;
  name: string;
}

/**
 * Create a new subcategory
 */
export const createSubcategory = async (subcategory: CreateSubcategoryInput): Promise<Subcategory> => {
  const response = await apiClient.post<Subcategory>(subcategoryEndpoints.create(), subcategory);
  return response.data;
};

// ============ DELETE ============

/**
 * Delete subcategory by _id
 */
export const deleteSubcategory = async (_id: string): Promise<void> => {
  await apiClient.delete(subcategoryEndpoints.delete(_id));
};

// Export all functions
export const subcategoriesApi = {
  list: getSubcategories,
  get: getSubcategory,
  create: createSubcategory,
  delete: deleteSubcategory,
};

export default subcategoriesApi;
