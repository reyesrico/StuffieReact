import { EXCHANGES_FETCHED } from './constants';

export default (state = [], action) => {
  switch (action.type) {
    case EXCHANGES_FETCHED:
      return action.payload;
    default:
      return state;
  }
}
