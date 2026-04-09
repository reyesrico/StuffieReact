/**
 * useCategories - Query hook for categories
 * 
 * Replaces Redux: fetchCategories, fetchCategoriesHook, fetchCategoriesHookWithCategories
 */
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import { getCategories, getCategory } from '../../api/categories.api';
import type Category from '../../components/types/Category';

/**
 * Fetch all categories
 * 
 * @example
 * const { data: categories, isLoading } = useCategories();
 */
export const useCategories = () => {
  return useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000, // 5 min — same as useSubcategories
  });
};

/**
 * Fetch single category by id
 */
export const useCategory = (id: number) => {
  return useQuery({
    queryKey: queryKeys.categories.detail(id),
    queryFn: () => getCategory(id),
    enabled: !!id,
  });
};

/**
 * Hook to prefetch categories (for SSR or eager loading)
 */
export const usePrefetchCategories = () => {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.categories.all,
      queryFn: getCategories,
    });
  };
};

/**
 * Hook to get categories data directly (for use in callbacks)
 * This returns a function that gets the cached data
 */
export const useGetCategoriesData = () => {
  const queryClient = useQueryClient();
  
  return (): Category[] | undefined => {
    return queryClient.getQueryData(queryKeys.categories.all);
  };
};

export default useCategories;
