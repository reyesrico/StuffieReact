import { PRODUCT_ADDED, PRODUCTS_FETCHED, PRODUCT_UPDATED } from './constants';
import { findProduct } from '../../components/helpers/StuffHelper';

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
      product = findProduct(action.payload.id_stuff, state);
      products = state[product.category].filter(p => p.id !== product.id);
      const productUpdated = {...product, cost: action.payload.cost};

      return {
        ...state,
        [product.category]:  [...products, productUpdated]
      };
    case PRODUCTS_FETCHED:
      return action.payload;
    default:
      return state;
  }
};
