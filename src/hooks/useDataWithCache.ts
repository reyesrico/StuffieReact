/**
 * Custom hooks for fetching and caching products and user data
 */
import { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useCachedData } from './useCachedData';
import { CACHE_KEYS, CACHE_DURATION } from '../utils/cache';
import { getStuffList, getListStuff } from '../services/stuff';
import { getStuffier } from '../services/stuffier';
import { mapStuff, getProductsMap, mapCostToProducts } from '../components/helpers/StuffHelper';
import { dispatchProductsFetched } from '../redux/products/actions';
import State from '../redux/State';
import UserContext from '../context/UserContext';

/**
 * Hook for fetching and caching products with 30-minute expiration
 * 
 * Features:
 * - Displays cached products instantly if available
 * - Refreshes data in background
 * - Falls back to stale cache on API failure
 * - Provides manual refresh function
 * 
 * @example
 * const { data: products, isLoading, isRefreshing, refresh } = useProductsWithCache();
 */
export const useProductsWithCache = () => {
  const dispatch = useDispatch();
  const { user } = useContext(UserContext);
  const categories = useSelector((state: State) => state.categories);
  
  const cacheKey = CACHE_KEYS.PRODUCTS(user?.email || 'anonymous');
  
  return useCachedData({
    cacheKey,
    fetchFn: async () => {
      if (!user || !user.id) {
        throw new Error('User not logged in');
      }
      
      // Fetch stuff list with costs
      const stuffListResponse = await getStuffList(user.id);
      const extraStuff = stuffListResponse.data;
      
      // Fetch product details
      const productDetailsResponse = await getListStuff(mapStuff(extraStuff));
      
      // Map costs to products and organize by category
      const objects = mapCostToProducts(productDetailsResponse.data, extraStuff);
      const products = getProductsMap(categories, objects);
      
      return products;
    },
    expiresIn: CACHE_DURATION.PRODUCTS,
    enabled: !!(user && user.id && categories.length > 0),
    onSuccess: (products) => {
      // Update Redux store when products are fetched
      dispatchProductsFetched(products, user.email, dispatch);
    },
    onError: (error) => {
      console.error('Failed to fetch products:', error);
    },
  });
};

/**
 * Hook for fetching and caching user info with 2-hour expiration
 * 
 * Features:
 * - Displays cached user info instantly if available
 * - Refreshes data in background
 * - Falls back to stale cache on API failure
 * - Provides manual refresh function
 * 
 * @example
 * const { data: userInfo, isLoading, refresh } = useUserInfoWithCache('user@example.com');
 */
export const useUserInfoWithCache = (email: string) => {
  const cacheKey = CACHE_KEYS.USER_INFO(email);
  
  return useCachedData({
    cacheKey,
    fetchFn: async () => {
      if (!email) {
        throw new Error('Email is required');
      }
      
      const response = await getStuffier(email);
      return response.data[0];
    },
    expiresIn: CACHE_DURATION.USER_INFO,
    enabled: !!email,
    onSuccess: (userData) => {
      // You can dispatch user data to Redux if needed
      console.log('User data fetched successfully:', userData.email);
    },
    onError: (error) => {
      console.error('Failed to fetch user info:', error);
    },
  });
};
