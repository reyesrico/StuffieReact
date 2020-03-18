import { makePaginatedApiActionCreator, makeStandardActionCreator } from '../action-helpers';
import { CATEGORY_ADDED, CATEGORIES_FETCHED, CATEGORY_FETCHED } from './constants';
import { addCategoryCall, getCategories, getCategory } from '../../services/stuff';

const categoriesFetched = makeStandardActionCreator(CATEGORIES_FETCHED);
export const fetchCategories = makePaginatedApiActionCreator(getCategories, categoriesFetched);

const categoryFeteched = makeStandardActionCreator(CATEGORY_FETCHED);
export const fetchCategory = makePaginatedApiActionCreator(getCategory, categoryFeteched);

const categoryAdded = makeStandardActionCreator(CATEGORY_ADDED);
export const addCategory = makePaginatedApiActionCreator(addCategoryCall, categoryAdded);
