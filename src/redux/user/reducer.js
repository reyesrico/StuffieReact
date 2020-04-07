import { LOGIN_USER_FETCHED, USER_FETCHED, USER_REQUESTS_FETCHED, USER_REQUEST_DELETED } from './constants';

export default (state = [], action) => {
  switch (action.type) {
    case LOGIN_USER_FETCHED:
      return action.payload;
    case USER_FETCHED:
      return action.payload;
    case USER_REQUESTS_FETCHED:
      return action.payload;
    case USER_REQUEST_DELETED:
      // TBR
      return action.payload;
    default:
      return state;
  }
};
