import { makePaginatedApiActionCreator, makeStandardActionCreator } from '../action-helpers';
import { CATEGORIES_FETCHED } from './constants';
import { getCategories } from '../../services/stuff';

const categoriesFetched = makeStandardActionCreator(CATEGORIES_FETCHED);
export const fetchCategories = makePaginatedApiActionCreator(getCategories, categoriesFetched);
