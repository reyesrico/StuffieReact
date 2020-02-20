import { makePaginatedApiActionCreator, makeStandardActionCreator } from '../action-helpers';
import { SUBCATEGORIES_FETCHED, SUBCATEGORY_FETCHED } from './constants';
import { getSubCategories, getSubcategory } from '../../services/stuff';

const subCategoriesFetched = makeStandardActionCreator(SUBCATEGORIES_FETCHED);
export const fetchSubCategories = makePaginatedApiActionCreator(getSubCategories, subCategoriesFetched);

const subCategoryFetched = makeStandardActionCreator(SUBCATEGORY_FETCHED);
export const fetchSubCategory = makePaginatedApiActionCreator(getSubcategory, subCategoryFetched);
