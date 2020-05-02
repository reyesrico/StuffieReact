import React, { Component } from 'react';
import { Redirect, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { get, isEmpty } from 'lodash';

import Button from '../shared/Button';
import Category from '../types/Category';
import Media from '../shared/Media';
import Product from '../types/Product';
import State from '../../redux/State';
import Subcategory from '../types/Subcategory';
import SearchBar from '../shared/SearchBar';
import WarningMessage from '../shared/WarningMessage';
import { WarningMessageType } from '../shared/types';
import { ExchangeProps } from './types';
import { exchangeRequest } from '../../redux/exchange-requests/actions';
import { getProductsList } from '../helpers/StuffHelper';
import { getStuffiers } from '../../services/stuffier';

import './Exchange.scss';

class Exchange extends Component<ExchangeProps, any> {
  state = {
    userProducts: [],
    selectedProduct: {},
    message: '',
    friend: { first_name: '' },
    type: WarningMessageType.EMPTY
  }

  componentDidMount() {
    const { history, location, products } = this.props;
    const product: Product = location.product;

    if (!product || product === undefined) {
      history.push('/');
    }

    const userProducts = getProductsList(products)
      .filter(p => p.category === product.category || p.subcategory === product.subcategory);

    this.setState({ userProducts });

    getStuffiers([{ id: location.friend }])
    .then((res: any) => this.setState({ friend: res.data[0] }));  
  }

  requestExchange = () => {
    const { exchangeRequest, history, location, user } = this.props;
    const { selectedProduct } = this.state;

    const idOwner = location.friend;

    console.log('This is to execute request exchange');

    exchangeRequest(idOwner, location.product.id, user.id, get(selectedProduct, 'id'))
    .then(() => this.setState({ message: 'Exchange request successfully', type: WarningMessageType.SUCCESSFUL }))
    .catch(() => this.setState({ message: 'Exchange request failed', type: WarningMessageType.SUCCESSFUL }))
    .finally(() => history.push('/'));
  }

  selectProduct = (product: Product) => {
    this.setState({ selectedProduct: product });
  }

  renderProduct = (product: Product) => {
    const { categories, subcategories } = this.props;

    const category: Category = categories.filter(c => c.id === product.category)[0];
    const subcategory: Subcategory = subcategories.filter(s => s.id === product.subcategory)[0];

    return (
      <div className="exchange__product">
        <Media
          fileName={product.id}
          category={product.category}
          subcategory={product.subcategory}
          format="jpg"
          height="100"
          width="100"
          isProduct="true"
        />
        <div className="exchange__product-info">
          <div>{product.name}</div>
          <div>{category.name}</div>
          <div>{subcategory.name}</div>
        </div>
      </div>
    );
  }

  render() {
    const { location } = this.props;
    const { friend, selectedProduct, userProducts, message, type } = this.state;
    const product = location.product;

    if (!userProducts.length) return <div>No products to exchange under same category</div>;

    if (!product) return <Redirect to='/'/>

    return (
      <div className="exchange">
        <WarningMessage message={message} type={type} />
        <div className="exchange__header">
          <SearchBar products={userProducts} selectProduct={(p: Product) => this.selectProduct(p)} />
        </div>
        { !isEmpty(selectedProduct) &&
          <div className="exchange__content">
            <div className="exchange__compare">
              <div className="exchange__compare-info">
                <h4>My Product</h4>
                {this.renderProduct(selectedProduct)}
              </div>
              <div className="exchange__line"></div>
              <div className="exchange__compare-info">
                <h4>{friend?.first_name} Product</h4>
                {this.renderProduct(product)}
              </div>
            </div>
            <Button
              type="submit"
              onClick={this.requestExchange}
              text="Request Exchange">
            </Button>
          </div>
        }
      </div>
    );
  }
}

const mapStateToProps = (state: State) => ({
  categories: state.categories,
  products: state.products,
  subcategories: state.subcategories,
  user: state.user
});

const mapDispatchProps = {
  exchangeRequest
};

export default connect(mapStateToProps, mapDispatchProps)(withRouter<any, React.ComponentClass<any>>(Exchange));
