import { makeApiActionCreator,  makeStandardActionCreator } from '../action-helpers';

import { USER_REQUESTS_FETCHED, USER_REQUEST_DELETED } from './constants';
import { getUserRequests, deleteUserRequest } from '../../services/stuffier';

const userRequestsFetched = makeStandardActionCreator(USER_REQUESTS_FETCHED);
export const fetchUserRequests = makeApiActionCreator(getUserRequests, userRequestsFetched);

const userRequestDeleted = makeStandardActionCreator(USER_REQUEST_DELETED);
export const deleteRequest = makeApiActionCreator(deleteUserRequest, userRequestDeleted);
