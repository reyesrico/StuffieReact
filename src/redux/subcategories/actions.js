import { makePaginatedApiActionCreator, makeStandardActionCreator } from '../action-helpers';
import { SUBCATEGORIES_FETCHED } from './constants';
import { getSubCategories } from '../../services/stuff';

const subCategoriesFetched = makeStandardActionCreator(SUBCATEGORIES_FETCHED);
export const fetchSubCategories = makePaginatedApiActionCreator(getSubCategories, subCategoriesFetched);
