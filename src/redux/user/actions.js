import { makeStandardActionCreator } from '../action-helpers';

import { REVOKE_USER } from '../constants';
import { LOGIN_USER_FETCHED, USER_FETCHED } from './constants';
import { loginStuffier, getStuffier } from '../../services/stuffier';

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

export const logout = () => {
  localStorage.removeItem('picture');
  localStorage.removeItem('username');

  return {
    type: REVOKE_USER,
  };  
}
