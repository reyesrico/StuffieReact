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

  render() {
    const { user } = this.props;
    const { product } = this.state;

    return (
      <div className="feed-row">
        <div className="feed-row__image">
          <Media
            fileName={product.id}
            category={product.category || null}
            subcategory={product.subcategory || null}
            format="jpg"
            height="50"
            width="50"
            isProduct="true"
          />
        </div>
        <div className="feed-row__product">
          <h3>{product.name}</h3>
          <div className="feed-row__category">Category: {product.category}</div>
          <div className="feed-row__subcategory">Subcategory: {product.subcategory}</div>
        </div>
      </div>
    );
  }
}

const mapDispatchProps = {
  fetchProduct,
};

export default connect(null, mapDispatchProps)(FeedRow);
