import { makeStandardActionCreator } from '../action-helpers';

import { REVOKE_USER } from '../constants';
import { LOGIN_USER_FETCHED, USER_FETCHED, USER_REGISTERED, USER_PICTURE_ADDED } from './constants';
import { loginStuffier, getStuffier, registerStuffier } from '../../services/stuffier';

export const loginUserFetched = makeStandardActionCreator(LOGIN_USER_FETCHED);
export const loginUser = (email, password) => dispatch => {
  return loginStuffier(email, password).then(data  => {
    // dispatch(loginUserFetched(data, { email, password }));   // NOT NEEDED
    return Promise.resolve(data);
  });
};

const userFetched = makeStandardActionCreator(USER_FETCHED);
export const fetchUser = (email) => dispatch => {   //makePaginatedApiActionCreator(getStuffier, userFetched);
  return getStuffier(email).then(res => {
    // TODO: Promise resolve only data about User!!!
    dispatch(userFetched(res.data[0], email));
    return Promise.resolve(res);
  });
}

const userRegistered = makeStandardActionCreator(USER_REGISTERED);
export const registerUser = (user) => dispatch => {
  return registerStuffier(user).then(() => {
    dispatch(userRegistered(user, user.email));
    return Promise.resolve(user);
  });
}

const userPictureAdded = makeStandardActionCreator(USER_PICTURE_ADDED);
export const addUserPicture = (user, picture) => dispatch => {
  const facebookUser = { ...user, picture };
  dispatch(userPictureAdded(facebookUser, facebookUser.email));
}

export const logout = () => {
  localStorage.removeItem('picture');
  localStorage.removeItem('username');

  return {
    type: REVOKE_USER,
  };  
}
