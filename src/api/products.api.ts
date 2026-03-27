/**
 * Products API - CRUD operations for products (stuff)
 * 
 * Products have two related collections:
 * - 'stuff': Product catalog (name, category, subcategory, file_name)
 * - 'stuffiers-stuff': User-product relationships (id_stuffier, id_stuff, cost)
 */
import { apiClient } from './client';
import { productEndpoints, stuffiersStuffEndpoints } from './endpoints';
import type Product from '../components/types/Product';
import type StuffiersStuff from '../components/types/StuffiersStuff';

// ============ READ - Products ============

/**
 * Get all products
 */
export const getProducts = async (): Promise<Product[]> => {
  const response = await apiClient.get<Product[]>(productEndpoints.list());
  return response.data;
};

/**
 * Get product by id
 */
export const getProduct = async (id: number): Promise<Product | null> => {
  const response = await apiClient.get<Product[]>(productEndpoints.get(id));
  return response.data[0] || null;
};

/**
 * Get multiple products by ids
 */
export const getProductsByIds = async (ids: Array<{ id: number }>): Promise<Product[]> => {
  if (ids.length === 0) return [];
  const response = await apiClient.get<Product[]>(productEndpoints.listByIds(ids));
  return response.data;
};

/**
 * Get products by category and subcategory
 */
export const getProductsByCategory = async (
  category: number, 
  subcategory: number
): Promise<Product[]> => {
  const response = await apiClient.get<Product[]>(
    productEndpoints.listByCategory(category, subcategory)
  );
  return response.data;
};

/**
 * Get products without images (pending approval)
 */
export const getPendingProducts = async (): Promise<Product[]> => {
  const response = await apiClient.get<Product[]>(productEndpoints.listPending());
  return response.data;
};

// ============ CREATE - Products ============

export interface CreateProductInput {
  name: string;
  category: number;
  subcategory: number;
  fileName?: string;
}

/**
 * Create a new product
 */
export const createProduct = async (product: CreateProductInput): Promise<Product> => {
  const response = await apiClient.post<Product>(productEndpoints.create(), {
    name: product.name,
    category: product.category,
    subcategory: product.subcategory,
    file_name: product.fileName,
  });
  return response.data;
};

// ============ UPDATE - Products ============

export interface UpdateProductInput {
  name?: string;
  category?: number;
  subcategory?: number;
  file_name?: string;
}

/**
 * Update a product by _id
 */
export const updateProduct = async (_id: string, data: UpdateProductInput): Promise<Product> => {
  const response = await apiClient.put<Product>(productEndpoints.update(_id), data);
  return response.data;
};

// ============ DELETE - Products ============

/**
 * Delete a product by _id
 */
export const deleteProduct = async (_id: string): Promise<void> => {
  await apiClient.delete(productEndpoints.delete(_id));
};

// ============ READ - User-Product Relationships (StuffiersStuff) ============

/**
 * Get all products for a user (returns stuffiers_stuff records)
 */
export const getUserProducts = async (userId: number): Promise<StuffiersStuff[]> => {
  const response = await apiClient.get<StuffiersStuff[]>(
    stuffiersStuffEndpoints.listByUser(userId)
  );
  return response.data;
};

/**
 * Get products for multiple users
 */
export const getProductsForUsers = async (
  userIds: Array<{ id_stuffier: number }>
): Promise<StuffiersStuff[]> => {
  if (userIds.length === 0) return [];
  const response = await apiClient.get<StuffiersStuff[]>(
    stuffiersStuffEndpoints.listByUsers(userIds)
  );
  return response.data;
};

// ============ CREATE - User-Product Relationship ============

export interface AddProductToUserInput {
  id_stuffier: number;
  id_stuff: number;
  cost?: number;
}

/**
 * Add a product to a user's collection
 */
export const addProductToUser = async (data: AddProductToUserInput): Promise<StuffiersStuff> => {
  const response = await apiClient.post<StuffiersStuff>(
    stuffiersStuffEndpoints.create(), 
    data
  );
  return response.data;
};

// ============ UPDATE - User-Product Relationship ============

export interface UpdateUserProductInput {
  cost?: number;
}

/**
 * Update a user-product relationship (e.g., cost)
 */
export const updateUserProduct = async (
  _id: string, 
  data: UpdateUserProductInput
): Promise<StuffiersStuff> => {
  const response = await apiClient.put<StuffiersStuff>(
    stuffiersStuffEndpoints.update(_id), 
    data
  );
  return response.data;
};

/**
 * Update product cost for a user
 * This is a convenience function that finds the record and updates it
 */
export const updateProductCost = async (
  userId: number, 
  productId: number, 
  cost: number
): Promise<StuffiersStuff | null> => {
  // First, get the user's stuffiers_stuff records to find the _id
  const userProducts = await getUserProducts(userId);
  const record = userProducts.find(r => r.id_stuff === productId);
  
  if (!record) return null;
  
  // Now update with the _id
  // Note: The endpoint needs the MongoDB _id, but our type only has numeric id
  // We need to cast or update the type - for now, assuming _id is available
  const response = await apiClient.put<StuffiersStuff>(
    stuffiersStuffEndpoints.update((record as StuffiersStuff & { _id: string })._id), 
    { ...record, cost }
  );
  return response.data;
};

// ============ DELETE - User-Product Relationship ============

/**
 * Remove a product from a user's collection
 */
export const removeProductFromUser = async (_id: string): Promise<void> => {
  await apiClient.delete(stuffiersStuffEndpoints.delete(_id));
};

// ============ SEARCH UTILITIES - Client-side filtering ============

interface SearchResult {
  type: 'Category' | 'Subcategory' | 'Product';
  name: string;
  id: number;
}

interface Category {
  id: number;
  name: string;
}

/**
 * Search for products, categories, and subcategories (client-side filtering)
 * This emulates ElasticSearch functionality
 */
export const searchProductsAndCategories = async (
  searchText: string,
  products: Record<string, Product[]>,
  categories: Category[],
  subcategories: Category[]
): Promise<SearchResult[]> => {
  const results: SearchResult[] = [];
  const text = searchText.toLowerCase();

  // Search categories
  categories.forEach(c => {
    if (c.name.toLowerCase().includes(text)) {
      results.push({ type: 'Category', name: c.name, id: c.id });
    }
  });

  // Search subcategories
  subcategories.forEach(s => {
    if (s.name.toLowerCase().includes(text)) {
      results.push({ type: 'Subcategory', name: s.name, id: s.id });
    }
  });

  // Search products
  Object.keys(products).forEach(key => {
    products[key].forEach(p => {
      if (p.name && p.id && p.name.toLowerCase().includes(text)) {
        results.push({ type: 'Product', name: p.name, id: p.id });
      }
    });
  });

  return results;
};

/**
 * Filter products by search text (client-side)
 * Used for exchange product search
 */
export const filterProductsByText = (
  searchText: string, 
  products: Product[]
): Product[] => {
  return products.filter(product => 
    product.name?.toLowerCase().includes(searchText.toLowerCase())
  );
};

// Export all functions
export const productsApi = {
  // Products
  list: getProducts,
  get: getProduct,
  listByIds: getProductsByIds,
  listByCategory: getProductsByCategory,
  listPending: getPendingProducts,
  create: createProduct,
  update: updateProduct,
  delete: deleteProduct,
  
  // User-Product relationships
  listByUser: getUserProducts,
  listByUsers: getProductsForUsers,
  addToUser: addProductToUser,
  updateUserProduct: updateUserProduct,
  updateCost: updateProductCost,
  removeFromUser: removeProductFromUser,

  // Search utilities
  search: searchProductsAndCategories,
  filterByText: filterProductsByText,
};

export default productsApi;
