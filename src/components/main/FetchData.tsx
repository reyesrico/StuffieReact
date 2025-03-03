import { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import Loading from '../shared/Loading';
import Main from './Main';
import State from '../../redux/State';
import UserContext from '../../context/UserContext';

import { fetchCategoriesHookWithCategories } from '../../redux/categories/actions';
import { fetchFriendsHookWithFriends } from '../../redux/friends/actions';
import { fetchProductsHookWithProducts } from '../../redux/products/actions';
import { fetchSubCategoriesHookWithSubCategories } from '../../redux/subcategories/actions';
import { fetchExchangeRequestsHookWithExchanges } from '../../redux/exchange-requests/actions';
import { fetchFriendsRequestsHookWithFriendsRequests } from '../../redux/friends-requests/actions';
import { fetchLoanRequestsHook } from '../../redux/loan-requests/actions';
import { fetchPendingProductsHookWithPendingProducts } from '../../redux/pending-products/actions';
import { fetchUserRequestsHookWithUserRequests } from '../../redux/user-requests/actions';
import { isProductsEmpty } from '../helpers/StuffHelper';

import './FetchData.scss';

// import { fetchSpotify } from '../../redux/spotify/actions';

const FetchData = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user } = useContext(UserContext);

  const categories = useSelector((state: State) => state.categories);
  const subcategories = useSelector((state: State) => state.subcategories);
  const products = useSelector((state: State) => state.products);
  const friends = useSelector((state: State) => state.friends);
  const exchangeRequests = useSelector((state: State) => state.exchangeRequests);
  const friendsRequests = useSelector((state: State) => state.friendsRequests);
  const loanRequests = useSelector((state: State) => state.loanRequests);

  // Basic data - Categories
  const { isFetching: isFetchingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: () =>
      fetchCategoriesHookWithCategories(sessionStorage, dispatch),
    enabled: !categories.length, // Only fetch if categories is not available in the Redux store
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // Disable refetching on window focus
  });

  // Basic data - Subcategories
  const { isFetching: isFetchingSubCategories } = useQuery({
    queryKey: ['subcategories'],
    queryFn: () =>
      fetchSubCategoriesHookWithSubCategories(sessionStorage, dispatch),
    enabled: !subcategories.length, // Only fetch if categories is not available in the Redux store
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // Disable refetching on window focus
  });

  // Basic data - Friends
  const { isFetching: isFetchingFriends } = useQuery({
    queryKey: ['friends'],
    queryFn: () => fetchFriendsHookWithFriends(user.email, sessionStorage, dispatch),
    enabled: !!user && !friends.length,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // Disable refetching on window focus
  });

  // Basic data - Products
  const { isFetching: isFetchingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: () => fetchProductsHookWithProducts(user, categories, sessionStorage, dispatch),
    enabled: isProductsEmpty(products) && (categories.length > 0),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // Disable refetching on window focus
  });

  // Admin
  const userRequests = useSelector((state: State) => state.userRequests);
  const pendingProducts = useSelector((state: State) => state.pendingProducts);
  const { isFetching: isFetchingUserRequests } = useQuery({
    queryKey: ['userRequests'],
    queryFn: () => fetchUserRequestsHookWithUserRequests(sessionStorage, dispatch),
    enabled: user.admin && !userRequests.length,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // Disable refetching on window focus
  });

  const { isFetching: isFetchingPendingProducts } = useQuery({
    queryKey: ['productRequests'],
    queryFn: () => fetchPendingProductsHookWithPendingProducts(sessionStorage, dispatch),
    enabled: user.admin && (!pendingProducts.length && !isProductsEmpty(products)),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // Disable refetching on window focus
  });

  // Data not critical
  useQuery({
    queryKey: ['friendsRequests'],
    queryFn: () => fetchFriendsRequestsHookWithFriendsRequests(user.email, dispatch),
    enabled: !friendsRequests.length,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // Disable refetching on window focus
  });

  useQuery({
    queryKey: ['exchangeRequests'],
    queryFn: () => fetchExchangeRequestsHookWithExchanges(user.id, dispatch),
    enabled: !exchangeRequests.length,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // Disable refetching on window focus
  });

  useQuery({
    queryKey: ['loanRequests'],
    queryFn: () => fetchLoanRequestsHook(user.id, dispatch),
    enabled: !loanRequests.length,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // Disable refetching on window focus
  });

  if (
    isFetchingCategories ||
    isFetchingSubCategories ||
    isFetchingFriends ||
    isFetchingProducts ||
    isFetchingPendingProducts ||
    isFetchingUserRequests
  ) {
    return (
      <div className="fetch-data__loading">
        <Loading size="xl" message={t('Loading-data')} />
      </div>
    );
  }

  return (<Main />);
}

export default FetchData;
