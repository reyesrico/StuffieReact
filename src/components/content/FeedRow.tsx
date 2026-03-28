import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import Button from '../shared/Button';
import Media from '../shared/Media';
import { FeedRowProps } from './types';
import { useSubcategories } from '../../hooks/queries';

import './FeedRow.scss';
import Subcategory from '../types/Subcategory';
import { existImage, userImageUrl } from '../../lib/cloudinary';

const FeedRow = (props: FeedRowProps) => {
  const { data: subcategories = [] } = useSubcategories();
  const [picture, setPicture] = React.useState<string>();
  const { feedPost } = props;
  const { t } = useTranslation();
  const navigate = useNavigate();

  React.useEffect(() => {
    existImage(feedPost.friend_id, "stuffiers/")
      .then(() => setPicture(userImageUrl(feedPost.friend_id)))
      .catch(() => {}); // fallback to default if no image found
  }, [feedPost.friend_id]);

  const getProductType = () => {
    const subcategory = subcategories.find(s => s.id === feedPost.product.subcategory);
    return subcategory ? subcategory.name : null;
  }

  const renderMessage = () => {
    return (
    <div className="feed-row__description">
      {picture && (
        <img src={picture} className="feed-row__photo" alt={feedPost.friend_firstName} />
      )}
      <div className="feed-row__added">
        <span>
          <span className="feed-row__name">{feedPost.friend_firstName}</span>
          <span>{t('feedRow.added')} <b>{feedPost.product.name}</b> in {getProductType()}</span>
        </span>
      </div>
    </div>
    );
  }

  const exchangeState = { product: feedPost.product, friend: feedPost.friend_id };
  const loanState = { product: feedPost.product, friend: feedPost.friend_id };
  const buyState = { product: feedPost.product, friend: feedPost.friend_id };

  return (
    <div className="feed-row">
      {renderMessage()}
      <div className="feed-row__image">
        <Media
          fileName={feedPost.product.id}
          category={feedPost.product.category}
          subcategory={feedPost.product.subcategory}
          format="jpg"
          height="100"
          width="100"
          isProduct="true"
        />
      </div>
      <div className="feed-row__actions">
        <span className="feed-row__ask">{t('feedRow.askFor')}</span>
        <Button
          variant="ghost"
          size="sm"
          text={t('feedRow.borrow')}
          onClick={() => navigate('/loan', { state: loanState })}
        />
        <Button
          variant="ghost"
          size="sm"
          text={t('feedRow.trade')}
          onClick={() => navigate('/exchange', { state: exchangeState })}
        />
        {feedPost.product.cost && (
          <Button
            variant="ghost"
            size="sm"
            text={t('feedRow.buy')}
            onClick={() => navigate('/buy', { state: buyState })}
          />
        )}
      </div>
    </div>
  );
}

export default FeedRow;
