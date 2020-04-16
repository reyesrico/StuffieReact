import { LOGIN_USER_FETCHED, USER_FETCHED, USER_PICTURE_ADDED } from './constants';

export default (state = [], action) => {
  switch (action.type) {
    case LOGIN_USER_FETCHED:
      return action.payload;
    case USER_FETCHED:
      return action.payload;
    case USER_PICTURE_ADDED:
      return action.payload;
    default:
      return state;
  }
};
