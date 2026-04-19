import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import Button from '../shared/Button';
import Media from '../shared/Media';
import { FeedRowProps } from './types';
import { useSubcategories, useCategories } from '../../hooks/queries';

import './FeedRow.scss';

import { existImage, userImageUrl } from '../../lib/cloudinary';

/** Returns "Just now", "3d ago", etc. */
function relativeTime(dateString: string | undefined, t: (key: string, opts?: any) => string): string {
  if (!dateString) return '';
  const ageDays = Math.floor((Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24));
  if (ageDays < 1) return t('feedRow.justNow');
  return t('feedRow.timeAgo', { count: ageDays });
}

const FeedRow = (props: FeedRowProps) => {
  const { data: subcategories = [] } = useSubcategories();
  const { data: categories = [] } = useCategories();
  const [picture, setPicture] = React.useState<string>();
  const { feedPost } = props;
  const { t } = useTranslation();
  const navigate = useNavigate();

  React.useEffect(() => {
    existImage(feedPost.friend_id, 'stuffiers/')
      .then(() => setPicture(userImageUrl(feedPost.friend_id)))
      .catch(() => {});
  }, [feedPost.friend_id]);

  const subcategory = subcategories.find(s => s.id === feedPost.product.subcategory_id);
  const category = categories.find(c => c.id === feedPost.product.category_id);
  const categoryLabel = subcategory?.name ?? category?.name ?? null;

  const dateString = feedPost.product._created ?? feedPost.product.created_at ?? feedPost.date;
  const ageDays = dateString
    ? Math.floor((Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24))
    : Infinity;
  const isNew = ageDays < 3;
  const timeLabel = relativeTime(dateString, t);

  const cost = feedPost.product.cost;
  const hasCost = (cost ?? 0) > 0;

  const navigationState = {
    friendId: feedPost.friend_id,
    product: feedPost.product,
    breadcrumb: [{ label: t('Friends'), path: '/friends' }],
  };
  const exchangeState = { product: feedPost.product, friend: feedPost.friend_id };
  const loanState    = { product: feedPost.product, friend: feedPost.friend_id };
  const buyState     = { product: feedPost.product, friend: feedPost.friend_id };

  const handleCardClick = () => {
    navigate(`/product/${feedPost.product.id}`, { state: navigationState });
  };

  return (
    <article className="feed-card">
      {/* ── Hero image ─────────────────────────────────────────────────── */}
      <div
        className="feed-card__media"
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleCardClick()}
        aria-label={feedPost.product.name}
      >
        <Media
          fileName={feedPost.product.id}
          category={feedPost.product.category_id}
          subcategory={feedPost.product.subcategory_id}
          imageKey={feedPost.product.image_key}
          format="jpg"
          width="500"
          isProduct="true"
        />

        {/* Overlay badges */}
        <div className="feed-card__badges">
          {isNew && <span className="feed-card__badge feed-card__badge--new">{t('feedRow.newBadge')}</span>}
          {hasCost && <span className="feed-card__badge feed-card__badge--price">${cost}</span>}
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────── */}
      <div className="feed-card__body">

        {/* Friend row */}
        <div className="feed-card__friend">
          {picture
            ? <img src={picture} className="feed-card__avatar" alt={feedPost.friend_firstName} />
            : <span className="feed-card__avatar feed-card__avatar--initials">
                {feedPost.friend_firstName?.[0] ?? '?'}
              </span>}
          <div className="feed-card__friend-info">
            <span className="feed-card__friend-name">{feedPost.friend_firstName} {feedPost.friend_lastName}</span>
            {timeLabel && <span className="feed-card__time">{timeLabel}</span>}
          </div>
        </div>

        {/* Product info */}
        <div
          className="feed-card__product"
          onClick={handleCardClick}
          role="button"
          tabIndex={-1}
        >
          <h3 className="feed-card__product-name">{feedPost.product.name}</h3>
          {categoryLabel && (
            <span className="feed-card__category">{categoryLabel}</span>
          )}
        </div>

        {/* Action bar */}
        <div className="feed-card__actions">
          <Button
            variant="outline"
            size="sm"
            text={t('feedRow.borrow')}
            onClick={() => navigate('/loan', { state: loanState })}
          />
          <Button
            variant="outline"
            size="sm"
            text={t('feedRow.trade')}
            onClick={() => navigate('/exchange', { state: exchangeState })}
          />
          {hasCost && (
            <Button
              variant="primary"
              size="sm"
              text={t('feedRow.buy', { price: cost })}
              onClick={() => navigate('/buy', { state: buyState })}
            />
          )}
        </div>
      </div>
    </article>
  );
};

export default FeedRow;

