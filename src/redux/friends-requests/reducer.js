import { FRIENDS_REQUESTS_FETCHED } from './constants';

const friendsRequestsReducer = (state = [], action) => {
  switch (action.type) {
    case FRIENDS_REQUESTS_FETCHED:
      return action.payload;
    default:
      return state;
  }
};

export default friendsRequestsReducer;
