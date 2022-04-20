import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Button from '../shared/Button';
import Product from '../types/Product';
import State from '../../redux/State';
import User from '../types/User';
import { Link } from 'react-router-dom';
import { deleteRequestHook } from '../../redux/user-requests/actions';
import './Admin.scss';

const Admin = () => {
  const dispatch = useDispatch();
  let userRequests = useSelector((state: State) => state.userRequests);
  let pendingProducts = useSelector((state: State) => state.pendingProducts);

  const executeRequest = (user: User, isAccepted = false) => {
    if (isAccepted) {
      deleteRequestHook(user, dispatch);
    }
  }

  const renderRequests = () => {
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
                  <Button onClick={() => executeRequest(user, true)} text="Accept"></Button>
                </div>
              </li>
            )
          }
          )}
        </ul>
      </div>
    )
  }

  const renderPendingProducts = () => {
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

  return (
    <div className="admin">
      {pendingProducts.length > 0 && renderPendingProducts()}
      {userRequests.length > 0 && renderRequests()}
      <div className="admin__link"><Link to={`/category/add`}>Add Category</Link></div>
      <hr />
      <div className="admin__link"><Link to={`/subcategory/add`}>Add SubCategory</Link></div>
      <hr />
    </div>
  );
}

export default Admin;
