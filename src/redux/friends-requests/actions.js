import { makeStandardActionCreator } from '../action-helpers';
import { FRIENDS_REQUESTS_FETCHED } from './constants';
import { getFriendsRequests } from '../../services/stuffier';

const friendsRequestsFetched = makeStandardActionCreator(FRIENDS_REQUESTS_FETCHED);
export const fetchFriendsRequests = (email) => dispatch => {
  return getFriendsRequests(email)
  .then(res => {
    dispatch(friendsRequestsFetched(res.data));
    return Promise.resolve(res.data);
  });
}

export const fetchFriendsRequestsHook = (email, dispatch) => {
  getFriendsRequests(email).then(res => {
    dispatch(friendsRequestsFetched(res.data));
  });
}

export const fetchFriendsRequestsHookWithFriendsRequests = (email, dispatch) => {
  return getFriendsRequests(email).then(res => {
    dispatch(friendsRequestsFetched(res.data));
    return Promise.resolve(res.data);
  });
}
