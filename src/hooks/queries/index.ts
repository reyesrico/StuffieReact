/**
 * Query Hooks - Barrel Export
 * 
 * Centralized exports for all React Query hooks.
 * These replace Redux actions and provide cached data fetching.
 */

// Query keys
export { queryKeys, default as defaultQueryKeys } from './queryKeys';

// Categories
export { 
  useCategories, 
  useCategory,
  usePrefetchCategories,
  useGetCategoriesData,
} from './useCategories';

// Subcategories
export { 
  useSubcategories, 
  useSubcategory,
  usePrefetchSubcategories,
  useGetSubcategoriesData,
} from './useSubcategories';

// Products
export {
  useProducts,
  useUserProducts,
  usePendingProducts,
  useGetProductsData,
  useInvalidateProducts,
} from './useProducts';

// Friends
export {
  useFriends,
  useFriendsWithProducts,
  useFriendRequests,
  useSentFriendRequests,
  useGetFriendsData,
  useInvalidateFriends,
} from './useFriends';

// Exchanges
export {
  useExchangeRequests,
  useExchanges,
  useGetExchangeRequestsData,
  useInvalidateExchangeRequests,
} from './useExchanges';

// Loans
export {
  useLoanRequests,
  useLoans,
  useGetLoanRequestsData,
  useInvalidateLoanRequests,
} from './useLoans';

// Users (admin)
export { useAllUsers } from './useUsers';

// Purchases
export {
  usePurchaseRequests,
} from './usePurchases';

// User
export {
  useUserByEmail,
  useUserRequests,
  useGetUserData,
  useSetUserData,
  useInvalidateUserRequests,
  useClearUserCache,
} from './useUser';

// Feed
export {
  useFeed,
  useGetFeedData,
} from './useFeed';

// Mutations
export {
  // Categories
  useAddCategory,
  // Subcategories
  useAddSubcategory,
  // Products
  useAddProduct,
  useAddExistingProduct,
  useUpdateProductCost,
  // Auth
  useLogin,
  useRegister,
  useApproveUser,
  // Friends
  useSendFriendRequest,
  useAcceptFriendRequest,
  useRejectFriendRequest,
  // Exchanges
  useCreateExchange,
  useDeleteExchange,
  // Loans
  useCreateLoan,
  useDeleteLoan,
  // Purchases
  useCreatePurchase,
  useDeletePurchase,
} from './mutations';

// Suspense-enabled hooks (for use with React Suspense boundaries)
export {
  useCategoriesSuspense,
  useSubcategoriesSuspense,
  useProductsSuspense,
  useFriendsSuspense,
  useFriendRequestsSuspense,
  useExchangesSuspense,
  useLoansSuspense,
  usePendingProductsSuspense,
} from './useSuspenseQueries';
