import { FRIENDS_REQUESTS_FETCHED } from './constants';

export default (state = [], action) => {
  switch (action.type) {
    case FRIENDS_REQUESTS_FETCHED:
      return action.payload;
    default:
      return state;
  }
};
