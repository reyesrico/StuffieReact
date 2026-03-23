import { PENDING_PRODUCTS_FETCHED } from './constants';

const pendingProductsReducer = (state = [], action) => {
  switch (action.type) {
    case PENDING_PRODUCTS_FETCHED:
      return action.payload;
    default:
      return state;
  }
};

export default pendingProductsReducer;
