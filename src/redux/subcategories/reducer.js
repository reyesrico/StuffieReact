import { SUBCATEGORIES_FETCHED } from './constants';

export default (state = [], action) => {
  switch (action.type) {
    case SUBCATEGORIES_FETCHED:
      return action.payload;
    default:
      return state;
  }
};
