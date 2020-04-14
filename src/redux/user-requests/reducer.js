import { USER_REQUESTS_FETCHED, USER_REQUEST_DELETED } from './constants';

export default (state = [], action) => {
  switch (action.type) {
    case USER_REQUESTS_FETCHED:
      return action.payload;
    case USER_REQUEST_DELETED:
      const userRequests = state.filter(item => item._id !== action.payload._id);
      console.log(userRequests);
      return userRequests;
    default:
      return state;
  }
};
