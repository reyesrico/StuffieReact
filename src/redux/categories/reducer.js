import { CATEGORIES_FETCHED } from './constants';

export default (state = [], action) => {
  switch (action.type) {
    case CATEGORIES_FETCHED:
      return state;
    default:
      return state;
  }
};
