import {  makeStandardActionCreator } from '../action-helpers';
import { FRIENDS_FETCHED } from './constants';
import { getFriends, getStuffiers } from '../../services/stuffier';
import { mapFriends } from '../../components/helpers/UserHelper';

const friendsFetched = makeStandardActionCreator(FRIENDS_FETCHED);
export const fetchFriends = (email) => dispatch => {    // makePaginatedApiActionCreator(getFriends, friendsFetched);
  return getFriends(email)
  .then(res => getStuffiers(mapFriends(res.data)))
  .then(res => {
    const friends = res.data;
    dispatch(friendsFetched(friends, email));
    return Promise.resolve(friends);
  });
}
