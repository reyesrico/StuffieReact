import { LOANS_FETCHED, LOAN_DELETED, LOAN_REQUESTED } from './constants';

export default (state = [], action) => {
  switch (action.type) {
    case LOAN_REQUESTED:
      return [...state, action.payload];
    case LOANS_FETCHED:
      return action.payload;
    case LOAN_DELETED:
      const requests = state.filter(item => item._id !== action.payload);
      return requests;
    default:
      return state;
  }
}
