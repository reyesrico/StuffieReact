import { PENDING_PRODUCTS_FETCHED } from './constants';

export default (state = [], action) => {
  switch (action.type) {
    case PENDING_PRODUCTS_FETCHED:
      return action.payload;
    default:
      return state;
  }
};
