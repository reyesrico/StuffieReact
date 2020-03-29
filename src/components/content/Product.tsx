import React, { Component } from 'react';
import { connect } from 'react-redux';

import Loading from '../shared/Loading';
import Media from '../shared/Media';
import Stuff  from '../types/Stuff';
import { ProductProps, ProductState } from '../sections/types';
import { fetchProduct } from '../../redux/products/actions';
import { fetchCategory } from '../../redux/categories/actions';
import { fetchSubCategory } from '../../redux/subcategories/actions';

class Product extends Component<ProductProps, ProductState> {
  state: Readonly<ProductState> = {
    product: null,
    categoryName: null,
    subcategoryName: null
  };

  componentDidMount() {
    const { fetchCategory, fetchSubCategory, fetchProduct } = this.props;
    const { product } = this.state;

    if (!product) {
      const id = this.props.match.params.id;

      fetchProduct(id)
        .then((res: any) => res.data[0])
        .then((product: Stuff) => {
          this.setState({ product });
          return Promise.all([fetchCategory(product.category), fetchSubCategory(product.subcategory)])
        })
        .then((values: any) => {
          console.log(values);
          this.setState({ categoryName: values[0].data[0].name, subcategoryName: values[1].data[0].name });
        });
    }
  }

  render() {
    const { product } = this.state;

    if (!product) return <Loading size="lg" message="Loading product..." />;

    return (
      <div className="product">
        <h3>{ product.name }</h3>
        <hr />
          <Media
            fileName={product.id}
            category={product.category}
            subcategory={product.subcategory}
            isProduct="true"
            height="200"
            width="100" />
        <hr />
        <div>
          Category: { this.state.categoryName }
        </div>
        <div>
          Subcategory: { this.state.subcategoryName }
        </div>
      </div>
    );
  }
};

const mapDispatchProps = {
  fetchCategory,
  fetchSubCategory,
  fetchProduct,
};

export default connect(null, mapDispatchProps)(Product);
