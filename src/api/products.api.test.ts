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
  updateProduct 
} from './products.api';
import { apiClient } from './client';

// Mock the apiClient module
vi.mock('./client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
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

      // createProduct calls getLastProductId (GET) before the POST
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: [{ id: 99 }] });
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: createdProduct });
      
      const result = await createProduct(newProduct);
      
      expect(result).toEqual(createdProduct);
      expect(apiClient.post).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateProduct', () => {
    it('should update existing product', async () => {
      const updates = { name: 'Updated Name' };
      const updatedProduct = { id: 1, name: 'Updated Name', category: 1 };
      
      vi.mocked(apiClient.put).mockResolvedValueOnce({ data: updatedProduct });
      
      const result = await updateProduct(1, updates);
      
      expect(result).toEqual(updatedProduct);
    });
  });
});
