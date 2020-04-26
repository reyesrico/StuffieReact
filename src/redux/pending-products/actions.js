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
