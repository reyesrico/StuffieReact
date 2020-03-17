import { SUBCATEGORY_ADDED, SUBCATEGORIES_FETCHED, SUBCATEGORY_FETCHED } from './constants';

export default (state = [], action) => {
  switch (action.type) {
    case SUBCATEGORY_ADDED:
      const subcategory = action.payload;
      return [...state, { _id: subcategory._id, id: subcategory.id, name: subcategory.name }];
    case SUBCATEGORIES_FETCHED:
      return action.payload;
    case SUBCATEGORY_FETCHED:
      return action.payload;
    default:
      return state;
  }
};
