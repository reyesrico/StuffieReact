import { PRODUCT_ADDED, PRODUCTS_FETCHED } from './constants';

//PRODUCT_FETCHED,

export default (state = [], action) => {
  switch (action.type) {
    case PRODUCT_ADDED:
      const product = action.payload;
      let products = state[product.category];

      return {
        ...state,
        [product.category]: [...products, product]
      };

    // case PRODUCT_FETCHED:
    //   return action.payload || null;
    case PRODUCTS_FETCHED:
      return action.payload;
    default:
      return state;
  }
};
