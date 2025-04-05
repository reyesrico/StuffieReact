import React, { useContext } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';

import Category from '../types/Category';
import Loading from '../shared/Loading';
import Product from '../types/Product';
import State from '../../redux/State';
import UserContext from '../../context/UserContext';
import { fetchCategoriesHookWithCategories } from '../../redux/categories/actions';
import { fetchSubCategoriesHookWithSubCategories } from '../../redux/subcategories/actions';
import { fetchPendingProductsHookWithPendingProducts } from '../../redux/pending-products/actions';
import { fetchUserRequestsHookWithUserRequests } from '../../redux/user-requests/actions';
import { fetchProductsHookWithProducts } from '../../redux/products/actions';
import { getProductsList, isProductsEmpty } from '../helpers/StuffHelper';

const Test5 = () => {
  const { user } = useContext(UserContext);
  const categories = useSelector((state: State) => state.categories);
  const subcategories = useSelector((state: State) => state.subcategories);
  const products = useSelector((state: State) => state.products);
  const userRequests = useSelector((state: State) => state.userRequests);
  const pendingProducts = useSelector((state: State) => state.pendingProducts);
  const dispatch = useDispatch();

  const { error, data, isFetching } = useQuery({
    queryKey: ['repoData'],
    queryFn: () =>
      axios
        .get('https://api.github.com/repos/tannerlinsley/react-query')
        .then((res) => res.data),
  });

  const { isFetching: isFetchingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: () =>
      fetchCategoriesHookWithCategories(sessionStorage, dispatch),
    enabled: !categories, // Only fetch if categories is not available in the Redux store
    staleTime: 5 * 60 * 1000, // 5 minutes
    // cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // Disable refetching on window focus
  });

  const { isFetching: isFetchingSubCategories } = useQuery({
    queryKey: ['subcategories'],
    queryFn: () =>
      fetchSubCategoriesHookWithSubCategories(sessionStorage, dispatch),
    enabled: !subcategories, // Only fetch if categories is not available in the Redux store
    staleTime: 5 * 60 * 1000, // 5 minutes
    // cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // Disable refetching on window focus
  });

  // Products
  const { isFetching: isFetchingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: () => fetchProductsHookWithProducts(user, categories, sessionStorage, dispatch),
    enabled: isProductsEmpty(products) && (categories.length > 0),
    staleTime: 5 * 60 * 1000, // 5 minutes
    // cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // Disable refetching on window focus
  });

  // Admin
  const { isFetching: isFetchingUserRequests } = useQuery({
    queryKey: ['userRequests'],
    queryFn: () => fetchUserRequestsHookWithUserRequests(sessionStorage, dispatch),
    enabled: user.admin && !userRequests,
    staleTime: 5 * 60 * 1000, // 5 minutes
    // cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // Disable refetching on window focus
  });

  const { isFetching: isFetchingPendingProducts } = useQuery({
    queryKey: ['pendingProducts'],
    queryFn: () => fetchPendingProductsHookWithPendingProducts(sessionStorage, dispatch),
    enabled: user.admin && (!pendingProducts && !isProductsEmpty(products)),
    staleTime: 5 * 60 * 1000, // 5 minutes
    // cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // Disable refetching on window focus
  });
  
  if (isFetching ||
      isFetchingCategories ||
      isFetchingSubCategories ||
      isFetchingProducts ||
      isFetchingUserRequests ||
      isFetchingPendingProducts
    )
      return <Loading size="md" />

  if (error) return <div><span>{'An error has occurred: ' + (error as any).message}</span></div>

  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.description}</p>
      <strong>👀 {data.subscribers_count}</strong>{' '}
      <strong>✨ {data.stargazers_count}</strong>{' '}
      <strong>🍴 {data.forks_count}</strong>
      <hr />
      {categories && (
        <>
        <h2>{"Categories"}</h2>
        {categories.map((category: Category) => (
          <div key={category.id}>{category.name}</div>
        ))}
        </>
      )}
      <hr />
      {subcategories && (
        <>
          <h2>{"Subcategories"}</h2>
          {subcategories.map((subcategory: Category) => (
            <div key={subcategory.id}>{subcategory.name}</div>
          ))}
        </>
      )}
      <hr />
      {products && (
        <>
          <h2>{"Products"}</h2>
          {getProductsList(products).map((product: Product) => (
              <div key={product.id}>{product.name}</div>
            ))
          }
        </>
      )}
      <div>{isFetching ? 'Updating...' : ''}</div>
    </div>
  )
};

export default Test5;
