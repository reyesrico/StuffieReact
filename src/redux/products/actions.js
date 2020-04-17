import { makePaginatedApiActionCreator, makeStandardActionCreator } from '../action-helpers';
import { PRODUCT_ADDED, PRODUCT_FETCHED, PRODUCTS_FETCHED } from './constants';
import { addStuff, getListStuff, getStuffList, getStuff } from '../../services/stuff';
import { mapStuff, getProductsMap } from '../../components/helpers/StuffHelper';

const productFetched = makeStandardActionCreator(PRODUCT_FETCHED);
const productsFetched = makeStandardActionCreator(PRODUCTS_FETCHED);

const productAdded = makeStandardActionCreator(PRODUCT_ADDED);

export const fetchProduct = makePaginatedApiActionCreator(getStuff, productFetched);
export const fetchProducts = (user, categories) => dispatch => {  // makePaginatedApiActionCreator(getListStuff, productsFetched);
  return getStuffList(user.id)
         .then(res => getListStuff(mapStuff(res)))
         .then(res => Promise.resolve(res.data))
         .then(objects => {
           const products = getProductsMap(categories, objects);
           dispatch(productsFetched(products, user.email));
           return Promise.resolve(products);
         });
}

export const addProduct = makePaginatedApiActionCreator(addStuff, productAdded);
