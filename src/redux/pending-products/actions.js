import { makeStandardActionCreator } from '../action-helpers';
import { PENDING_PRODUCTS_FETCHED } from './constants';
import { getPendingProducts } from '../../services/stuff';

const pendingProductsFetched = makeStandardActionCreator(PENDING_PRODUCTS_FETCHED);
export const fetchPendingProducts = () => dispatch => {
  return getPendingProducts()
  .then(res => {
    dispatch(pendingProductsFetched(res.data));
    return Promise.resolve(res.data);
  })
  .catch(error => Promise.reject(error));
}

export const fetchPendingProductsHook = (sessionStorage, dispatch) => {
  getPendingProducts().then(res => {
    sessionStorage.setItem('products-requests', JSON.stringify(res.data));
    dispatchPedingProducts(res.data, dispatch);
  });
}

export const fetchPendingProductsHookWithPendingProducts = (sessionStorage, dispatch) => {
  if (sessionStorage.getItem('products-requests')) {
    dispatchPedingProducts(JSON.parse(sessionStorage.getItem('products-requests')), dispatch);
    return Promise.resolve(JSON.parse(sessionStorage.getItem('products-requests')));
  }
  return getPendingProducts().then(res => {
    sessionStorage.setItem('products-requests', JSON.stringify(res.data));
    dispatchPedingProducts(res.data, dispatch);
    return res.data;
  });
}


export const dispatchPedingProducts = (requests, dispatch) => {
  dispatch(pendingProductsFetched(requests));
}
