import React, { Component } from 'react';
import { connect } from 'react-redux';
import { find } from 'lodash';

import Button from '../shared/Button';
import Loading from '../shared/Loading';
import Media from '../shared/Media';
import State from '../../redux/State';
import TextField from '../shared/TextField';
import WarningMessage from '../shared/WarningMessage';
import { ProductProps, ProductState } from '../sections/types';
import { WarningMessageType } from '../shared/types';
import { getProductFromProducts } from '../helpers/StuffHelper';
import { updateProduct } from '../../redux/products/actions';

import './Product.scss';

class Product extends Component<ProductProps, ProductState> {
  state = {
    id: null,
    product: { name: null, id: null, category: null, subcategory: null, cost: null },
    cost: 0.0,
    message: '',
    type: WarningMessageType.EMPTY
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
    const productFromId = getProductFromProducts(id, products);

    if (id !== prevState.id || productFromId.cost !== prevState.product.cost) {
      const p = product ? product : productFromId;
      this.setState({ id, product: p });
    }
  }

  updateCost = (clear: boolean = false) => {
    const { user, updateProduct } = this.props;
    const { product, cost } = this.state;
    const updatedCost = clear ? 0 : cost;

    updateProduct(user.id, product.id, updatedCost)
    .then(() => this.setState({ message: `Cost updated successfully`, type: WarningMessageType.SUCCESSFUL }))
    .catch(() => this.setState({ message: `Cost not updated`, type: WarningMessageType.ERROR }));
  }

  renderCost = () => {
    const { product, cost } = this.state;
    if (product.cost)
      return (
      <div className="product__cost">
        <div className="product__cost-value">Cost ${product.cost}</div>
        <div className="product__cost-button">
          <Button text="Stop Offer" onClick={() => this.updateCost(true)} />
        </div>
      </div>);
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
    const { categories, subcategories, showCost } = this.props;
    const { product, message, type } = this.state;

    if (!product) return <Loading size="lg" message="Loading product..." />;

    const category = find(categories, c => c.id === product.category);
    const subcategory = find(subcategories, s => s.id === product.subcategory);

    return (
      <div className="product">
        <WarningMessage message={message} type={type} />
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
        {showCost && this.renderCost()}
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
