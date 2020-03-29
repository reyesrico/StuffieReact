import React, { Component } from 'react';
import { connect } from 'react-redux';

import Media from '../shared/Media';
import Product from '../types/Product';
import { FeedRowProps } from './types';
import { fetchProduct } from '../../redux/products/actions';

import './FeedRow.scss';

class FeedRow extends Component<FeedRowProps, any> {
  state = {
    product: { id: null, name: null, category: null, subcategory: null }
  };

  componentDidMount() {
    const { fetchProduct } = this.props;
    const { product } = this.state;

    if (!product.id) {
      fetchProduct(this.props.product).then((res: any) => {
        const product: Product = res.data[0];
        this.setState({ product });
      });
    }
  }

  getProductType = () => {
    const { subcategories } = this.props;
    const { product } = this.state;

    let subcategory = subcategories.find(s => s.id === product.subcategory);
    return subcategory ? subcategory.name : null;
  }

  render() {
    const { user } = this.props;
    const { product } = this.state;

    return (
      <div className="feed-row">
        <div className="feed-row__description">
          {user.first_name} {user.last_name} added {product.name} in {this.getProductType()}  
        </div>
        <div className="feed-row__image">
          <Media
            fileName={product.id}
            category={product.category || null}
            subcategory={product.subcategory || null}
            format="jpg"
            height="100"
            width="100"
            isProduct="true"
          />
        </div>
        <div className="feed-row__actions">
          <div className="feed-row__action feed-row__text">Ask for:</div>
          <div className="feed-row__action feed-row__link">Loan</div>
          <div className="feed-row__action feed-row__link">Exchange</div>
          <div className="feed-row__action feed-row__link">Buy</div>
        </div>
      </div>
    );
  }
}

const mapDispatchProps = {
  fetchProduct,
};

export default connect(null, mapDispatchProps)(FeedRow);
