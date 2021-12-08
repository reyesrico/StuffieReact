import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import Loading from '../shared/Loading';
import Main from './Main';
import State from '../../redux/State';
// import { FetchDataProps } from './types';

import { fetchCategories } from '../../redux/categories/actions';
import { fetchFriends } from '../../redux/friends/actions';
import { fetchFriendsRequests } from '../../redux/friends-requests/actions';
import { fetchProducts } from '../../redux/products/actions';
import { fetchSubCategories } from '../../redux/subcategories/actions';
import { fetchExchangeRequests } from '../../redux/exchange-requests/actions';
import { fetchLoanRequests } from '../../redux/loan-requests/actions';
import { fetchPendingProducts } from '../../redux/pending-products/actions';
import { fetchUserRequests } from '../../redux/user-requests/actions';
import { fetchSpotify } from '../../redux/spotify/actions';

import './FetchData.scss';
import User from '../types/User';

const fetchData = (user: User, dispatch: Function) => {
  let promises = [
    fetchCategories(),                  // values[0] -- DO NOT MOVE
    fetchSubCategories(),               // values[1]
    fetchFriends(user.email),           // values[2]
    fetchFriendsRequests(user.email),   // values[3]
    fetchExchangeRequests(user.id),     // values[4]
    fetchLoanRequests(user.id),         // values[5]
    fetchSpotify()                      // values[6]
  ];

  let adminPromises = [
    fetchUserRequests(),                  // values[7]
    fetchPendingProducts()                // values[8]
  ];

  if (user.admin) {
    promises = [...promises, ...adminPromises];
  }

  promises.forEach(p => dispatch(p));
}


const FetchData = () => {
  const [ isLoading, setIsLoading ] = useState(true);
  const user = useSelector((state: State) => state.user);
  const categories = useSelector((state: State) => state.categories);
  const dispatch = useDispatch();
  const stableFetchData = useCallback(fetchData, []);
  const { t } = useTranslation();

  useEffect(() => {
    stableFetchData(user, dispatch);
  }, [stableFetchData, user, dispatch]);

  useEffect(() => {
    dispatch(fetchProducts(user, categories, setIsLoading));
  }, [categories, user, dispatch]);

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
