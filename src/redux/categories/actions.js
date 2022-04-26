import { makePaginatedApiActionCreator, makeStandardActionCreator } from '../action-helpers';
import { CATEGORY_ADDED, CATEGORIES_FETCHED, CATEGORY_FETCHED } from './constants';
import { addCategoryCall, getCategories, getCategory } from '../../services/stuff';

const categoriesFetched = makeStandardActionCreator(CATEGORIES_FETCHED);
export const fetchCategories = makePaginatedApiActionCreator(getCategories, categoriesFetched);

export const fetchCategoriesHook = (sessionStorage, dispatch) => {
  getCategories().then(res =>{
    sessionStorage.setItem('categories', JSON.stringify(res.data));
    dispatchCategoriesFetched(res.data, dispatch);
  });
}

export const dispatchCategoriesFetched = (categories, dispatch) => {
  dispatch(categoriesFetched(categories));
}

const categoryFeteched = makeStandardActionCreator(CATEGORY_FETCHED);
export const fetchCategory = makePaginatedApiActionCreator(getCategory, categoryFeteched);

const categoryAdded = makeStandardActionCreator(CATEGORY_ADDED);
export const addCategory = makePaginatedApiActionCreator(addCategoryCall, categoryAdded);
export const addCategoryHook = (category, dispatch) => {
  return addCategoryCall(category).then(res => {
    dispatch(categoryAdded(res.data));
    return Promise.resolve(res.data);
  }).catch(err => Promise.reject(err));
};
