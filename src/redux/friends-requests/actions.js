import { makePaginatedApiActionCreator, makeStandardActionCreator } from '../action-helpers';
import { FRIENDS_REQUESTS_FETCHED } from './constants';
import { getFriendsRequests } from '../../services/stuffier';

const friendsRequestsFetched = makeStandardActionCreator(FRIENDS_REQUESTS_FETCHED);
export const fetchFriendsRequests = makePaginatedApiActionCreator(getFriendsRequests, friendsRequestsFetched);
