import { CATEGORY_ADDED, CATEGORIES_FETCHED, CATEGORY_FETCHED } from './constants';

export default (state = [], action) => {
  switch (action.type) {
    case CATEGORY_ADDED:
      const category = action.payload;
      return [...state, category];
    case CATEGORIES_FETCHED:
      return action.payload;
    case CATEGORY_FETCHED:
      return action.payload;
    default:
      return state;
  }
};
