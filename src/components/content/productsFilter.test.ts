/**
 * Option D — Products filter bar logic
 *
 * Tests for the client-side filtering and sorting applied to
 * the category-grouped product map in Products.tsx.
 * The logic is expressed as pure functions here so it can be
 * tested without mounting the full component.
 */
import { describe, it, expect } from 'vitest';
import type Product from '../types/Product';
import type Category from '../types/Category';
import { applyFiltersAndSort, type ProductsMap } from './productsFilter';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const CAT_BOOKS: Category = { id: 1, name: 'Books' };
const CAT_GAMES: Category = { id: 2, name: 'Games' };

const p = (id: number, name: string, cost = 0, catId = 1): Product =>
  ({ id, name, cost, category_id: catId } as Product);

const productsMap: ProductsMap = {
  1: [p(1, 'Dune', 0), p(2, 'Foundation', 10), p(3, 'Dune', 0)],   // Dune has 2 copies
  2: [p(4, 'Chess Set', 25, 2), p(5, 'Monopoly', 0, 2)],
};
const categories = [CAT_BOOKS, CAT_GAMES];

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Products filter bar (Option D)', () => {

  describe('no filters active', () => {
    it('returns all categories', () => {
      const result = applyFiltersAndSort(productsMap, categories, '', null, false, 'nameAsc');
      expect(result).toHaveLength(2);
    });

    it('groups duplicate-name products into one entry', () => {
      const result = applyFiltersAndSort(productsMap, categories, '', null, false, 'nameAsc');
      const booksGroups = result.find(r => r.category.id === 1)!.groups;
      expect(booksGroups).toHaveLength(2);           // Dune (×2) and Foundation
      const duneGroup = booksGroups.find(g => g[0].name === 'Dune')!;
      expect(duneGroup).toHaveLength(2);
    });
  });

  describe('text filter', () => {
    it('filters by name (case-insensitive)', () => {
      const result = applyFiltersAndSort(productsMap, categories, 'DUNE', null, false, 'nameAsc');
      const booksGroups = result.find(r => r.category.id === 1)!.groups;
      expect(booksGroups).toHaveLength(1);
      expect(booksGroups[0][0].name).toBe('Dune');
    });

    it('returns empty when no match', () => {
      const result = applyFiltersAndSort(productsMap, categories, 'xyz-nonexistent', null, false, 'nameAsc');
      expect(result).toHaveLength(0);
    });

    it('matches partial name', () => {
      const result = applyFiltersAndSort(productsMap, categories, 'oun', null, false, 'nameAsc');
      const booksGroups = result.find(r => r.category.id === 1)!.groups;
      expect(booksGroups[0][0].name).toBe('Foundation');
    });
  });

  describe('category chip filter', () => {
    it('restricts to selected category', () => {
      const result = applyFiltersAndSort(productsMap, categories, '', 2, false, 'nameAsc');
      expect(result).toHaveLength(1);
      expect(result[0].category.id).toBe(2);
    });

    it('shows all categories when filter is null', () => {
      const result = applyFiltersAndSort(productsMap, categories, '', null, false, 'nameAsc');
      expect(result).toHaveLength(2);
    });
  });

  describe('for-sale toggle', () => {
    it('only shows products with cost > 0', () => {
      const result = applyFiltersAndSort(productsMap, categories, '', null, true, 'nameAsc');
      // Books: Foundation (10) passes; Dune (0) fails
      // Games: Chess Set (25) passes; Monopoly (0) fails
      const booksGroups = result.find(r => r.category.id === 1)!.groups;
      expect(booksGroups).toHaveLength(1);
      expect(booksGroups[0][0].name).toBe('Foundation');

      const gamesGroups = result.find(r => r.category.id === 2)!.groups;
      expect(gamesGroups).toHaveLength(1);
      expect(gamesGroups[0][0].name).toBe('Chess Set');
    });

    it('hides a category entirely if none of its products are for sale', () => {
      const noCostMap: ProductsMap = { 1: [p(1, 'Dune', 0)], 2: [p(4, 'Chess', 25, 2)] };
      const result = applyFiltersAndSort(noCostMap, categories, '', null, true, 'nameAsc');
      expect(result.find(r => r.category.id === 1)).toBeUndefined();
      expect(result.find(r => r.category.id === 2)).toBeDefined();
    });
  });

  describe('sort', () => {
    it('sorts nameAsc within a category', () => {
      const result = applyFiltersAndSort(productsMap, categories, '', 1, false, 'nameAsc');
      const names = result[0].groups.map(g => g[0].name);
      expect(names).toEqual(['Dune', 'Foundation']);
    });

    it('sorts nameDesc within a category', () => {
      const result = applyFiltersAndSort(productsMap, categories, '', 1, false, 'nameDesc');
      const names = result[0].groups.map(g => g[0].name);
      expect(names).toEqual(['Foundation', 'Dune']);
    });

    it('sorts priceAsc within games', () => {
      const result = applyFiltersAndSort(productsMap, categories, '', 2, false, 'priceAsc');
      const names = result[0].groups.map(g => g[0].name);
      expect(names).toEqual(['Monopoly', 'Chess Set']);
    });

    it('sorts priceDesc within games', () => {
      const result = applyFiltersAndSort(productsMap, categories, '', 2, false, 'priceDesc');
      const names = result[0].groups.map(g => g[0].name);
      expect(names).toEqual(['Chess Set', 'Monopoly']);
    });
  });

  describe('combined filters', () => {
    it('text + forSale combined narrows correctly', () => {
      // "Chess" + forSale — Chess Set (cost=25) should pass; Monopoly text won't match anyway
      const result = applyFiltersAndSort(productsMap, categories, 'chess', null, true, 'nameAsc');
      expect(result).toHaveLength(1);
      expect(result[0].groups[0][0].name).toBe('Chess Set');
    });
  });
});
