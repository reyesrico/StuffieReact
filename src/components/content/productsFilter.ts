import type Product from '../types/Product';
import type Category from '../types/Category';

export type SortBy = 'nameAsc' | 'nameDesc' | 'priceAsc' | 'priceDesc';

export interface ProductsMap {
  [categoryId: number]: Product[];
}

export function applyFiltersAndSort(
  productsMap: ProductsMap,
  categories: Category[],
  filterText: string,
  filterCategoryId: number | null,
  filterForSale: boolean,
  sortBy: SortBy,
): Array<{ category: Category; groups: Product[][] }> {
  return categories
    .filter(cat => {
      if (filterCategoryId !== null && cat.id !== filterCategoryId) return false;
      return productsMap[cat.id as number]?.length > 0;
    })
    .map(cat => {
      const allInCategory: Product[] = productsMap[cat.id as number];
      const byName = new Map<string, Product[]>();
      allInCategory.forEach(p => {
        const key = (p.name ?? '').toLowerCase();
        if (!byName.has(key)) byName.set(key, []);
        byName.get(key)!.push(p);
      });
      const lowerFilter = filterText.trim().toLowerCase();
      const groups = Array.from(byName.values())
        .filter(copies => {
          if (lowerFilter && !copies[0].name?.toLowerCase().includes(lowerFilter)) return false;
          if (filterForSale && !copies.some(p => (p.cost ?? 0) > 0)) return false;
          return true;
        })
        .sort((a, b) => {
          const aName = (a[0].name ?? '').toLowerCase();
          const bName = (b[0].name ?? '').toLowerCase();
          const aCost = Math.max(...a.map(p => p.cost ?? 0));
          const bCost = Math.max(...b.map(p => p.cost ?? 0));
          if (sortBy === 'nameAsc') return aName.localeCompare(bName);
          if (sortBy === 'nameDesc') return bName.localeCompare(aName);
          if (sortBy === 'priceAsc') return aCost - bCost;
          if (sortBy === 'priceDesc') return bCost - aCost;
          return 0;
        });
      return { category: cat, groups };
    })
    .filter(({ groups }) => groups.length > 0);
}
