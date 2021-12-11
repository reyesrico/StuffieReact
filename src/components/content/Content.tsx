import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { map } from 'lodash';
import { useTranslation } from 'react-i18next';

import FeedPost from '../types/FeedPost';
import FeedRow from './FeedRow';
import Loading from '../shared/Loading';
import State from '../../redux/State';
import User from '../types/User';
import { fetchFriendsProductsHook } from '../../redux/friends/actions';
import { generateFeed } from '../../redux/feed/actions';
import './Content.scss';

const getFeed = (friends: any, dispatch: any, setIsLoading: Function, setFeed: any) => {
  // setIsLoading(true);
  fetchFriendsProductsHook(friends, dispatch)
    .then((fullFriends: User[]) => {
      console.log({ fullFriends });
      let feed = generateFeed(fullFriends);
      console.log({ feed });
      setFeed(feed);
    })
    .catch(() => console.log('Error Feed Fetched'))
    .finally(() => {
      // setIsLoading(false);
    });
}

const Content = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  let [isLoading, setIsLoading] = useState(false);
  let friends = useSelector((state: State) => state.friends);
  let [feed, setFeed] = useState([]);

  useEffect(() => {
    getFeed(friends, dispatch, setIsLoading, setFeed);
  }, [friends, dispatch]);

  if (isLoading) {
    return (
      <div className="content__loading">
        <Loading size="xl" message={t("Loading-Feed")} />
      </div>
    );
  }

  if (!friends.length) {
    return <div>No Friends! Add friends!</div>
  }
  if (!feed.length) {
    return <div>No Feed!</div>
  }

  if (!feed) { return <div> No Feed </div>}
  return (
    <div className="content">
      <div className="content__info">
        <div className="content__rows">
          {map(feed, (feedPost: FeedPost, index) => (<FeedRow key={index} feedPost={feedPost} />))}
        </div>
      </div>
    </div>
  );
}

export default Content;
