import { FRIENDS_FETCHED, FRIEND_PRODUCTS_FETCHED } from './constants';

export default (state = [], action) => {
  switch (action.type) {
    case FRIENDS_FETCHED:
      return action.payload;
    case FRIEND_PRODUCTS_FETCHED:
      return action.payload;
    default:
      return state;
  }
};
