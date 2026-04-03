/**
 * Mutation Hooks - For create, update, delete operations
 * 
 * Replaces Redux actions: addProduct, updateProduct, addCategory, etc.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useContext } from 'react';
import { queryKeys } from './queryKeys';
import UserContext from '../../context/UserContext';

// API imports
import { 
  createCategory, 
  type CreateCategoryInput 
} from '../../api/categories.api';
import { 
  createSubcategory, 
  type CreateSubcategoryInput 
} from '../../api/subcategories.api';
import { 
  createProduct, 
  addProductToUser,
  updateProductCost,
  type CreateProductInput,
} from '../../api/products.api';
import {
  loginUser as loginUserApi,
  registerUser as registerUserApi,
  approveUserRequest,
  type RegisterUserInput,
} from '../../api/users.api';
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
} from '../../api/friends.api';
import {
  createExchangeRequest,
  deleteExchangeRequest,
  type CreateExchangeInput,
} from '../../api/exchanges.api';
import {
  createLoanRequest,
  deleteLoanRequest,
  type CreateLoanInput,
} from '../../api/loans.api';
import {
  createPurchaseRequest,
  deletePurchaseRequest,
  type CreatePurchaseInput,
} from '../../api/purchases.api';

import type User from '../../components/types/User';
import type Product from '../../components/types/Product';

// ============ CATEGORY MUTATIONS ============

/**
 * Add a new category
 * Replaces: addCategory, addCategoryHook
 */
export const useAddCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateCategoryInput) => createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
};

// ============ SUBCATEGORY MUTATIONS ============

/**
 * Add a new subcategory
 * Replaces: addSubCategory, addSubCategoryHook
 */
export const useAddSubcategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateSubcategoryInput) => createSubcategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subcategories.all });
    },
  });
};

// ============ PRODUCT MUTATIONS ============

/**
 * Add a new product and associate with user
 * Replaces: addProduct, addProductHook
 */
export const useAddProduct = () => {
  const queryClient = useQueryClient();
  const { user } = useContext(UserContext);
  
  return useMutation({
    mutationFn: async (productData: CreateProductInput) => {
      // 1. Create the product
      const product = await createProduct(productData);
      
      // 2. Associate with user
      if (user?.id && product.id) {
        await addProductToUser({
          id_stuffier: user.id,
          id_stuff: product.id,
          cost: productData.cost,
        });
      }
      
      return product;
    },
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.products.all(user.id) 
        });
      }
    },
  });
};

/**
 * Add an existing product to user's collection
 * Replaces: addRegisteredProduct, addRegisteredProductHook
 */
export const useAddExistingProduct = () => {
  const queryClient = useQueryClient();
  const { user } = useContext(UserContext);
  
  return useMutation({
    mutationFn: async (product: Product) => {
      if (!user?.id || !product.id) {
        throw new Error('User and product IDs required');
      }
      await addProductToUser({
        id_stuffier: user.id,
        id_stuff: product.id,
      });
      return product;
    },
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.products.all(user.id) 
        });
      }
    },
  });
};

/**
 * Update product cost
 * Replaces: updateProduct, updateProductHook
 */
export const useUpdateProductCost = () => {
  const queryClient = useQueryClient();
  const { user } = useContext(UserContext);
  
  return useMutation({
    mutationFn: ({ productId, cost }: { productId: number; cost: number }) => {
      if (!user?.id) throw new Error('User ID required');
      return updateProductCost(user.id, productId, cost);
    },
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.products.all(user.id) 
        });
      }
    },
  });
};

// ============ USER/AUTH MUTATIONS ============

/**
 * Login user
 * Replaces: loginUser, loginUserHook
 */
export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => 
      loginUserApi(email, password),
    onSuccess: (user) => {
      if (user?.email) {
        // Store in query cache for persistence
        queryClient.setQueryData(queryKeys.user.current(user.email), user);
      }
    },
  });
};

/**
 * Register user
 * Replaces: registerUser, registerUserHook
 */
export const useRegister = () => {
  return useMutation({
    mutationFn: (userData: RegisterUserInput) => registerUserApi(userData),
  });
};

/**
 * Approve user registration request (admin)
 * Replaces: deleteRequest, deleteRequestHook
 */
export const useApproveUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (user: User) => approveUserRequest(user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.requests() });
    },
  });
};

// ============ FRIEND MUTATIONS ============

/**
 * Send friend request
 * Replaces: requestToBeFriend
 */
export const useSendFriendRequest = () => {
  const { user } = useContext(UserContext);
  
  return useMutation({
    mutationFn: (targetEmail: string) => {
      if (!user?.id) throw new Error('User ID required');
      return sendFriendRequest(targetEmail, user.id);
    },
  });
};

/**
 * Accept friend request
 */
export const useAcceptFriendRequest = () => {
  const queryClient = useQueryClient();
  const { user } = useContext(UserContext);
  
  return useMutation({
    mutationFn: (friendId: number) => {
      if (!user?.email) throw new Error('User email required');
      return acceptFriendRequest(user.email, friendId);
    },
    onSuccess: () => {
      if (user?.email) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.friends.all(user.email) 
        });
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.friends.requests(user.email) 
        });
      }
    },
  });
};

/**
 * Reject friend request
 */
export const useRejectFriendRequest = () => {
  const queryClient = useQueryClient();
  const { user } = useContext(UserContext);
  
  return useMutation({
    mutationFn: (friendId: number) => {
      if (!user?.email) throw new Error('User email required');
      return rejectFriendRequest(user.email, friendId);
    },
    onSuccess: () => {
      if (user?.email) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.friends.requests(user.email) 
        });
      }
    },
  });
};

// ============ EXCHANGE MUTATIONS ============

/**
 * Create exchange request
 * Replaces: exchangeRequest, requestExchangeHook
 */
export const useCreateExchange = () => {
  const queryClient = useQueryClient();
  const { user } = useContext(UserContext);
  
  return useMutation({
    mutationFn: (data: CreateExchangeInput) => createExchangeRequest(data),
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.exchanges.all(user.id) 
        });
      }
    },
  });
};

/**
 * Delete/Accept/Reject exchange request
 * Replaces: deleteRequest (exchange)
 */
export const useDeleteExchange = () => {
  const queryClient = useQueryClient();
  const { user } = useContext(UserContext);
  
  return useMutation({
    mutationFn: (_id: string) => deleteExchangeRequest(_id),
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.exchanges.all(user.id) 
        });
      }
    },
  });
};

// ============ LOAN MUTATIONS ============

/**
 * Create loan request
 * Replaces: loanRequest, loanRequestHook
 */
export const useCreateLoan = () => {
  const queryClient = useQueryClient();
  const { user } = useContext(UserContext);
  
  return useMutation({
    mutationFn: (data: CreateLoanInput) => createLoanRequest(data),
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.loans.all(user.id) 
        });
      }
    },
  });
};

/**
 * Delete/Accept/Reject loan request
 * Replaces: deleteRequestLoan
 */
export const useDeleteLoan = () => {
  const queryClient = useQueryClient();
  const { user } = useContext(UserContext);
  
  return useMutation({
    mutationFn: (_id: string) => deleteLoanRequest(_id),
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.loans.all(user.id) 
        });
      }
    },
  });
};

// ============ PURCHASE MUTATIONS ============

/**
 * Create a buy/purchase request
 */
export const useCreatePurchase = () => {
  const queryClient = useQueryClient();
  const { user } = useContext(UserContext);

  return useMutation({
    mutationFn: (data: CreatePurchaseInput) => createPurchaseRequest(data),
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.purchases.all(user.id),
        });
      }
    },
  });
};

/**
 * Delete/Accept/Reject purchase request
 */
export const useDeletePurchase = () => {
  const queryClient = useQueryClient();
  const { user } = useContext(UserContext);

  return useMutation({
    mutationFn: (_id: string) => deletePurchaseRequest(_id),
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.purchases.all(user.id),
        });
      }
    },
  });
};
