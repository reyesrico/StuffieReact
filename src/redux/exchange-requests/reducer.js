import { EXCHANGES_FETCHED, EXCHANGE_DELETED, EXCHANGE_REQUESTED } from './constants';

export default (state = [], action) => {
  switch (action.type) {
    case EXCHANGE_REQUESTED:
      return [...state, action.payload];
    case EXCHANGES_FETCHED:
      return action.payload;
    case EXCHANGE_DELETED:
      const requests = state.filter(item => item._id !== action.payload);
      return requests;
    default:
      return state;
  }
}
