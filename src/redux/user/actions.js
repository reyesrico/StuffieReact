import { makePaginatedApiActionCreator, makeStandardActionCreator } from '../action-helpers';

import { REVOKE_USER } from '../constants';
import { LOGIN_USER_FETCHED, USER_FETCHED, USER_REQUESTS_FETCHED, USER_REQUEST_DELETED } from './constants';
import { loginStuffier, getStuffier, getUserRequests, deleteUserRequest } from '../../services/stuffier';

const loginUserFetched = makeStandardActionCreator(LOGIN_USER_FETCHED);
export const loginUser = makePaginatedApiActionCreator(loginStuffier, loginUserFetched);

const userFetched = makeStandardActionCreator(USER_FETCHED);
export const fetchUser = makePaginatedApiActionCreator(getStuffier, userFetched);

const userRequestsFetched = makeStandardActionCreator(USER_REQUESTS_FETCHED);
export const fetchUserRequests = makePaginatedApiActionCreator(getUserRequests, userRequestsFetched);

const userRequestDeleted = makeStandardActionCreator(USER_REQUEST_DELETED);
export const deleteRequest = makePaginatedApiActionCreator(deleteUserRequest, userRequestDeleted);

export const logout = () => {
  localStorage.removeItem('picture');
  localStorage.removeItem('username');

  return {
    type: REVOKE_USER,
  };  
}
