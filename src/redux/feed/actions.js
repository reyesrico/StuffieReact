import { sortBy } from 'lodash';

import { makeStandardActionCreator } from '../action-helpers';
import { FEED_FETCHED } from './constants';

const generateFeed = (friends) => {
  let feed = [];

  friends.forEach(friend => {
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
  });

  return sortBy(feed, 'date');
}

const feedFetched = makeStandardActionCreator(FEED_FETCHED);
export const fetchFeed = fullFriends => dispatch => {
  let feed = generateFeed(fullFriends);
  dispatch(feedFetched(feed));
  return feed;
}
