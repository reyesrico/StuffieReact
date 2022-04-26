import { sortBy } from 'lodash';

import { makeStandardActionCreator } from '../action-helpers';
import { FEED_FETCHED } from './constants';
// import { setFriendsProducts } from '../../services/feed';

export const generateFeed = friends => {
  let feed = [];

  friends.forEach(friend => {
    // f.forEach(friend => {
      if (friend.products) {
        console.log(friend.products.length);
        friend.products.forEach(product => {
          console.log({ product });
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

  console.log({ feed });
  return sortBy(feed, 'date');
}

const feedFetched = makeStandardActionCreator(FEED_FETCHED);
export const fetchFeed = fullFriends => dispatch => {
  let feed = generateFeed(fullFriends);
  dispatch(feedFetched(feed));
  return feed;
}

export const fetchFeedHook = (friends, sessionStorage, dispatch) => {
  let feed = generateFeed(friends);
  sessionStorage.setItem('feed', JSON.stringify(feed));
  dispatchFeedFetched(feed, dispatch);
}

export const dispatchFeedFetched = (feed, dispatch) => {
  dispatch(feedFetched(feed));
}
