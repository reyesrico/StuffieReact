import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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


const fetchProducts = (user: User, categories: Category[], setIsLoading: Function, sessionStorage: Storage, dispatch: Function) => {
  if (sessionStorage.getItem('products')) {
    let prods = JSON.parse(sessionStorage.getItem('products') || '');
    dispatchProductsFetched(prods, user.email, dispatch);
    setIsLoading(false);
  } else if (categories.length) {
    fetchProductsHook(user, categories, setIsLoading, sessionStorage, dispatch);
  }
}

const FetchData = () => {
  const [ isLoading, setIsLoading ] = useState(true);
  const { user: userContextValue } = useContext(UserContext);
  const [user, setUser] = useState(userContextValue);
  // const user = useSelector((state: State) => state.user);
  const categories = useSelector((state: State) => state.categories);
  const subcategories = useSelector((state: State) => state.subcategories);
  // const exchangeRequests = useSelector((state: State) => state.exchangeRequests);
  // const friendsRequests = useSelector((state: State) => state.friendsRequests);
  // const loanRequests = useSelector((state: State) => state.loanRequests);
  const dispatch = useDispatch();
  const stableFetchBasis = useCallback(fetchBasis, []);
  const stableFetchProducts = useCallback(fetchProducts, []);
  // Admin
  const stableFetchAdmin = useCallback(fetchAdmin, []);
  // Data not critical
  const stableFetchFriendsRequests = useCallback(fetchFriendsRequestsHook, []);
  const stableFetchExchangeRequests = useCallback(fetchExchangeRequestsHook, []);
  const stableFetchLoanRequests = useCallback(fetchLoanRequestsHook, []);

  const { t } = useTranslation();

  // Forcing getting new userContextValue
  useEffect(() => {
    console.log("entra " + userContextValue);
    setUser(userContextValue);
  }, [userContextValue]);

  useEffect(() => {
    let sessionStorage = window.sessionStorage;
    stableFetchBasis(user, sessionStorage, dispatch);
  }, [stableFetchBasis, user, dispatch])

  // fetchProducts
  useEffect(() => {
    let sessionStorage = window.sessionStorage;
    stableFetchProducts(user, categories, setIsLoading, sessionStorage, dispatch);
  }, [stableFetchProducts, user, categories, dispatch]);

  useEffect(() => {
    let sessionStorage = window.sessionStorage;
    if (user.admin) {
      stableFetchAdmin(sessionStorage, dispatch);
    }
  }, [stableFetchAdmin, user, dispatch]);

  useEffect(() => {
    if (categories.length && subcategories.length) {
      stableFetchFriendsRequests(user.email, dispatch);
    }
  }, [])

  useEffect(() => {
    if (categories.length && subcategories.length) {
      stableFetchExchangeRequests(user.id, dispatch);
    }
  }, [])

  useEffect(() => {
    if (categories.length && subcategories.length) {
      stableFetchLoanRequests(user.id, dispatch);
    }
  }, [])

  // fetchSpotify

  if (isLoading) {
    return (
      <div className="fetch-data__loading">
        <Loading size="xl" message={t('Loading-data')} />
      </div>
    );
  }

  return (<Main />);
}

export default FetchData;
