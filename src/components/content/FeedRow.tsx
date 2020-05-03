import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import Media from '../shared/Media';
import State from '../../redux/State';
import { FeedRowProps } from './types';
import { fetchProduct } from '../../redux/products/actions';

import './FeedRow.scss';

class FeedRow extends Component<FeedRowProps, any> {
  getProductType = () => {
    const { feedPost, subcategories } = this.props;

    let subcategory = subcategories.find(s => s.id === feedPost.product.subcategory);
    return subcategory ? subcategory.name : null;
  }

  renderMessage() {
    const { feedPost } = this.props;
  
    return (
    <div className="feed-row__description">
      <span className="feed-row__name">{feedPost.friend_firstName} {feedPost.friend_lastName} </span> added <b>{feedPost.product.name}</b> in {this.getProductType()}
    </div>
    );
  }

  render() {
    const { feedPost } = this.props;
    const exchangeTo = { pathname: `/exchange`, product: feedPost.product, friend: feedPost.friend_id };
    const loanTo = { pathname: `/loan`, product: feedPost.product, friend: feedPost.friend_id };

    return (
      <div className="feed-row">
        {this.renderMessage()}
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
          <div className="feed-row__action feed-row__link">Buy</div>
        </div>
      </div>
    );
  }
}

const mapDispatchProps = {
  fetchProduct,
};

const mapStateToProps = (state: State) => ({
  subcategories: state.subcategories
});

export default connect(mapStateToProps, mapDispatchProps)(FeedRow);
