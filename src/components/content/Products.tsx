import React, { Component } from 'react';
import { connect } from 'react-redux';
import { get, map, uniq } from 'lodash';
import { Link } from 'react-router-dom';

import Button from '../shared/Button';
import Category from '../types/Category';
import ExchangeRequest from '../types/ExchangeRequest';
import LoanRequest from '../types/LoanRequest';
import State from '../../redux/State';
import Product from '../types/Product';
import User from '../types/User';
import WarningMessage from '../shared/WarningMessage';
import { ProductsProps } from '../sections/types';
import { WarningMessageType } from '../shared/types';
import { downloadExcel } from '../helpers/DownloadHelper';
import { deleteRequest } from '../../redux/exchange-requests/actions';
import { deleteRequestLoan } from '../../redux/loan-requests/actions';
import { getProductsFromIds } from '../../services/stuff';
import { isProductsEmpty } from '../helpers/StuffHelper';
import { mapIds } from '../helpers/StuffHelper';

import './Products.scss';

class Products extends Component<ProductsProps, any> {
  state = {
    requestedProducts: [],
    message: '',
    type: WarningMessageType.EMPTY
  }

  componentDidMount() {
    const { exchangeRequests, loanRequests } = this.props;
    
    const loanIds = loanRequests.map(req => req.id_stuff);
    const exchangeIds = exchangeRequests.map(req => req.id_stuff);
    const exchangeFriendIds = exchangeRequests.map(req => req.id_friend_stuff);

    const ids = uniq([...loanIds, ...exchangeIds, ...exchangeFriendIds]);

    getProductsFromIds(mapIds(ids))
    .then(res => this.setState({ requestedProducts: res.data }));
  }

  generateReport = () => {
    const { products, user } = this.props;

    downloadExcel(products, `${user.first_name}_products`);
  }

  executeDeleteExchange = (_id: number, isLoan = false) => {
    const { deleteRequest, deleteRequestLoan } = this.props;

    if (isLoan) {
      deleteRequestLoan(_id)
      .then(() => this.setState({ message: `Loan request deleted`, type: WarningMessageType.SUCCESSFUL }))
      .catch(() => this.setState({ message: `Loan request couldn't be deleted`, type: WarningMessageType.ERROR }));
    } else {
      deleteRequest(_id)
      .then(() => this.setState({ message: `Exchange request deleted`, type: WarningMessageType.SUCCESSFUL }))
      .catch(() => this.setState({ message: `Exchange request couldn't be deleted`, type: WarningMessageType.ERROR }));  
    }
  }

  renderRequests = () => {
    const { exchangeRequests, friends, user } = this.props;
    const { requestedProducts } = this.state;

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
            const ownerProduct = requestedProducts.find((p: Product) => p.id === request.id_stuff);
            const requestorProduct = requestedProducts.find((p: Product) => p.id === request.id_friend_stuff);

            return (
              <li className="products__request" key={index}>
                <div className="products__request-group">
                  <div className="products__request-text">
                    Owner: {isUserOwner ? 'Me' : `${owner.first_name} ${owner.last_name} (${owner.email})`}
                  </div>
                  <div className="products__request-text">
                    Product: {get(ownerProduct, 'name')}
                  </div>
                  <div className="products__request-text">
                    Requestor: {isUserRequestor ? 'Me' : `${requestor.first_name} ${requestor.last_name} (${requestor.email})`}
                  </div>
                  <div className="products__request-text">
                    Product: {get(requestorProduct, 'name')}
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

  renderLoans = () => {
    const { loanRequests, friends, user } = this.props;
    const { requestedProducts } = this.state; 

    return (
      <div className="products__requests">
        <hr />
        <h3 className="products__requests-title">
          <div>Loan Requests</div>
          <div className="products__warning">{loanRequests.length}</div>
        </h3>
        <ul>
          {loanRequests.map((request: LoanRequest, index: number) => {
            const owner = request.id_stuffier === user.id ? user : friends.filter((f: User) => f.id === request.id_stuffier)[0];
            const requestor = request.id_friend === user.id ? user : friends.filter((f: User) => f.id === request.id_friend)[0];
            const isUserRequestor = user === requestor;
            const isUserOwner = user === owner;
            const rejectText = isUserRequestor ? 'Cancel' : 'Reject';
            const product = requestedProducts.find((p: Product) => p.id === request.id_stuff);

            return (
              <li className="products__request" key={index}>
                <div className="products__request-group">
                  <div className="products__request-text">
                    Owner: {isUserOwner ? 'Me' : `${owner.first_name} ${owner.last_name} (${owner.email})`}
                  </div>
                  <div className="products__request-text">
                    Requestor: {isUserRequestor ? 'Me' : `${requestor.first_name} ${requestor.last_name} (${requestor.email})`}
                  </div>
                  <div className="products__request-text">
                    Product: {get(product, 'name')}
                  </div>
                </div>
                <div className="products__request-buttons">
                  {!isUserRequestor && <div className="products__request-button">
                    <Button onClick={() => console.log("Accept Exchange")} text="Accept"></Button>
                  </div>}
                  <div className="products__request-button">
                    <Button onClick={() => this.executeDeleteExchange(request._id, true)} text={rejectText}></Button>
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
    const { categories, exchangeRequests, loanRequests, history, products, user } = this.props;
    const { message, type } = this.state;

    return (
      <div className="products">
        <WarningMessage message={message} type={type} />
        <div className="products__title">
          <h2>{user.first_name} Stuff</h2>
          <div className="products__add-product">
            <Button text="Add Product" onClick={() => history.push('/product/add')}></Button>
          </div>
        </div>
        {exchangeRequests.length > 0 && this.renderRequests()}
        {loanRequests.length > 0 && this.renderLoans()}
        <hr />
        {isProductsEmpty(products) && (<div>No Stuff! Add Products!</div>)}
        {!isProductsEmpty(products) &&
          (<div>
            {categories.map((category: Category, index: number) => {
              if (!products[category.id] || !products[category.id].length) return <div key={`${category.id}_${index}`}></div>;

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
  loanRequests: state.loanRequests,
  products: state.products
});

const mapDispatchProps = {
  deleteRequest,
  deleteRequestLoan
};

export { Products as ProductsComponent };
export default connect(mapStateToProps, mapDispatchProps)(Products);
