/**
 * useProducts - Query hook for products
 * 
 * Replaces Redux: fetchProducts, fetchProductsHook, fetchProductsHookWithProducts
 * 
 * Products require:
 * 1. User ID to fetch user's products
 * 2. Categories to organize products by category
 */
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useContext } from 'react';
import { queryKeys } from './queryKeys';
import { getUserProductsJoined, getPendingProducts } from '../../api/products.api';
import { getProductsMap } from '../../components/helpers/StuffHelper';
import { useCategories } from './useCategories';
import UserContext from '../../context/UserContext';
import type ProductsMap from '../../components/types/ProductsMap';
import type Category from '../../components/types/Category';

/**
 * Fetch user's products organized by category
 * 
 * @example
 * const { data: products, isLoading } = useProducts();
 * // products is a ProductsMap: { [categoryId]: Product[] }
 */
export const useProducts = () => {
  const { user } = useContext(UserContext);
  const { data: categories } = useCategories();
  
  return useQuery({
    queryKey: queryKeys.products.all(user?.id || 0),
    queryFn: async (): Promise<ProductsMap> => {
      if (!user?.id || !categories?.length) return {};
      // Phase 4: single server-side join call (replaces 3-call pipeline)
      const products = await getUserProductsJoined(user.id);
      return getProductsMap(categories, products);
    },
    enabled: !!(user?.id && categories?.length),
    staleTime: 1000 * 60 * 5, // 5 min — mutations invalidate on any change
  });
};

/**
 * Fetch products for a specific user (used for viewing others' products)
 */
export const useUserProducts = (userId: number, categories: Category[]) => {
  return useQuery({
    queryKey: ['friends', userId, 'products'] as const,
    queryFn: async (): Promise<ProductsMap> => {
      if (!userId || !categories?.length) return {};
      // Phase 4: single server-side join call
      const products = await getUserProductsJoined(userId);
      return getProductsMap(categories, products);
    },
    enabled: !!(userId && categories?.length),
    staleTime: 0,
    refetchOnMount: true,
  });
};

/**
 * Fetch pending products (admin only - products without images)
 */
export const usePendingProducts = () => {
  return useQuery({
    queryKey: queryKeys.products.pending(),
    queryFn: getPendingProducts,
    staleTime: 1000 * 60 * 5, // 5 min — admin data
  });
};

/**
 * Hook to get products data directly from cache
 */
export const useGetProductsData = () => {
  const queryClient = useQueryClient();
  const { user } = useContext(UserContext);
  
  return (): ProductsMap | undefined => {
    return queryClient.getQueryData(queryKeys.products.all(user?.id || 0));
  };
};

/**
 * Hook to invalidate products cache (triggers refetch)
 */
export const useInvalidateProducts = () => {
  const queryClient = useQueryClient();
  const { user } = useContext(UserContext);
  
  return () => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.products.all(user?.id || 0),
    });
  };
};

export default useProducts;
