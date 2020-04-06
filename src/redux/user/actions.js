import { makePaginatedApiActionCreator, makeStandardActionCreator } from '../action-helpers';

import { REVOKE_USER } from '../constants';
import { LOGIN_USER_FETCHED, USER_FETCHED } from './constants';
import { loginStuffier, getStuffier } from '../../services/stuffier';

const loginUserFetched = makeStandardActionCreator(LOGIN_USER_FETCHED);
export const loginUser = makePaginatedApiActionCreator(loginStuffier, loginUserFetched);

const userFetched = makeStandardActionCreator(USER_FETCHED);
export const fetchUser = makePaginatedApiActionCreator(getStuffier, userFetched);

export const logout = () => {
  localStorage.removeItem('picture');
  localStorage.removeItem('username');

  return {
    type: REVOKE_USER,
  };  
}
