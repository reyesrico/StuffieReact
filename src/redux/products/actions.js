import { makePaginatedApiActionCreator, makeStandardActionCreator, makeApiActionCreator } from '../action-helpers';
import { PRODUCT_ADDED, PRODUCT_FETCHED, PRODUCTS_FETCHED, PRODUCT_UPDATED } from './constants';
import { addStuff, addStuffStuffier, getListStuff, getStuffList, getStuff, updateStuff } from '../../services/stuff';
import { mapStuff, getProductsMap, mapCostToProducts } from '../../components/helpers/StuffHelper';

const productFetched = makeStandardActionCreator(PRODUCT_FETCHED);
const productsFetched = makeStandardActionCreator(PRODUCTS_FETCHED);
const productUpdated = makeStandardActionCreator(PRODUCT_UPDATED);

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
  let extraStuff;
  return getStuffList(user.id)
         .then(res => {
           extraStuff = res.data;               // []Stuff (with cost)
           return getListStuff(mapStuff(res.data));
          })
         .then(res => {                         // []Product
           const objects = mapCostToProducts(res.data, extraStuff);
           const products = getProductsMap(categories, objects);
           dispatch(productsFetched(products, user.email));
           return Promise.resolve(products);
         });
}

export const updateProduct = makeApiActionCreator(updateStuff, productUpdated);
