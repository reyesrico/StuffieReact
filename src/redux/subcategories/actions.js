import { makePaginatedApiActionCreator, makeStandardActionCreator } from '../action-helpers';
import { SUBCATEGORIES_FETCHED, SUBCATEGORY_FETCHED, SUBCATEGORY_ADDED } from './constants';
import { addSubCategoryCall, getSubCategories, getSubcategory } from '../../services/stuff';

const subCategoriesFetched = makeStandardActionCreator(SUBCATEGORIES_FETCHED);
export const fetchSubCategories = makePaginatedApiActionCreator(getSubCategories, subCategoriesFetched);

export const fetchSubCategoriesHook = (sessionStorage, dispatch) => {
  getSubCategories().then(res =>{
    sessionStorage.setItem('subcategories', JSON.stringify(res.data));
    dispatchSubCategoriesFetched(res.data, dispatch);
    return res.data;
  });
}

export const dispatchSubCategoriesFetched = (subcategories, dispatch) => {
  dispatch(subCategoriesFetched(subcategories));
  return subcategories;
}

const subCategoryFetched = makeStandardActionCreator(SUBCATEGORY_FETCHED);
export const fetchSubCategory = makePaginatedApiActionCreator(getSubcategory, subCategoryFetched);

const subCategoryAdded = makeStandardActionCreator(SUBCATEGORY_ADDED);
export const addSubCategory = makePaginatedApiActionCreator(addSubCategoryCall, subCategoryAdded);
export const addSubCategoryHook = (subCategory, dispatch) => {
  return addSubCategoryCall(subCategory).then(res => {
    dispatch(subCategoryAdded(res.data));
    return Promise.resolve(res.data);
  }).catch(err => Promise.reject(err));
};
