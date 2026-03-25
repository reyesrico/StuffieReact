import { sortBy } from 'lodash';

import { makeStandardActionCreator } from '../action-helpers';
import { FEED_FETCHED } from './constants';
// import { setFriendsProducts } from '../../services/feed';

export const generateFeed = friends => {
  const feed = [];

  friends.forEach(friend => {
    // f.forEach(friend => {
      if (friend.products) {
        friend.products.forEach(product => {
          feed.push({
            friend_id: friend.id,
            friend_firstName: friend.first_name || '',
            friend_lastName: friend.last_name || '',
            product,
            date: product._created
          });
        });
      }
    // })
  });

  return sortBy(feed, 'date');
}

const feedFetched = makeStandardActionCreator(FEED_FETCHED);
export const fetchFeed = fullFriends => dispatch => {
  const feed = generateFeed(fullFriends);
  dispatch(feedFetched(feed));
  return feed;
}

export const fetchFeedHook = (friends, sessionStorage, dispatch) => {
  const feed = generateFeed(friends);
  sessionStorage.setItem('feed', JSON.stringify(feed));
  dispatchFeedFetched(feed, dispatch);
}

export const dispatchFeedFetched = (feed, dispatch) => {
  dispatch(feedFetched(feed));
}
