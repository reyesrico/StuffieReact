import { makeStandardActionCreator } from '../action-helpers';
import { FRIENDS_FETCHED, FRIEND_PRODUCTS_FETCHED } from './constants';

import { getFriends, getStuffiers } from '../../services/stuffier';
import { getListStuff, getStuffiersList } from '../../services/stuff';
import { mapFriends } from '../../components/helpers/UserHelper';
import { getFriendProducts, mapStuff } from '../../components/helpers/StuffHelper';

const friendsFetched = makeStandardActionCreator(FRIENDS_FETCHED);
export const fetchFriends = (email) => dispatch => {
  return getFriends(email)
  .then(res => getStuffiers(mapFriends(res.data)))
  .then(res => {
    const friends = res.data || [];   // TODO: Make this call better
    dispatch(friendsFetched(friends, email));
    return Promise.resolve(friends);
  });
}

export const fetchFriendsHook = (email, sessionStorage, dispatch) => {
  getFriends(email)
    .then(res => getStuffiers(mapFriends(res.data)))
    .then(res => {
      const friends = res.data || [];   // TODO: Make this call better
      sessionStorage.setItem('friends', JSON.stringify(friends));
      dispatchFriendsFetched(friends, email, dispatch);
    });
}

export const dispatchFriendsFetched = (friends, email, dispatch) => {
  dispatch(friendsFetched(friends, email));
}

const friendProductsFetched = makeStandardActionCreator(FRIEND_PRODUCTS_FETCHED);
export const fetchFriendsProducts = (friends) => dispatch => {
  let stuffiers_stuff = [];

  return getStuffiersList(friends)
  .then(res => {
    stuffiers_stuff = res.data;
    return getListStuff(mapStuff(res.data));
  })
  .then(res => {
    const products = res.data;
    const friendsFilled = getFriendProducts(friends, products, stuffiers_stuff);
    dispatch(friendProductsFetched(friendsFilled))
    return Promise.resolve(friendsFilled);
  });
}

export const fetchFriendsProductsHook = (friends, dispatch) => {
  let stuffiers_stuff = [];
  return getStuffiersList(friends)
  .then(res => {
    stuffiers_stuff = res.data;
    return getListStuff(mapStuff(res.data));
  })
  .then(res => {
    const products = res.data;
    const friendsFilled = getFriendProducts(friends, products, stuffiers_stuff);
    dispatch(friendProductsFetched(friendsFilled))
    return Promise.resolve(friendsFilled);
  });
}
