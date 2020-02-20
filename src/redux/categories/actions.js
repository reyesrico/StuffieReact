import { makePaginatedApiActionCreator, makeStandardActionCreator } from '../action-helpers';
import { CATEGORIES_FETCHED, CATEGORY_FETCHED } from './constants';
import { getCategories, getCategory } from '../../services/stuff';

const categoriesFetched = makeStandardActionCreator(CATEGORIES_FETCHED);
export const fetchCategories = makePaginatedApiActionCreator(getCategories, categoriesFetched);

const categoryFeteched = makeStandardActionCreator(CATEGORY_FETCHED);
export const fetchCategory = makePaginatedApiActionCreator(getCategory, categoryFeteched);
