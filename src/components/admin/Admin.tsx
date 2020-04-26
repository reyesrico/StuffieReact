import React, { Component } from 'react';
import { connect } from 'react-redux';

import Button from '../shared/Button';
import Product from '../types/Product';
import State from '../../redux/State';
import User from '../types/User';
import { Link } from 'react-router-dom';
import { deleteRequest } from '../../redux/user-requests/actions';
import './Admin.scss';

class Admin extends Component<any, any> {
  executeRequest = (user: User, isAccepted = false) => {
    const { deleteRequest } = this.props;
  
    if (isAccepted) {
      deleteRequest(user).then((res: User) => {
        alert('Request Accepted and Deleted');
        const userRequests = this.state.userRequests.filter((request: User) => {
          return request._id !== res._id;
        });

        this.setState({ userRequests });
      });
    }
  }

  renderRequests = () => {
    const { userRequests } = this.props;

    return (
      <div className="admin__requests">
        <hr />
        <h3 className="admin__title">
          <div>User Requests</div>
          <div className="admin__warning">{userRequests.length}</div>
        </h3>
        <ul>
          {userRequests.map((user: User, index: number) => {
            return (
              <li className="admin__request" key={index}>
                <div className="admin__request-text">
                  {user.first_name} {user.last_name} ({user.email})
                </div>
                <div className="admin__request-button">
                  <Button onClick={() => this.executeRequest(user, true)} text="Accept"></Button>
                </div>
              </li>
            )}
          )}
        </ul>
      </div>
    )
  }

  renderPendingProducts = () => {
    const { pendingProducts } = this.props;

    console.log(pendingProducts);

    return (
      <div className="admin__requests">
        <hr />
        <h3 className="admin__title">
          <div>Products Pending of Pics</div>
          <div className="admin__warning">{pendingProducts.length}</div>
        </h3>
        <ul>
          {pendingProducts.map((product: Product) => {
            return (<li key={product.id} className="admin__request">
              <div>Product: {product.name}</div>
              <div>Id: {product.id} / Category: {product.category} / Subcategory: {product.subcategory}</div>
            </li>)
          })}
        </ul>
      </div>
    );
  }

  render() {
    const { pendingProducts, userRequests } = this.props;

    return (
      <div className="admin">
        {pendingProducts.length > 0 && this.renderPendingProducts()}
        {userRequests.length > 0 && this.renderRequests()}
        <div className="admin__link"><Link to={`/category/add`}>Add Category</Link></div>
        <hr />
        <div className="admin__link"><Link to={`/subcategory/add`}>Add SubCategory</Link></div>
        <hr />
      </div>
    );
  }
}

const mapStateToProps = (state: State) => ({
  userRequests: state.userRequests,
  pendingProducts: state.pendingProducts,
});

const mapDispatchProps = {
  deleteRequest
};

export default connect(mapStateToProps, mapDispatchProps)(Admin);
