import { map } from 'lodash';

import {
  PRODUCT_ADDED,
  PRODUCT_FETCHED, 
  PRODUCTS_FETCHED, 
  PRODUCTS_IDS_FETCHED } from './constants';

export default (state = [], action) => {
  switch (action.type) {
    case PRODUCT_ADDED:
      return [
        ...state,
        action.payload,
      ];
    case PRODUCT_FETCHED:
      return action.payload || null;
    case PRODUCTS_IDS_FETCHED:
      return map(action.payload, row => row.id);
    case PRODUCTS_FETCHED:
      return action.payload;
    default:
      return state;
  }
};
