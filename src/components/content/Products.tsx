import React, { Component } from 'react';
import { connect } from 'react-redux';
import { map } from 'lodash';
import { Link } from 'react-router-dom';

import Button from '../shared/Button';
import Category from '../types/Category';
import ExchangeRequest from '../types/ExchangeRequest';
import State from '../../redux/State';
import Product from '../types/Product';
import User from '../types/User';
import { ProductsProps } from '../sections/types';
import { downloadExcel } from '../helpers/DownloadHelper';
import { isProductsEmpty } from '../helpers/StuffHelper';
import './Products.scss';

class Products extends Component<ProductsProps, any> {
  generateReport = (event: any) => {
    const { products, user } = this.props;

    downloadExcel(products, `${user.first_name}_products`);
  }

  renderRequests = () => {
    const { exchangeRequests, friends, user } = this.props;
    
    return (
      <div className="products__requests">
        <hr />
        <h3 className="products__title">
          <div>Requests</div>
          <div className="products__warning">{exchangeRequests.length}</div>
        </h3>
        <ul>
          {exchangeRequests.map((request: ExchangeRequest, index: number) => {
            const owner = request.id_stuffier === user.id ? user : friends.filter((f: User) => f.id === request.id_stuffier)[0];
            const requestor = request.id_friend === user.id ? user : friends.filter((f: User) => f.id === request.id_friend)[0];

            return (
              <li className="products__request" key={index}>
                <div className="products__request-text">
                  Owner: {owner.first_name} {owner.last_name} ({owner.email})
                </div>
                <div className="products__request-text">
                  Requestor: {requestor.first_name} {requestor.last_name} ({requestor.email})
                </div>
                <div className="products__request-button">
                  <Button onClick={() => console.log("Accept Exchange")} text="Accept"></Button>
                </div>
                <div className="products__request-button">
                  <Button onClick={() => console.log("Reject Exchange")} text="Reject"></Button>
                </div>
              </li>
            )}
          )}
        </ul>
      </div>
    )
  }

  render() {
    const { categories, exchangeRequests, products, user } = this.props;

    return (
      <div className="products">
        <div className="products__title">
          <h3>{user.first_name} Stuff</h3>
          <div className="products__add-product">
            <Link to={`/product/add`}>Add Product</Link>
          </div>
        </div>
        {exchangeRequests.length > 0 && this.renderRequests()}
        <hr />
        {isProductsEmpty(products) && (<div>No Stuff! Add Products!</div>)}
        {!isProductsEmpty(products) &&
          (<div>
            {categories.map((category: Category) => {
              if (!products[category.id] || !products[category.id].length) return;

              return (
                <div key={category.id}>
                  <h4>{category.name}</h4>
                  <ul>
                    {map(products[category.id as number], (product: Product) => {
                      return (
                        <li key={`${category.id}_${product.id}`}><Link to={`/product/${product.id}`}>{product.name}</Link></li>
                      )
                    })}
                  </ul>
                </div>
              )
            })}
            <hr />
            <button onClick={event => this.generateReport(event)}>Generate Report</button>
          </div>)
        }
      </div>
    );
  }
};

const mapStateToProps = (state: State) => ({
  user: state.user,
  categories: state.categories,
  friends: state.friends,
  exchangeRequests: state.exchangeRequests,
  products: state.products
});

export { Products as ProductsComponent };
export default connect(mapStateToProps, {})(Products);
