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
  updateCategory,
  deleteCategory,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from '../../api/categories.api';
import { 
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  type CreateSubcategoryInput,
  type UpdateSubcategoryInput,
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
  getUserByEmail,
  type RegisterUserInput,
} from '../../api/users.api';
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
} from '../../api/friends.api';
import {
  createExchangeRequest,
  deleteExchangeRequest,
  acceptExchangeRequest,
  completeExchangeRequest,
  type CreateExchangeInput,
} from '../../api/exchanges.api';
import {
  createLoanRequest,
  deleteLoanRequest,
  acceptLoanRequest,
  requestReturnLoan,
  completeLoanRequest,
  type CreateLoanInput,
} from '../../api/loans.api';
import {
  createPurchaseRequest,
  deletePurchaseRequest,
  acceptPurchaseRequest,
  completePurchaseRequest,
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

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ _id, data }: { _id: string; data: UpdateCategoryInput }) => updateCategory(_id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (_id: string) => deleteCategory(_id),
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

export const useUpdateSubcategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ _id, data }: { _id: string; data: UpdateSubcategoryInput }) => updateSubcategory(_id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subcategories.all });
    },
  });
};

export const useDeleteSubcategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (_id: string) => deleteSubcategory(_id),
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
          user_id: user.id,
          item_id: product.id,
          asking_price: productData.cost,
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
      // Invalidate pending products so Admin page reflects the new product immediately
      queryClient.invalidateQueries({
        queryKey: queryKeys.products.pending(),
      });
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
        user_id: user.id,
        item_id: product.id,
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
  const queryClient = useQueryClient();
  const { user } = useContext(UserContext);

  return useMutation({
    mutationFn: async (targetEmail: string) => {
      if (!user?.id) throw new Error('User ID required');
      const target = await getUserByEmail(targetEmail);
      if (!target?.id) throw new Error('User not found');
      return sendFriendRequest(target.id, user.id);
    },
    onSuccess: () => {
      if (user?.email) {
        queryClient.invalidateQueries({
          queryKey: [...queryKeys.friends.requests(user.email), 'sent'],
        });
      }
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
      if (!user?.id) throw new Error('User ID required');
      return acceptFriendRequest(user.id, friendId);
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
      if (!user?.id) throw new Error('User ID required');
      return rejectFriendRequest(user.id, friendId);
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

/**
 * Cancel a sent (outgoing) friend request
 */
export const useCancelFriendRequest = () => {
  const queryClient = useQueryClient();
  const { user } = useContext(UserContext);

  return useMutation({
    mutationFn: (requestId: string) => cancelFriendRequest(requestId),
    onSuccess: () => {
      if (user?.email) {
        queryClient.invalidateQueries({
          queryKey: [...queryKeys.friends.requests(user.email), 'sent'],
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

/**
 * Accept exchange request — sets status to 'accepted'
 */
export const useAcceptExchange = () => {
  const queryClient = useQueryClient();
  const { user } = useContext(UserContext);

  return useMutation({
    mutationFn: (_id: string) => acceptExchangeRequest(_id),
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.exchanges.all(user.id),
        });
      }
    },
  });
};

/**
 * Complete exchange — triggers ownership swap on the backend
 */
export const useCompleteExchange = () => {
  const queryClient = useQueryClient();
  const { user } = useContext(UserContext);

  return useMutation({
    mutationFn: (_id: string) => completeExchangeRequest(_id),
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.exchanges.all(user.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.products.all(user.id) });
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

/**
 * Accept loan request — calls backend to set status 'active' + mark item on_loan
 */
export const useAcceptLoan = () => {
  const queryClient = useQueryClient();
  const { user } = useContext(UserContext);

  return useMutation({
    mutationFn: (_id: string) => acceptLoanRequest(_id),
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.loans.all(user.id),
        });
      }
    },
  });
};

/**
 * Request return of a loaned item (borrower signals returning)
 */
export const useRequestReturnLoan = () => {
  const queryClient = useQueryClient();
  const { user } = useContext(UserContext);

  return useMutation({
    mutationFn: (_id: string) => requestReturnLoan(_id),
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.loans.all(user.id) });
      }
    },
  });
};

/**
 * Complete a loan — owner confirms item returned, restores on_loan flags
 */
export const useCompleteLoan = () => {
  const queryClient = useQueryClient();
  const { user } = useContext(UserContext);

  return useMutation({
    mutationFn: (_id: string) => completeLoanRequest(_id),
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.loans.all(user.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.products.all(user.id) });
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

/**
 * Accept purchase request — sets status to 'accepted'
 */
export const useAcceptPurchase = () => {
  const queryClient = useQueryClient();
  const { user } = useContext(UserContext);

  return useMutation({
    mutationFn: (_id: string) => acceptPurchaseRequest(_id),
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
 * Complete a purchase — triggers ownership transfer on the backend
 */
export const useCompletePurchase = () => {
  const queryClient = useQueryClient();
  const { user } = useContext(UserContext);

  return useMutation({
    mutationFn: (_id: string) => completePurchaseRequest(_id),
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.purchases.all(user.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.products.all(user.id) });
      }
    },
  });
};
