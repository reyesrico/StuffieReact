/**
 * Query Keys Tests
 * 
 * Tests for React Query key factory functions
 * Ensures consistent cache key generation
 */
import { describe, it, expect } from 'vitest';
import { queryKeys } from './queryKeys';

describe('queryKeys', () => {
  describe('categories', () => {
    it('should generate all categories key', () => {
      expect(queryKeys.categories.all).toEqual(['categories']);
    });

    it('should generate category detail key', () => {
      expect(queryKeys.categories.detail(5)).toEqual(['categories', 5]);
    });
  });

  describe('subcategories', () => {
    it('should generate all subcategories key', () => {
      expect(queryKeys.subcategories.all).toEqual(['subcategories']);
    });

    it('should generate subcategories by category key', () => {
      expect(queryKeys.subcategories.byCategory(3)).toEqual(['subcategories', 'category', 3]);
    });
  });

  describe('products', () => {
    it('should generate products key with userId', () => {
      expect(queryKeys.products.all(42)).toEqual(['products', 42]);
    });

    it('should generate products by category key', () => {
      expect(queryKeys.products.byCategory(42, 5)).toEqual(['products', 42, 'category', 5]);
    });

    it('should generate product detail key', () => {
      expect(queryKeys.products.detail(100)).toEqual(['products', 'detail', 100]);
    });

    it('should generate pending products key', () => {
      expect(queryKeys.products.pending()).toEqual(['products', 'pending']);
    });
  });

  describe('user', () => {
    it('should generate current user key with email', () => {
      expect(queryKeys.user.current('test@example.com')).toEqual(['user', 'test@example.com']);
    });

    it('should generate user requests key', () => {
      expect(queryKeys.user.requests()).toEqual(['user', 'requests']);
    });
  });

  describe('friends', () => {
    it('should generate all friends key', () => {
      expect(queryKeys.friends.all('user@test.com')).toEqual(['friends', 'user@test.com']);
    });

    it('should generate friends with products key', () => {
      expect(queryKeys.friends.withProducts('user@test.com')).toEqual(['friends', 'user@test.com', 'withProducts']);
    });

    it('should generate friend requests key', () => {
      expect(queryKeys.friends.requests('user@test.com')).toEqual(['friends', 'user@test.com', 'requests']);
    });
  });

  describe('exchanges', () => {
    it('should generate exchanges key with userId', () => {
      expect(queryKeys.exchanges.all(99)).toEqual(['exchanges', 99]);
    });
  });

  describe('loans', () => {
    it('should generate loans key with userId', () => {
      expect(queryKeys.loans.all(99)).toEqual(['loans', 99]);
    });
  });

  describe('key consistency', () => {
    it('should return same key for same inputs', () => {
      const key1 = queryKeys.products.all(42);
      const key2 = queryKeys.products.all(42);
      
      expect(key1).toEqual(key2);
    });

    it('should return different keys for different inputs', () => {
      const key1 = queryKeys.products.all(42);
      const key2 = queryKeys.products.all(43);
      
      expect(key1).not.toEqual(key2);
    });
  });
});
