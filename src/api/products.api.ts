/**
 * Products API - CRUD operations for products (items)
 * 
 * Products have two related collections:
 * - 'items': Product catalog (name, category_id, subcategory_id, image_key)
 * - 'stuffiers-stuff': User-product relationships (id_stuffier, id_stuff, cost)
 */
import { apiClient } from './client';
import { productEndpoints, stuffiersStuffEndpoints, userProductsEndpoints } from './endpoints';
import type Product from '../components/types/Product';
import type UserItem from '../components/types/UserItem';

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
  category_id: number;
  subcategory_id: number;
  image_key?: string;
  cost?: number;
}

/**
 * Get the highest 'id' value from the stuff collection.
 * Codehooks does not auto-generate numeric ids, so we manage them ourselves.
 */
export const getLastProductId = async (): Promise<number> => {
  const response = await apiClient.get<Record<string, any>[]>(productEndpoints.getLastId());
  const ids = response.data
    .map((row: Record<string, any>) => Number(row.id))
    .filter((n: number) => Number.isFinite(n) && n > 0);
  return ids.length > 0 ? Math.max(...ids) : 0;
};

/**
 * Create a new product
 */
export const createProduct = async (product: CreateProductInput): Promise<Product> => {
  const lastId = await getLastProductId();
  const newId = lastId + 1;

  const response = await apiClient.post<Product>(productEndpoints.create(), {
    name: product.name,
    category_id: product.category_id,
    subcategory_id: product.subcategory_id,
    image_key: product.image_key,
    id: newId,
  });
  // Guarantee id is present — Codehooks does not always echo custom fields back
  return { ...response.data, id: newId };
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

// ============ READ - User-Product Relationships (UserItem) ============

/**
 * Get all products for a user (returns user_items records)
 */
export const getUserProducts = async (userId: number): Promise<UserItem[]> => {
  const response = await apiClient.get<UserItem[]>(
    stuffiersStuffEndpoints.listByUser(userId)
  );
  return response.data;
};

/**
 * Phase 4: Single-call server-side join — replaces getUserProducts + getProductsByIds + mapCostToProducts
 * Returns Product[] with cost merged from user_items, ready for getProductsMap()
 */
export const getUserProductsJoined = async (userId: number): Promise<Product[]> => {
  const response = await apiClient.get<Product[]>(
    userProductsEndpoints.listByUser(userId)
  );
  return response.data;
};

/**
 * Get products for multiple users
 */
export const getProductsForUsers = async (
  userIds: Array<{ user_id: number }>
): Promise<UserItem[]> => {
  if (userIds.length === 0) return [];
  const response = await apiClient.get<UserItem[]>(
    stuffiersStuffEndpoints.listByUsers(userIds)
  );
  return response.data;
};

// ============ CREATE - User-Product Relationship ============

export interface AddProductToUserInput {
  user_id: number;
  item_id: number;
  asking_price?: number;
}

/**
 * Add a product to a user's collection
 */
export const addProductToUser = async (data: AddProductToUserInput): Promise<UserItem> => {
  const response = await apiClient.post<UserItem>(
    stuffiersStuffEndpoints.create(),
    data
  );
  return response.data;
};

// ============ UPDATE - User-Product Relationship ============

export interface UpdateUserProductInput {
  asking_price?: number;
}

/**
 * Update a user-product relationship (e.g., asking_price)
 */
export const updateUserProduct = async (
  _id: string,
  data: UpdateUserProductInput
): Promise<UserItem> => {
  const response = await apiClient.put<UserItem>(
    stuffiersStuffEndpoints.update(_id),
    data
  );
  return response.data;
};

/**
 * Update product asking_price for a user
 */
export const updateProductCost = async (
  userId: number,
  productId: number,
  cost: number
): Promise<UserItem | null> => {
  const userProducts = await getUserProducts(userId);
  const record = userProducts.find(r => r.item_id === productId);

  if (!record) return null;

  const response = await apiClient.put<UserItem>(
    stuffiersStuffEndpoints.update((record as UserItem & { _id: string })._id),
    { ...record, asking_price: cost }
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
