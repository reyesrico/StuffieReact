import { PRODUCT_ADDED, PRODUCTS_FETCHED } from './constants';

//PRODUCT_FETCHED,

export default (state = [], action) => {
  switch (action.type) {
    case PRODUCT_ADDED:
      return [
        ...state.products,
        action.payload,
      ];
    // case PRODUCT_FETCHED:
    //   return action.payload || null;
    case PRODUCTS_FETCHED:
      return action.payload;
    default:
      return state;
  }
};
