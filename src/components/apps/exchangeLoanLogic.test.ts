/**
 * Option B — Exchange filter empty state & Loan button guard logic
 *
 * Tests for:
 *   - Exchange: product text filter (same logic as production code)
 *   - Exchange: empty state conditions (no products vs no filter results)
 *   - Loan: button disabled state based on mutation isPending flag
 */
import { describe, it, expect } from 'vitest';
import type Product from '../../components/types/Product';

// ─── Exchange filter helpers (pure extraction from Exchange.tsx) ──────────────

function filterProducts(allProducts: Product[], filterText: string): Product[] {
  const lowerFilter = filterText.trim().toLowerCase();
  if (!lowerFilter) return allProducts;
  return allProducts.filter(p => p.name?.toLowerCase().includes(lowerFilter));
}

function exchangeEmptyState(
  allProducts: Product[],
  filtered: Product[],
): 'no_products' | 'no_filter_results' | 'ok' {
  if (allProducts.length === 0) return 'no_products';
  if (filtered.length === 0) return 'no_filter_results';
  return 'ok';
}

function splitByCategory(products: Product[], targetCategoryId: number | undefined) {
  const sameCategory = products.filter(p => p.category_id === targetCategoryId);
  const otherProducts = products.filter(p => p.category_id !== targetCategoryId);
  return { sameCategory, otherProducts };
}

// ─── Loan button guard (pure) ─────────────────────────────────────────────────

function isLoanButtonDisabled(isPending: boolean): boolean {
  return isPending;
}

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const p = (id: number, name: string, catId = 1): Product =>
  ({ id, name, category_id: catId } as Product);

const products: Product[] = [
  p(1, 'Guitar', 1),
  p(2, 'Bass Guitar', 1),
  p(3, 'Drums', 2),
  p(4, 'Piano', 2),
];

// ─── Exchange filter tests ────────────────────────────────────────────────────

describe('Exchange filter (Option B)', () => {
  describe('filterProducts', () => {
    it('returns all products when filter is empty', () => {
      expect(filterProducts(products, '')).toHaveLength(4);
    });

    it('returns all products when filter is only whitespace', () => {
      expect(filterProducts(products, '   ')).toHaveLength(4);
    });

    it('filters case-insensitively by name', () => {
      const result = filterProducts(products, 'GUITAR');
      expect(result).toHaveLength(2);
      expect(result.map(p => p.name)).toContain('Guitar');
      expect(result.map(p => p.name)).toContain('Bass Guitar');
    });

    it('returns empty array when no match', () => {
      expect(filterProducts(products, 'xylophone')).toHaveLength(0);
    });

    it('matches partial name', () => {
      expect(filterProducts(products, 'drum')).toHaveLength(1);
      expect(filterProducts(products, 'drum')[0].name).toBe('Drums');
    });
  });

  describe('exchangeEmptyState', () => {
    it('returns no_products when user has no products', () => {
      expect(exchangeEmptyState([], [])).toBe('no_products');
    });

    it('returns no_filter_results when filter matches nothing', () => {
      expect(exchangeEmptyState(products, [])).toBe('no_filter_results');
    });

    it('returns ok when products exist and filter has results', () => {
      expect(exchangeEmptyState(products, [products[0]])).toBe('ok');
    });

    it('returns ok when no filter is active (filtered = all)', () => {
      expect(exchangeEmptyState(products, products)).toBe('ok');
    });
  });

  describe('splitByCategory', () => {
    it('puts target category products first', () => {
      const { sameCategory, otherProducts } = splitByCategory(products, 1);
      expect(sameCategory).toHaveLength(2);
      expect(otherProducts).toHaveLength(2);
      expect(sameCategory.every(p => p.category_id === 1)).toBe(true);
    });

    it('returns all as otherProducts when target category is undefined', () => {
      const { sameCategory, otherProducts } = splitByCategory(products, undefined);
      expect(sameCategory).toHaveLength(0);
      expect(otherProducts).toHaveLength(4);
    });

    it('handles empty product list', () => {
      const { sameCategory, otherProducts } = splitByCategory([], 1);
      expect(sameCategory).toHaveLength(0);
      expect(otherProducts).toHaveLength(0);
    });
  });
});

// ─── Loan button guard tests ──────────────────────────────────────────────────

describe('Loan button guard (Option B)', () => {
  it('is disabled when mutation is pending', () => {
    expect(isLoanButtonDisabled(true)).toBe(true);
  });

  it('is enabled when mutation is not pending', () => {
    expect(isLoanButtonDisabled(false)).toBe(false);
  });
});
