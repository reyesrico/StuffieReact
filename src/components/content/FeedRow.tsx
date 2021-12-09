import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

import Media from '../shared/Media';
import State from '../../redux/State';
import { FeedRowProps } from './types';

import './FeedRow.scss';
import Subcategory from '../types/Subcategory';

const FeedRow = (props: FeedRowProps) => {
  let subcategories: Subcategory[] = useSelector((state: State) => state.subcategories);
  const { feedPost } = props;

  const getProductType = () => {
    let subcategory = subcategories.find(s => s.id === feedPost.product.subcategory);
    return subcategory ? subcategory.name : null;
  }

  const renderMessage = () => {
    return (
    <div className="feed-row__description">
      <span className="feed-row__name">{feedPost.friend_firstName} {feedPost.friend_lastName} </span> added <b>{feedPost.product.name}</b> in {getProductType()}
    </div>
    );
  }

  const exchangeTo = { pathname: `/exchange`, state: { product: feedPost.product, friend: feedPost.friend_id } };
  const loanTo = { pathname: `/loan`, state: { product: feedPost.product, friend: feedPost.friend_id } };
  const buyTo = { pathname: `/buy`, state: { product: feedPost.product, friend: feedPost.friend_id } };

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
        <div className="feed-row__action feed-row__text">Ask for:</div>
        <div className="feed-row__action feed-row__link">
          <Link to={loanTo}>Borrow</Link>
        </div>
        <div className="feed-row__action feed-row__link">
          <Link to={exchangeTo}>Trade</Link>
        </div>
        {feedPost.product.cost &&
          (<div className="feed-row__action feed-row__link">
            <Link to={buyTo}>Buy</Link>
          </div>)}
      </div>
    </div>
  );
}

export default FeedRow;
