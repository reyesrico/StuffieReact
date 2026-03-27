import React from 'react';

import Button from '../shared/Button';
import Product from '../types/Product';
import User from '../types/User';
import { Link } from 'react-router-dom';
import { useUserRequests, usePendingProducts, useApproveUser } from '../../hooks/queries';
import './Admin.scss';

const Admin = () => {
  const { data: userRequests = [] } = useUserRequests();
  const { data: pendingProducts = [] } = usePendingProducts();
  const approveUserMutation = useApproveUser();

  const executeRequest = (user: User, isAccepted = false) => {
    if (isAccepted) {
      approveUserMutation.mutate(user);
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
              // eslint-disable-next-line react/no-array-index-key
              <li className="admin__request" key={index}>
                <div className="admin__request-text">
                  {user.first_name} {user.last_name} ({user.email})
                </div>
                <div className="admin__request-button">
                  <Button onClick={() => executeRequest(user, true)} text="Accept" />
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
