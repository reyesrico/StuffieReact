/**
 * Categories API - CRUD operations for categories
 */
import { apiClient } from './client';
import { categoryEndpoints } from './endpoints';
import type Category from '../components/types/Category';

// ============ READ ============

/**
 * Get all categories
 */
export const getCategories = async (): Promise<Category[]> => {
  const response = await apiClient.get<Category[]>(categoryEndpoints.list());
  return response.data;
};

/**
 * Get category by id
 */
export const getCategory = async (id: number): Promise<Category | null> => {
  const response = await apiClient.get<Category[]>(categoryEndpoints.get(id));
  return response.data[0] || null;
};

// ============ CREATE ============

export interface CreateCategoryInput {
  id: number;
  name: string;
}

/**
 * Create a new category
 */
export const createCategory = async (category: CreateCategoryInput): Promise<Category> => {
  const response = await apiClient.post<Category>(categoryEndpoints.create(), {
    ...category,
    created_at: new Date().toISOString(),
  });
  return response.data;
};

// ============ UPDATE ============

export interface UpdateCategoryInput {
  name: string;
}

/**
 * Update category name by _id
 */
export const updateCategory = async (_id: string, data: UpdateCategoryInput): Promise<Category> => {
  const response = await apiClient.put<Category>(categoryEndpoints.update(_id), data);
  return response.data;
};

// ============ DELETE ============

/**
 * Delete category by _id
 */
export const deleteCategory = async (_id: string): Promise<void> => {
  await apiClient.delete(categoryEndpoints.delete(_id));
};

// Export all functions
export const categoriesApi = {
  list: getCategories,
  get: getCategory,
  create: createCategory,
  update: updateCategory,
  delete: deleteCategory,
};

export default categoriesApi;
