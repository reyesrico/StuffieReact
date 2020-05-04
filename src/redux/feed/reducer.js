import { FEED_FETCHED } from './constants';

export default (state = [], action) => {
  switch (action.type) {
    case FEED_FETCHED:
      return action.payload;
    default:
      return state;
  }
};
