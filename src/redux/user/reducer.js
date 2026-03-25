import {
  LOGIN_USER_FETCHED,
  USER_FETCHED,
  USER_PICTURE_ADDED, 
  USER_UPDATED
} from './constants';

const userReducer = (state = [], action) => {
  switch (action.type) {
    case LOGIN_USER_FETCHED:
      return action.payload;
    case USER_FETCHED:
      return action.payload;
    case USER_PICTURE_ADDED:
      return action.payload;
    case USER_UPDATED:
      return action.payload;
    default:
      return state;
  }
};

export default userReducer;
