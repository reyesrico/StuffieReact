import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import Loading from '../shared/Loading';
import Main from './Main';
import State from '../../redux/State';
import User from '../types/User';
// import { FetchDataProps } from './types';

import { dispatchCategoriesFetched, fetchCategoriesHook } from '../../redux/categories/actions';
import { dispatchFriendsFetched, fetchFriendsHook } from '../../redux/friends/actions';
import { fetchFriendsRequestsHook } from '../../redux/friends-requests/actions';
import { dispatchProductsFetched, fetchProductsHook } from '../../redux/products/actions';
import { dispatchSubCategoriesFetched, fetchSubCategoriesHook } from '../../redux/subcategories/actions';
import { fetchExchangeRequestsHook } from '../../redux/exchange-requests/actions';
import { fetchLoanRequestsHook } from '../../redux/loan-requests/actions';
import { dispatchPedingProducts, fetchPendingProductsHook } from '../../redux/pending-products/actions';
// import { fetchSpotify } from '../../redux/spotify/actions';

import './FetchData.scss';
import Category from '../types/Category';
import UserContext from '../../context/UserContext';

const elementActions = {
  categories: { dispatch: dispatchCategoriesFetched, fetchHook: fetchCategoriesHook },
  products: { dispatch: dispatchProductsFetched, fetchHook: fetchProductsHook },
  subcategories: { dispatch: dispatchSubCategoriesFetched, fetchHook: fetchSubCategoriesHook },
  friends: { dispatch: dispatchFriendsFetched, fetchHook: fetchFriendsHook },
};

const sessionOrHookAction = (
  key: keyof typeof elementActions,
  params: {
    dispatch?: string[],
    hook?: string[],
  } | null,
  dispatch: Function
) => {
  const { dispatch: dispatchHook, fetchHook } = elementActions[key];

  if (window.sessionStorage.getItem(key) && params?.dispatch) {
    let data = JSON.parse(window.sessionStorage.getItem(key) || '');
    return dispatchHook(data, ...params.dispatch, dispatch);
  } else if (window.sessionStorage.getItem(key)) {
    let data = JSON.parse(window.sessionStorage.getItem(key) || '');
    return dispatchHook(data, dispatch);
  } else {
    if (params?.hook) {
      return fetchHook(...params.hook, window.sessionStorage, dispatch);
    } else {
      return fetchHook(window.sessionStorage, dispatch);
    }
  }
}

const fetchBasis = (user: User, sessionStorage: Storage, dispatch: Function) => {
  if (sessionStorage.getItem('categories')) {
    let cats = JSON.parse(sessionStorage.getItem('categories') || '');
    dispatchCategoriesFetched(cats, dispatch);
  } else {
    fetchCategoriesHook(sessionStorage, dispatch);
  }

  if (sessionStorage.getItem('subcategories')) {
    let subcats = JSON.parse(sessionStorage.getItem('subcategories') || '');
    dispatchSubCategoriesFetched(subcats, dispatch);
  } else {
    fetchSubCategoriesHook(sessionStorage, dispatch);
  }

  if (sessionStorage.getItem('friends')) {
    let friends = JSON.parse(sessionStorage.getItem('friends') || '');
    dispatchFriendsFetched(friends, user.email, dispatch);
  } else {
    fetchFriendsHook(user.email, sessionStorage, dispatch);
  }
}

const fetchAdmin = (sessionStorage: Storage, dispatch: Function) => {
  let hookPromises = [];

  if (sessionStorage.getItem('user-requests')) {
    let uRequests = JSON.parse(sessionStorage.getItem('user-requests') || '');
    dispatchSubCategoriesFetched(uRequests, dispatch);
  } else {
    hookPromises.push(fetchSubCategoriesHook);
  }

  if (sessionStorage.getItem('products-requests')) {
    let pRequests = JSON.parse(sessionStorage.getItem('products-requests') || '');
    dispatchPedingProducts(pRequests, dispatch);
  } else {
    hookPromises.push(fetchPendingProductsHook);
  }

  if (hookPromises.length) {
    hookPromises.forEach(p => p(sessionStorage, dispatch));
  }
}



const FetchData = () => {
  const { user: userContextValue } = useContext(UserContext);
  const [user, setUser] = useState(userContextValue);
  // const exchangeRequests = useSelector((state: State) => state.exchangeRequests);
  // const friendsRequests = useSelector((state: State) => state.friendsRequests);
  // const loanRequests = useSelector((state: State) => state.loanRequests);
  const dispatch = useDispatch();

  const { isLoading: isLoadingCategories, data: cats } = useQuery({
    queryKey: ['categories'],
    queryFn: () => sessionOrHookAction('categories', null, dispatch),
  });
  const { isLoading: isLoadingSubCategories } = useQuery({
    queryKey: ['subcategories'],
    queryFn: () => sessionOrHookAction('subcategories', null, dispatch),
  });
  const { isLoading: isLoadingFriends } = useQuery({
    queryKey: ['friends'],
    queryFn: () => sessionOrHookAction('friends', {
      hook: [user.email],
    }, dispatch),
    enabled: user.email !== '',
  });

  const categories = useSelector((state: State) => state.categories);
  const subcategories = useSelector((state: State) => state.subcategories);
  const products = useSelector((state: State) => state.products);

  const { isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: () => sessionOrHookAction('products', {
      dispatch: [products, user.email],
      hook: [user, categories],
    }, dispatch),
    enabled: categories.length > 0 && user.email !== '',
  });

  console.log({ cats });

  // Admin
  const stableFetchAdmin = useCallback(fetchAdmin, []);
  // Data not critical
  const stableFetchFriendsRequests = useCallback(fetchFriendsRequestsHook, []);
  const stableFetchExchangeRequests = useCallback(fetchExchangeRequestsHook, []);
  const stableFetchLoanRequests = useCallback(fetchLoanRequestsHook, []);

  const { t } = useTranslation();

  // Forcing getting new userContextValue
  useEffect(() => {
    setUser(userContextValue);
  }, [userContextValue]);


  // useEffect(() => {
  //   let sessionStorage = window.sessionStorage;
  //   if (user.admin) {
  //     stableFetchAdmin(sessionStorage, dispatch);
  //   }
  // }, [stableFetchAdmin, user, dispatch]);

  // useEffect(() => {
  //   if (categories.length && subcategories.length) {
  //     stableFetchFriendsRequests(user.email, dispatch);
  //   }
  // }, [])

  // useEffect(() => {
  //   if (categories.length && subcategories.length) {
  //     stableFetchExchangeRequests(user.id, dispatch);
  //   }
  // }, [])

  // useEffect(() => {
  //   if (categories.length && subcategories.length) {
  //     stableFetchLoanRequests(user.id, dispatch);
  //   }
  // }, [])

  // fetchSpotify

  if (isLoadingCategories || isLoadingSubCategories || isLoadingFriends || isLoadingProducts) {
    return (
      <div className="fetch-data__loading">
        <Loading size="xl" message={t('Loading-data')} />
      </div>
    );
  }

  return (<Main />);
}

export default FetchData;
