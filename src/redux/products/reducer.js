import { PRODUCT_ADDED, PRODUCTS_FETCHED, PRODUCT_UPDATED } from './constants';

export default (state = [], action) => {
  let product, products;

  switch (action.type) {
    case PRODUCT_ADDED:
      product = action.payload;
      products = state[product.category];

      return {
        ...state,
        [product.category]: [...products, product]
      };
    case PRODUCT_UPDATED:
      product = action.payload;
      products = state[product.category].filter(p => p.id !== product.id);

      return {
        ...state,
        [product.category]:  [...products, product]
      };
    case PRODUCTS_FETCHED:
      return action.payload;
    default:
      return state;
  }
};
