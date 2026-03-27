/**
 * StuffHelper Tests
 * 
 * Tests for utility functions that transform products and categories data
 */
import { describe, it, expect } from 'vitest';
import { 
  mapStuff, 
  mapIds, 
  getProductsMap, 
  getProductFromProducts 
} from './StuffHelper';

describe('StuffHelper', () => {
  describe('mapStuff', () => {
    it('should transform stuffiers_stuff array to id objects', () => {
      const stuff = [
        { id_stuffier: 1, id_stuff: 100, cost: 50 },
        { id_stuffier: 1, id_stuff: 200, cost: 75 },
        { id_stuffier: 1, id_stuff: 300, cost: 25 },
      ];
      
      const result = mapStuff(stuff);
      
      expect(result).toEqual([
        { id: 100 },
        { id: 200 },
        { id: 300 },
      ]);
    });

    it('should return empty array for empty input', () => {
      expect(mapStuff([])).toEqual([]);
    });
  });

  describe('mapIds', () => {
    it('should transform number array to id objects', () => {
      const ids = [1, 2, 3];
      
      const result = mapIds(ids);
      
      expect(result).toEqual([
        { id: 1 },
        { id: 2 },
        { id: 3 },
      ]);
    });

    it('should return empty array for empty input', () => {
      expect(mapIds([])).toEqual([]);
    });
  });

  describe('getProductsMap', () => {
    const categories = [
      { id: 1, name: 'Electronics' },
      { id: 2, name: 'Books' },
      { id: 3, name: 'Clothing' },
    ];

    it('should create products map organized by category', () => {
      const products = [
        { id: 100, name: 'Laptop', category: 1 },
        { id: 101, name: 'Phone', category: 1 },
        { id: 200, name: 'Novel', category: 2 },
      ];
      
      const result = getProductsMap(categories, products);
      
      expect(result[1]).toHaveLength(2);
      expect(result[2]).toHaveLength(1);
      expect(result[3]).toHaveLength(0);
    });

    it('should return empty categories for empty products', () => {
      const result = getProductsMap(categories, []);
      
      expect(result).toEqual({
        1: [],
        2: [],
        3: [],
      });
    });

    it('should handle empty categories array', () => {
      const result = getProductsMap([], []);
      expect(result).toEqual({});
    });
  });

  describe('getProductFromProducts', () => {
    const productsMap = {
      1: [
        { id: 100, name: 'Laptop', category: 1, subcategory: 1, fileName: 'laptop.png' },
        { id: 101, name: 'Phone', category: 1, subcategory: 1, fileName: 'phone.png' },
      ],
      2: [
        { id: 200, name: 'Novel', category: 2, subcategory: 2, fileName: 'novel.png' },
      ],
      3: [],
    };

    it('should find product by id', () => {
      const product = getProductFromProducts(100, productsMap);
      
      expect(product).toEqual({ id: 100, name: 'Laptop', category: 1, subcategory: 1, fileName: 'laptop.png' });
    });

    it('should find product in different category', () => {
      const product = getProductFromProducts(200, productsMap);
      
      expect(product).toEqual({ id: 200, name: 'Novel', category: 2, subcategory: 2, fileName: 'novel.png' });
    });

    it('should return undefined for non-existent product', () => {
      const product = getProductFromProducts(999, productsMap);
      
      expect(product).toBeUndefined();
    });
  });
});
