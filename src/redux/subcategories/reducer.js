import { SUBCATEGORY_ADDED, SUBCATEGORIES_FETCHED, SUBCATEGORY_FETCHED } from './constants';

export default (state = [], action) => {
  switch (action.type) {
    case SUBCATEGORY_ADDED:
      const subcategory = action.payload;
      return [...state, subcategory];
    case SUBCATEGORIES_FETCHED:
      return action.payload;
    case SUBCATEGORY_FETCHED:
      return action.payload;
    default:
      return state;
  }
};
