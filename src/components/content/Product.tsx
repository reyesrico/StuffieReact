import React, { Component } from 'react';
import ReactLoading from 'react-loading';
import { connect } from 'react-redux';

import { ProductProps, ProductState } from '../sections/types';
import Stuff  from '../types/Stuff';
import { fetchProduct } from '../../redux/products/actions';

class Product extends Component<ProductProps, ProductState> {
  state: Readonly<ProductState> = {
    product: null,
  };

  componentDidMount() {
    const { fetchProduct } = this.props;
    const { product } = this.state;

    if (!product) {
      const id = this.props.match.params.id;

      fetchProduct(id).then((res: any) => {
        const product: Stuff = res.data[0];
        this.setState({ product });
      });
    }
  }


  render() {
    const { product } = this.state;

    if (!product) return <ReactLoading type="spinningBubbles" color="FF0000" height={50} width={50} />;

    return (
      <div>
        <h3>{ product.name }</h3>
        <hr />
        <div>
          Category: { product.category }
        </div>
      </div>
    );
  }
};

const mapDispatchProps = {
  fetchProduct,
};

export default connect(null, mapDispatchProps)(Product);
