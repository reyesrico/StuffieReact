/**
 * Suspense-enabled query hooks
 * 
 * These hooks use useSuspenseQuery which:
 * - Automatically suspends while loading (no need for isLoading checks)
 * - Works with React Suspense boundaries
 * - Returns data directly (never undefined after suspense resolves)
 * 
 * Use these hooks inside components wrapped with <Suspense> boundaries
 */
import { useSuspenseQuery } from '@tanstack/react-query';
import { useContext } from 'react';
import { queryKeys } from './queryKeys';
import { getCategories } from '../../api/categories.api';
import { getSubcategories } from '../../api/subcategories.api';
import { getUserProducts, getProductsByIds, getPendingProducts } from '../../api/products.api';
import { getFriends, getFriendRequests } from '../../api/friends.api';
import { getExchangeRequests } from '../../api/exchanges.api';
import { getLoanRequests } from '../../api/loans.api';
import { mapStuff, getProductsMap, mapCostToProducts } from '../../components/helpers/StuffHelper';
import UserContext from '../../context/UserContext';
import type ProductsMap from '../../components/types/ProductsMap';
import type Category from '../../components/types/Category';

/**
 * Suspense-enabled categories hook
 * Component will suspend until categories are loaded
 */
export function useCategoriesSuspense() {
  return useSuspenseQuery({
    queryKey: queryKeys.categories.all,
    queryFn: getCategories,
  });
}

/**
 * Suspense-enabled subcategories hook
 */
export function useSubcategoriesSuspense() {
  return useSuspenseQuery({
    queryKey: queryKeys.subcategories.all,
    queryFn: getSubcategories,
  });
}

/**
 * Suspense-enabled products hook
 * Requires categories to be loaded first (use in sequence)
 */
export function useProductsSuspense(categories: Category[]) {
  const { user } = useContext(UserContext);
  
  return useSuspenseQuery({
    queryKey: queryKeys.products.all(user?.id || 0),
    queryFn: async (): Promise<ProductsMap> => {
      if (!user?.id || !categories?.length) {
        return {};
      }
      
      const stuffList = await getUserProducts(user.id);
      
      if (stuffList.length === 0) {
        return getProductsMap(categories, []);
      }
      
      const productIds = mapStuff(stuffList);
      const products = await getProductsByIds(productIds);
      const productsWithCost = mapCostToProducts(products, stuffList);
      return getProductsMap(categories, productsWithCost);
    },
  });
}

/**
 * Suspense-enabled friends hook
 */
export function useFriendsSuspense() {
  const { user } = useContext(UserContext);
  
  return useSuspenseQuery({
    queryKey: queryKeys.friends.all(user?.email || ''),
    queryFn: () => getFriends(user!.email),
  });
}

/**
 * Suspense-enabled friend requests hook
 */
export function useFriendRequestsSuspense() {
  const { user } = useContext(UserContext);
  
  return useSuspenseQuery({
    queryKey: queryKeys.friends.requests(user?.email || ''),
    queryFn: () => getFriendRequests(user!.email),
  });
}

/**
 * Suspense-enabled exchanges hook
 */
export function useExchangesSuspense() {
  const { user } = useContext(UserContext);
  
  return useSuspenseQuery({
    queryKey: queryKeys.exchanges.all(user?.id || 0),
    queryFn: () => getExchangeRequests(user!.id),
  });
}

/**
 * Suspense-enabled loans hook
 */
export function useLoansSuspense() {
  const { user } = useContext(UserContext);
  
  return useSuspenseQuery({
    queryKey: queryKeys.loans.all(user?.id || 0),
    queryFn: () => getLoanRequests(user!.id),
  });
}

/**
 * Suspense-enabled pending products hook (admin only)
 */
export function usePendingProductsSuspense() {
  return useSuspenseQuery({
    queryKey: queryKeys.products.pending(),
    queryFn: getPendingProducts,
  });
}
