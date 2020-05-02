import React, { Component } from 'react';
import { connect } from 'react-redux';
import { find } from 'lodash';

import Loading from '../shared/Loading';
import Media from '../shared/Media';
import State from '../../redux/State';
import { ProductProps, ProductState } from '../sections/types';
import { getProductFromProducts } from '../helpers/StuffHelper';

class Product extends Component<ProductProps, ProductState> {
  state = {
    id: null,
    product: { name: null, id: null, category: null, subcategory: null }
  }

  componentDidMount() {
    const { match, products } = this.props;
    const id = parseInt(match.params.id);
    this.setState({ id, product: getProductFromProducts(id, products) });
  }

  componentDidUpdate(prevProps: ProductProps, prevState: any) {
    const { match, products } = this.props;
    const id = match.params.id;

    if (id !== prevState.id) {
      this.setState({ id: match.params.id, product: getProductFromProducts(parseInt(id), products) });
    }
  }

  render() {
    const { categories, subcategories } = this.props;
    const { product } = this.state;

    if (!product) return <Loading size="lg" message="Loading product..." />;

    const category = find(categories, c => c.id === product.category);
    const subcategory = find(subcategories, s => s.id === product.subcategory);

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
        <div>Category: { category && category.name } </div>
        <div>Subcategory: { subcategory && subcategory.name } </div>
      </div>
    );
  }
};

const mapStateToProps = (state: State) => ({
  categories: state.categories,
  products: state.products,
  subcategories: state.subcategories
});

export default connect(mapStateToProps, {})(Product);
