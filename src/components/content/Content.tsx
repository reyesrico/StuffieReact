import React from 'react';
import { map } from 'lodash';
import { useTranslation } from 'react-i18next';

import FeedPost from '../types/FeedPost';
import FeedRow from './FeedRow';
import Loading from '../shared/Loading';
import { useFeed, useFriends } from '../../hooks/queries';
import './Content.scss';

const Content = () => {
  const { t } = useTranslation();
  const { data: feed = [], isLoading } = useFeed();
  const { data: friends = [] } = useFriends();

  if (isLoading) return (
    <div className="content__loading">
      <Loading size="xl" message={t("Loading-Feed")} />
    </div>
  );

  if (!friends.length) return <div>{t('No Friends')}</div>
  if (!feed || !feed.length) return <div>{t('No Feed')}</div>

  return (
    <div className="content">
      <div className="content__header">
        <h2 className="content__title">{t('Feed')}</h2>
      </div>
      <div className="content__info">
        <div className="content__rows">
          {map(feed, (feedPost: FeedPost, index: number) => (<FeedRow key={index} feedPost={feedPost} />))}
        </div>
      </div>
    </div>
  );
}

export default Content;
