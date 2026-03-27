/**
 * API Layer - Barrel Export
 * 
 * Centralized exports for all API modules.
 * Import from here for consistent API access.
 * 
 * @example
 * import { categoriesApi, productsApi, usersApi } from '@/api';
 * 
 * const categories = await categoriesApi.list();
 * const user = await usersApi.login(email, password);
 */

// Client & Endpoints
export { apiClient, default as client } from './client';
export { endpoints, default as defaultEndpoints } from './endpoints';

// Individual endpoint exports
export {
  categoryEndpoints,
  subcategoryEndpoints,
  productEndpoints,
  stuffiersStuffEndpoints,
  userEndpoints,
  friendsEndpoints,
  friendRequestEndpoints,
  exchangeEndpoints,
  loanEndpoints,
  configEndpoints,
} from './endpoints';

// API modules
export { categoriesApi, default as categories } from './categories.api';
export { subcategoriesApi, default as subcategories } from './subcategories.api';
export { productsApi, default as products } from './products.api';
export { usersApi, default as users } from './users.api';
export { friendsApi, default as friends } from './friends.api';
export { exchangesApi, default as exchanges } from './exchanges.api';
export { loansApi, default as loans } from './loans.api';

// Re-export individual functions for convenience
export {
  getCategories,
  getCategory,
  createCategory,
  deleteCategory,
} from './categories.api';

export {
  getSubcategories,
  getSubcategory,
  createSubcategory,
  deleteSubcategory,
} from './subcategories.api';

export {
  getProducts,
  getProduct,
  getProductsByIds,
  getProductsByCategory,
  getPendingProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getUserProducts,
  getProductsForUsers,
  addProductToUser,
  updateUserProduct,
  updateProductCost,
  removeProductFromUser,
} from './products.api';

export {
  getUsers,
  getUserByEmail,
  getUsersByIds,
  getPendingUserRequests,
  getLastUserId,
  loginUser,
  registerUser,
  updateUser,
  approveUserRequest,
  deleteUser,
} from './users.api';

export {
  getFriends,
  getFriendRelations,
  addFriend,
  removeFriend,
  getFriendRequests,
  getFriendRequest,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  deleteFriendRequest,
} from './friends.api';

export {
  getExchangeRequests,
  createExchangeRequest,
  deleteExchangeRequest,
  acceptExchangeRequest,
  rejectExchangeRequest,
  cancelExchangeRequest,
} from './exchanges.api';

export {
  getLoanRequests,
  createLoanRequest,
  deleteLoanRequest,
  acceptLoanRequest,
  rejectLoanRequest,
  cancelLoanRequest,
  returnLoanedItem,
} from './loans.api';

// Types re-exports for convenience
export type { CreateCategoryInput } from './categories.api';
export type { CreateSubcategoryInput } from './subcategories.api';
export type { 
  CreateProductInput, 
  UpdateProductInput, 
  AddProductToUserInput, 
  UpdateUserProductInput 
} from './products.api';
export type { RegisterUserInput, UpdateUserInput } from './users.api';
export type { CreateExchangeInput } from './exchanges.api';
export type { CreateLoanInput } from './loans.api';
