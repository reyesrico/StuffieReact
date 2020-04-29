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
import { deleteRequest } from '../../redux/exchange-requests/actions';
import { isProductsEmpty } from '../helpers/StuffHelper';
import './Products.scss';

class Products extends Component<ProductsProps, any> {
  generateReport = () => {
    const { products, user } = this.props;

    downloadExcel(products, `${user.first_name}_products`);
  }

  executeDeleteExchange = (_id: number) => {
    const { deleteRequest } = this.props;

    deleteRequest(_id)
    .then((res: any) => console.log(res))
    .catch((error: any) => console.log(error));
  }

  renderRequests = () => {
    const { exchangeRequests, friends, user } = this.props;
    
    return (
      <div className="products__requests">
        <hr />
        <h3 className="products__requests-title">
          <div>Exchange Requests</div>
          <div className="products__warning">{exchangeRequests.length}</div>
        </h3>
        <ul>
          {exchangeRequests.map((request: ExchangeRequest, index: number) => {
            const owner = request.id_stuffier === user.id ? user : friends.filter((f: User) => f.id === request.id_stuffier)[0];
            const requestor = request.id_friend === user.id ? user : friends.filter((f: User) => f.id === request.id_friend)[0];
            const isUserRequestor = user === requestor;
            const isUserOwner = user === owner;
            const rejectText = isUserRequestor ? 'Cancel' : 'Reject';

            return (
              <li className="products__request" key={index}>
                <div className="products__request-group">
                  <div className="products__request-text">
                    Owner: {isUserOwner ? 'Me' : `${owner.first_name} ${owner.last_name} (${owner.email})`}
                  </div>
                  <div className="products__request-text">
                    Requestor: {isUserRequestor ? 'Me' : `${requestor.first_name} ${requestor.last_name} (${requestor.email})`}
                  </div>
                </div>
                <div className="products__request-buttons">
                  {!isUserRequestor && <div className="products__request-button">
                    <Button onClick={() => console.log("Accept Exchange")} text="Accept"></Button>
                  </div>}
                  <div className="products__request-button">
                    <Button onClick={() => this.executeDeleteExchange(request._id)} text={rejectText}></Button>
                  </div>
                </div>
              </li>
            )}
          )}
        </ul>
      </div>
    )
  }

  render() {
    const { categories, exchangeRequests, history, products, user } = this.props;

    return (
      <div className="products">
        <div className="products__title">
          <h2>{user.first_name} Stuff</h2>
          <div className="products__add-product">
            <Button text="Add Product" onClick={() => history.push('/product/add')}></Button>
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
            <Button onClick={() => this.generateReport()} text="Generate Report"></Button>
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

const mapDispatchProps = {
  deleteRequest
};

export { Products as ProductsComponent };
export default connect(mapStateToProps, mapDispatchProps)(Products);
