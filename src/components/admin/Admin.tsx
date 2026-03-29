import React from 'react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

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
          <div>{t('admin.userRequests')}</div>
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
                  <Button onClick={() => executeRequest(user, true)} text={t('common.accept')} />
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
          <div>{t('admin.pendingProducts')}</div>
          <div className="admin__warning">{pendingProducts.length}</div>
        </h3>
        <ul>
          {pendingProducts.map((product: Product) => {
            return (<li key={product.id} className="admin__request">
              <div>{t('admin.productLabel')}{product.name}</div>
              <div>{t('admin.productDetails', { id: product.id, category: product.category, subcategory: product.subcategory })}</div>
            </li>)
          })}
        </ul>
      </div>
    );
  }

  return (
    <div className="admin">
      <div className="admin__header">
        <h2>{t('Admin')}</h2>
      </div>
      {pendingProducts.length > 0 && renderPendingProducts()}
      {userRequests.length > 0 && renderRequests()}
      <div className="admin__link"><Link to={`/category/add`}>{t('admin.addCategory')}</Link></div>
      <hr />
      <div className="admin__link"><Link to={`/subcategory/add`}>{t('admin.addSubcategory')}</Link></div>
      <hr />
    </div>
  );
}

export default Admin;
