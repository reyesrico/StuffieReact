import { FRIENDS_FETCHED } from './constants';

export default (state = [], action) => {
  switch (action.type) {
    case FRIENDS_FETCHED:
      return action.payload;
    default:
      return state;
  }
};
