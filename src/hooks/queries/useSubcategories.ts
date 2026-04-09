/**
 * useSubcategories - Query hook for subcategories
 * 
 * Replaces Redux: fetchSubCategories, fetchSubCategoriesHook, fetchSubCategoriesHookWithSubCategories
 */
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import { getSubcategories, getSubcategory } from '../../api/subcategories.api';
import type Subcategory from '../../components/types/Subcategory';

/**
 * Fetch all subcategories
 * 
 * @example
 * const { data: subcategories, isLoading } = useSubcategories();
 */
export const useSubcategories = () => {
  return useQuery({
    queryKey: queryKeys.subcategories.all,
    queryFn: getSubcategories,
    staleTime: 5 * 60 * 1000, // 5 min — allows new subcategories to appear without clearing cache
  });
};

/**
 * Fetch single subcategory by id
 */
export const useSubcategory = (id: number) => {
  return useQuery({
    queryKey: queryKeys.subcategories.byCategory(id),
    queryFn: () => getSubcategory(id),
    enabled: !!id,
  });
};

/**
 * Hook to prefetch subcategories
 */
export const usePrefetchSubcategories = () => {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.subcategories.all,
      queryFn: getSubcategories,
    });
  };
};

/**
 * Hook to get subcategories data directly
 */
export const useGetSubcategoriesData = () => {
  const queryClient = useQueryClient();
  
  return (): Subcategory[] | undefined => {
    return queryClient.getQueryData(queryKeys.subcategories.all);
  };
};

export default useSubcategories;
