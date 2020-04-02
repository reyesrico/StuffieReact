import { makePaginatedApiActionCreator, makeStandardActionCreator } from '../action-helpers';
import { FRIENDS_FETCHED, FRIENDS_REQUESTS_FETCHED } from './constants';
import { getFriends, getFriendsRequests } from '../../services/stuffier';

const friendsFetched = makeStandardActionCreator(FRIENDS_FETCHED);
export const fetchFriends = makePaginatedApiActionCreator(getFriends, friendsFetched);

const friendsRequestsFetched = makeStandardActionCreator(FRIENDS_REQUESTS_FETCHED);
export const fetchFriendsRequests = makePaginatedApiActionCreator(getFriendsRequests, friendsRequestsFetched);
