import { makeStandardActionCreator } from '../action-helpers';
import { FRIENDS_REQUESTS_FETCHED } from './constants';
import { getFriendsRequests } from '../../services/stuffier';

const friendsRequestsFetched = makeStandardActionCreator(FRIENDS_REQUESTS_FETCHED);
export const fetchFriendsRequests = () => dispatch => {
  return getFriendsRequests()
  .then(res => {
    dispatch(friendsRequestsFetched(res.data));
    return Promise.resolve(res.data);
  });
}
