import { makePaginatedApiActionCreator, makeStandardActionCreator } from '../action-helpers';
import { PRODUCT_ADDED, PRODUCT_FETCHED, PRODUCTS_FETCHED } from './constants';
import { addStuff, addStuffStuffier, getListStuff, getStuffList, getStuff } from '../../services/stuff';
import { mapStuff, getProductsMap } from '../../components/helpers/StuffHelper';

const productFetched = makeStandardActionCreator(PRODUCT_FETCHED);
const productsFetched = makeStandardActionCreator(PRODUCTS_FETCHED);

const productAdded = makeStandardActionCreator(PRODUCT_ADDED);
export const addProduct = (product, user) => dispatch => {
  return addStuff(product)
  .then(res => {
    const product = res.data;
    return addStuffStuffier(user.id, product.id);
  })
  .then(() => {
    dispatch(productAdded(product, user.email));
    return Promise.resolve(product);
  })
  .catch(error => Promise.reject(error));
}

export const addRegisteredProduct = (user, product) => dispatch => {
  return addStuffStuffier(user.id, product.id)
  .then(() => {
    dispatch(productAdded(product, user.email));
    return Promise.resolve(product);
  })
  .catch(error => Promise.reject(error));
}

export const fetchProduct = makePaginatedApiActionCreator(getStuff, productFetched);
export const fetchProducts = (user, categories) => dispatch => {  // makePaginatedApiActionCreator(getListStuff, productsFetched);
  return getStuffList(user.id)
         .then(res => getListStuff(mapStuff(res.data)))
         .then(res => {
           const objects = res.data;
           const products = getProductsMap(categories, objects);
           dispatch(productsFetched(products, user.email));
           return Promise.resolve(products);
         });
}
