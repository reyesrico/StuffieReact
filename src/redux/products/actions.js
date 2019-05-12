import { makePaginatedApiActionCreator, makeStandardActionCreator } from '../action-helpers';
import { PRODUCT_FETCHED, PRODUCTS_FETCHED, PRODUCTS_IDS_FETCHED } from './constants';
import { getListStuff, getStuffList, getStuff } from '../../services/stuff';

const productFetched = makeStandardActionCreator(PRODUCT_FETCHED);
const productsIdFetched = makeStandardActionCreator(PRODUCTS_IDS_FETCHED);
const productsFetched = makeStandardActionCreator(PRODUCTS_FETCHED);

export const fetchProduct = makePaginatedApiActionCreator(getStuff, productFetched);
export const fetchProductsId = makePaginatedApiActionCreator(getStuffList, productsIdFetched);
export const fetchProducts = makePaginatedApiActionCreator(getListStuff, productsFetched);
