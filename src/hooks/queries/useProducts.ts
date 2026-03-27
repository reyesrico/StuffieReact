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
import { getUserProducts, getProductsByIds, getPendingProducts } from '../../api/products.api';
import { useCategories } from './useCategories';
import { mapStuff, getProductsMap, mapCostToProducts } from '../../components/helpers/StuffHelper';
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
      if (!user?.id || !categories?.length) {
        return {};
      }
      
      // 1. Get user's stuffiers_stuff records (contains cost)
      const stuffList = await getUserProducts(user.id);
      
      if (stuffList.length === 0) {
        // Return empty products map with category keys
        return getProductsMap(categories, []);
      }
      
      // 2. Get product details for those IDs
      const productIds = mapStuff(stuffList);
      const products = await getProductsByIds(productIds);
      
      // 3. Map costs to products and organize by category
      const productsWithCost = mapCostToProducts(products, stuffList);
      return getProductsMap(categories, productsWithCost);
    },
    enabled: !!(user?.id && categories?.length),
  });
};

/**
 * Fetch products for a specific user (used for viewing others' products)
 */
export const useUserProducts = (userId: number, categories: Category[]) => {
  return useQuery({
    queryKey: queryKeys.products.all(userId),
    queryFn: async (): Promise<ProductsMap> => {
      if (!userId || !categories?.length) {
        return {};
      }
      
      const stuffList = await getUserProducts(userId);
      
      if (stuffList.length === 0) {
        return getProductsMap(categories, []);
      }
      
      const productIds = mapStuff(stuffList);
      const products = await getProductsByIds(productIds);
      const productsWithCost = mapCostToProducts(products, stuffList);
      
      return getProductsMap(categories, productsWithCost);
    },
    enabled: !!(userId && categories?.length),
  });
};

/**
 * Fetch pending products (admin only - products without images)
 */
export const usePendingProducts = () => {
  return useQuery({
    queryKey: queryKeys.products.pending(),
    queryFn: getPendingProducts,
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
