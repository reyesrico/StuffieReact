import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';

import Button from '../shared/Button';
import Category from '../types/Category';
import Media from '../shared/Media';
import Product from '../types/Product';
import State from '../../redux/State';
import Subcategory from '../types/Subcategory';
import SearchBar from '../shared/SearchBar';
import { ExchangeProps } from './types';
import { getProductsList } from '../helpers/StuffHelper';

import './Exchange.scss';

class Exchange extends Component<ExchangeProps, any> {
  state = {
    userProducts: [],
    selectedProduct: {}
  }

  componentDidMount() {
    const { products } = this.props;

    this.setState({ userProducts: getProductsList(products) });
  }

  requestExchange = () => {
    console.log('This is to execute request exchange');
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
    const { selectedProduct, userProducts } = this.state;
    const product = location.product;

    if (!userProducts) return;

    if (!product) return <Redirect to='/'/>

    return (
      <div className="exchange">
        <div className="exchange__header">
          <SearchBar products={userProducts} selectProduct={(p: Product) => this.selectProduct(p)} />
        </div>
        { !isEmpty(selectedProduct) &&
          <div className="exchange__content">
            <div className="exchange__compare">
              {this.renderProduct(selectedProduct)}
              <div className="exchange__line"></div>
              {this.renderProduct(product)}
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
  subcategories: state.subcategories
});

export default connect(mapStateToProps, {})(Exchange);
