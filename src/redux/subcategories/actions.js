import { makePaginatedApiActionCreator, makeStandardActionCreator } from '../action-helpers';
import { SUBCATEGORIES_FETCHED, SUBCATEGORY_FETCHED, SUBCATEGORY_ADDED } from './constants';
import { addSubCategoryCall, getSubCategories, getSubcategory } from '../../services/stuff';

const subCategoriesFetched = makeStandardActionCreator(SUBCATEGORIES_FETCHED);
export const fetchSubCategories = makePaginatedApiActionCreator(getSubCategories, subCategoriesFetched);

const subCategoryFetched = makeStandardActionCreator(SUBCATEGORY_FETCHED);
export const fetchSubCategory = makePaginatedApiActionCreator(getSubcategory, subCategoryFetched);

const subCategoryAdded = makeStandardActionCreator(SUBCATEGORY_ADDED);
export const addSubCategory = makePaginatedApiActionCreator(addSubCategoryCall, subCategoryAdded);
