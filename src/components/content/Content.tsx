import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { map } from 'lodash';
import { useTranslation } from 'react-i18next';

import FeedPost from '../types/FeedPost';
import FeedRow from './FeedRow';
import Loading from '../shared/Loading';
import State from '../../redux/State';
import User from '../types/User';
import { fetchFriendsProductsHook } from '../../redux/friends/actions';
import { dispatchFeedFetched, fetchFeedHook } from '../../redux/feed/actions';
import './Content.scss';

const getFeed = (friends: any, dispatch: any, sessionStorage: Storage, setIsLoading: Function) => {
  if (sessionStorage.getItem('feed')) {
    let feed = JSON.parse(sessionStorage.getItem('feed') || '');
    dispatchFeedFetched(feed, dispatch);
  } else {
    fetchFriendsProductsHook(friends, dispatch)
      .then((fullFriends: User[]) => fetchFeedHook(fullFriends, sessionStorage, dispatch))
      .catch(() => console.log('Error Feed Fetched'))
      .finally(() => setIsLoading(false));
  }
}

const Content = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const feed = useSelector((state: State) => state.feed);
  let [isLoading, setIsLoading] = useState(true);
  let friends = useSelector((state: State) => state.friends);
  const stableGetFeed = useCallback(getFeed, []);

  useEffect(() => {
    let sessionStorage = window.sessionStorage;

    if (feed && feed.length) {
      setIsLoading(false);
    } else {
      if (friends && friends.length) {
        stableGetFeed(friends, dispatch, sessionStorage, setIsLoading);
      }
    }
  }, [stableGetFeed, feed, friends, dispatch]);

  if (isLoading) return (
    <div className="content__loading">
      <Loading size="xl" message={t("Loading-Feed")} />
    </div>
  );

  if (!friends.length) return <div>{t('No Friends')}</div>
  if (!feed || !feed.length) return <div>{t('No Feed')}</div>

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
