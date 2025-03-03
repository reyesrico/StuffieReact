import { makeApiActionCreator,  makeStandardActionCreator } from '../action-helpers';

import { USER_REQUESTS_FETCHED, USER_REQUEST_DELETED } from './constants';
import { getUserRequests, deleteUserRequest } from '../../services/stuffier';

const userRequestsFetched = makeStandardActionCreator(USER_REQUESTS_FETCHED);
export const fetchUserRequests = makeApiActionCreator(getUserRequests, userRequestsFetched);

export const fetchUserRequestsHook = (sessionStorage, dispatch) => {
  getUserRequests().then(res =>{
    sessionStorage.setItem('user-requests', JSON.stringify(res.data));
    dispatchUserRequests(res.data, dispatch);
  });
}

export const fetchUserRequestsHookWithUserRequests = (sessionStorage, dispatch) => {
  if (sessionStorage.getItem('user-requests')) {
    dispatchUserRequests(JSON.parse(sessionStorage.getItem('user-requests')), dispatch);
    return Promise.resolve(JSON.parse(sessionStorage.getItem('user-requests')));
  }
  return getUserRequests().then(res =>{
    sessionStorage.setItem('user-requests', JSON.stringify(res.data));
    dispatchUserRequests(res.data, dispatch);
    return res.data;
  });
}

export const dispatchUserRequests = (requests, dispatch) => {
  dispatch(userRequestsFetched(requests));
}

const userRequestDeleted = makeStandardActionCreator(USER_REQUEST_DELETED);
export const deleteRequest = makeApiActionCreator(deleteUserRequest, userRequestDeleted);
export const deleteRequestHook = (user, dispatch) => {
  deleteUserRequest(user).then(() => dispatch(userRequestDeleted));
}
