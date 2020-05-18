import React, { Component } from 'react';
import { connect } from 'react-redux';
import { find } from 'lodash';

import Button from '../shared/Button';
import Loading from '../shared/Loading';
import Media from '../shared/Media';
import State from '../../redux/State';
import TextField from '../shared/TextField';
import { ProductProps, ProductState } from '../sections/types';
import { getProductFromProducts } from '../helpers/StuffHelper';
import { updateProduct } from '../../redux/products/actions';

import './Product.scss';

class Product extends Component<ProductProps, ProductState> {
  state = {
    id: null,
    product: { name: null, id: null, category: null, subcategory: null, cost: null },
    cost: 0.0,
  }

  componentDidMount() {
    const { match, products, product } = this.props;

    const id = parseInt(match.params.id);
    const p = product ? product : getProductFromProducts(id, products); 
    this.setState({ id, product: p });
  }

  componentDidUpdate(prevProps: ProductProps, prevState: any) {
    const { match, products, product } = this.props;
    const id = match.params.id;

    if (id !== prevState.id) {
      const p = product ? product : getProductFromProducts(id, products); 
      this.setState({ id, product: p });
    }
  }

  updateCost = () => {
    const { user, updateProduct } = this.props;
    const { product, cost } = this.state;

    updateProduct(user.id, product.id, cost).then((res: any) => {
      console.log(res);
    });
  }

  renderCost = () => {
    const { product, cost } = this.state;
    if (product.cost)
      return (<div>Cost ${product.cost}</div>);
    else {
    return (
      <div className="product__cost">
        <div className="product__cost-text">Want to sell it? Just set a cost! (MAX $100)</div>
        <div className="product__cost-elements">
          $<TextField type="number" name="costTF" value={cost.toString()}
            min={0} max={100} onChange={(cost: number) => this.setState({ cost })} />
          <Button text="Sell" onClick={this.updateCost}/>
        </div>
      </div>);
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
        {this.renderCost()}
      </div>
    );
  }
};

const mapStateToProps = (state: State) => ({
  categories: state.categories,
  products: state.products,
  subcategories: state.subcategories,
  user: state.user
});

const mapDispatchProps = {
  updateProduct,
};

export default connect(mapStateToProps, mapDispatchProps)(Product);
