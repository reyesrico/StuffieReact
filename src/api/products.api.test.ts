/**
 * Products API Tests
 * 
 * Tests for product CRUD operations
 * Uses vitest mocking for axios
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  getProducts, 
  getProduct, 
  getProductsByIds,
  getProductsByCategory,
  getPendingProducts,
  createProduct,
  updateProduct,
  addProductToUser,
} from './products.api';
import { apiClient } from './client';

// Mock the apiClient module
vi.mock('./client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Products API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProducts', () => {
    it('should fetch all products', async () => {
      const mockProducts = [
        { id: 1, name: 'Product 1', category: 1, subcategory: 1 },
        { id: 2, name: 'Product 2', category: 1, subcategory: 2 },
      ];
      
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockProducts });
      
      const result = await getProducts();
      
      expect(result).toEqual(mockProducts);
      expect(apiClient.get).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no products', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: [] });
      
      const result = await getProducts();
      
      expect(result).toEqual([]);
    });
  });

  describe('getProduct', () => {
    it('should fetch single product by id', async () => {
      const mockProduct = { id: 1, name: 'Test Product', category: 1 };
      
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: [mockProduct] });
      
      const result = await getProduct(1);
      
      expect(result).toEqual(mockProduct);
    });

    it('should return null when product not found', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: [] });
      
      const result = await getProduct(999);
      
      expect(result).toBeNull();
    });
  });

  describe('getProductsByIds', () => {
    it('should fetch products by multiple ids', async () => {
      const mockProducts = [
        { id: 1, name: 'Product 1' },
        { id: 2, name: 'Product 2' },
      ];
      const ids = [{ id: 1 }, { id: 2 }];
      
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockProducts });
      
      const result = await getProductsByIds(ids);
      
      expect(result).toEqual(mockProducts);
    });

    it('should return empty array for empty ids', async () => {
      const result = await getProductsByIds([]);
      
      expect(result).toEqual([]);
      expect(apiClient.get).not.toHaveBeenCalled();
    });
  });

  describe('getProductsByCategory', () => {
    it('should fetch products filtered by category and subcategory', async () => {
      const mockProducts = [
        { id: 1, name: 'Electronic 1', category: 1, subcategory: 2 },
      ];
      
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockProducts });
      
      const result = await getProductsByCategory(1, 2);
      
      expect(result).toEqual(mockProducts);
    });
  });

  describe('getPendingProducts', () => {
    it('should fetch products without images', async () => {
      const mockPending = [
        { id: 1, name: 'Pending', image_key: '' },
      ];
      
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockPending });
      
      const result = await getPendingProducts();
      
      expect(result).toEqual(mockPending);
    });
  });

  describe('createProduct', () => {
    it('should create a new product', async () => {
      const newProduct = { name: 'New Item', category_id: 1, subcategory_id: 1, image_key: 'image.jpg' };
      const createdProduct = { id: 100, ...newProduct };

      // createProduct POSTs to /items/next-id first (atomic counter), then POSTs the product
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: { id: 100 } });
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: createdProduct });
      
      const result = await createProduct(newProduct);
      
      expect(result).toEqual(createdProduct);
      expect(apiClient.post).toHaveBeenCalledTimes(2);
      expect(apiClient.get).not.toHaveBeenCalled();
    });
  });

  describe('updateProduct', () => {
    it('should use PATCH (not PUT) so existing catalog fields are never wiped', async () => {
      // CRITICAL: updateProduct must PATCH, not PUT.
      // A PUT with only { image_key } would wipe id, name, category_id, etc.
      const updates = { image_key: 'products/4/401/95', pending_image_key: '' };
      const fullProduct = { id: 95, name: 'Xbox One S', category_id: 4, subcategory_id: 401, ...updates };

      vi.mocked(apiClient.patch).mockResolvedValueOnce({ data: fullProduct });

      const result = await updateProduct('abc123', updates);

      expect(apiClient.patch).toHaveBeenCalledTimes(1);
      expect(apiClient.put).not.toHaveBeenCalled(); // PUT would destroy the document
      expect(result.name).toBe('Xbox One S');         // name must survive
      expect(result.id).toBe(95);                     // id must survive
      expect(result.category_id).toBe(4);             // category must survive
    });

    it('should pass only the supplied fields to PATCH', async () => {
      const updates = { name: 'Updated Name' };
      const updatedProduct = { id: 1, name: 'Updated Name', category_id: 1 };

      vi.mocked(apiClient.patch).mockResolvedValueOnce({ data: updatedProduct });

      const result = await updateProduct('abc123', updates);

      const patchCall = vi.mocked(apiClient.patch).mock.calls[0];
      expect(patchCall[1]).toEqual({ name: 'Updated Name' }); // only supplied fields
      expect(result).toEqual(updatedProduct);
    });
  });

  describe('addProductToUser', () => {
    it('should POST new row with quantity:1 when user does not own the item yet', async () => {
      const input = { user_id: 1, item_id: 99, asking_price: 10 };
      const created = { _id: 'abc', user_id: 1, item_id: 99, asking_price: 10, quantity: 1 };

      // First call: listByUser returns empty (user doesn't own item 99)
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: [] });
      // Second call: POST returns the new row
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: created });

      const result = await addProductToUser(input);

      expect(apiClient.post).toHaveBeenCalledTimes(1);
      expect(apiClient.put).not.toHaveBeenCalled();
      expect(result.quantity).toBe(1);
    });

    it('should PUT existing row with quantity+1 when user already owns the item', async () => {
      const input = { user_id: 1, item_id: 3 };
      const existingRow = { _id: 'existing-id', user_id: 1, item_id: 3, quantity: 1 };
      const updatedRow = { ...existingRow, quantity: 2 };

      // First call: listByUser returns the existing row
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: [existingRow] });
      // Second call: PUT returns the updated row
      vi.mocked(apiClient.put).mockResolvedValueOnce({ data: updatedRow });

      const result = await addProductToUser(input);

      expect(apiClient.post).not.toHaveBeenCalled();
      expect(apiClient.put).toHaveBeenCalledTimes(1);
      expect(result.quantity).toBe(2);
    });

    it('should treat missing quantity as 1 and produce quantity:2 on second add', async () => {
      const input = { user_id: 1, item_id: 3 };
      // Existing row has no quantity field (old DB rows)
      const existingRow = { _id: 'existing-id', user_id: 1, item_id: 3 };
      const updatedRow = { ...existingRow, quantity: 2 };

      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: [existingRow] });
      vi.mocked(apiClient.put).mockResolvedValueOnce({ data: updatedRow });

      const result = await addProductToUser(input);

      expect(result.quantity).toBe(2);
      // Verify PUT was called with quantity:2 (1 + 1 since missing treated as 1)
      const putCall = vi.mocked(apiClient.put).mock.calls[0];
      expect(putCall[1]).toMatchObject({ quantity: 2 });
    });
  });
});
