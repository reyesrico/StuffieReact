import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import FeedRow from './FeedRow';
import Loading from '../shared/Loading';
import { useFeed, useFriends } from '../../hooks/queries';
import type { ScoredFeedItem } from '../../lib/feedAlgorithm';
import './Content.scss';

const Content = () => {
  const { t } = useTranslation();
  const { data: feed = [], isLoading: feedLoading } = useFeed();
  const { data: friends = [], isLoading: friendsLoading } = useFriends();

  if (feedLoading || friendsLoading) return (
    <div className="content__loading">
      <Loading size="xl" message={t('Loading-Feed')} />
    </div>
  );

  if (!friends.length) return (
    <div className="content__empty">
      <span className="content__empty-icon">&#128101;</span>
      <p className="content__empty-title">{t('feed.noFriendsTitle')}</p>
      <p className="content__empty-sub">{t('feed.noFriendsSub')}</p>
      <Link to="/friends" className="content__empty-link">{t('feed.noFriendsAction')}</Link>
    </div>
  );

  if (!feed.length) return (
    <div className="content__empty">
      <span className="content__empty-icon">&#128218;</span>
      <p className="content__empty-title">{t('feed.emptyTitle')}</p>
      <p className="content__empty-sub">{t('feed.emptySub')}</p>
    </div>
  );

  return (
    <div className="content">
      <div className="content__grid">
        {(feed as ScoredFeedItem[]).map((feedPost, index) => (
          <FeedRow key={`${feedPost.friend_id}-${feedPost.product.id ?? index}`} feedPost={feedPost} />
        ))}
      </div>
    </div>
  );
};

export default Content;

