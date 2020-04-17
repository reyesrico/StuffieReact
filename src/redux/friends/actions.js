import { makePaginatedApiActionCreator, makeStandardActionCreator } from '../action-helpers';
import { FRIENDS_FETCHED } from './constants';
import { getFriends } from '../../services/stuffier';

const friendsFetched = makeStandardActionCreator(FRIENDS_FETCHED);
export const fetchFriends = makePaginatedApiActionCreator(getFriends, friendsFetched);
