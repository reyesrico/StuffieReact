import React, { useContext, useEffect, useState } from 'react';
import { get, uniq } from 'lodash';
import { useTranslation } from 'react-i18next';

import Button from '../shared/Button';
import ExchangeRequest from '../types/ExchangeRequest';
import LoanRequest from '../types/LoanRequest';
import PurchaseRequest from '../types/PurchaseRequest';
import User from '../types/User';
import WarningMessage from '../shared/WarningMessage';
import { WarningMessageType } from '../shared/types';
import { getProductsByIds } from '../../api/products.api';
import { mapIds } from '../helpers/StuffHelper';
import { default as ProductType } from '../types/Product';
import UserContext from '../../context/UserContext';
import {
  useFriends,
  useExchangeRequests,
  useLoanRequests,
  usePurchaseRequests,
  useDeleteExchange,
  useDeleteLoan,
  useDeletePurchase,
} from '../../hooks/queries';

import './Notifications.scss';

const Notifications = () => {
  const { user } = useContext(UserContext);
  const { t } = useTranslation();

  const { data: friends = [] } = useFriends();
  const { data: exchangeRequests = [] } = useExchangeRequests();
  const { data: loanRequests = [] } = useLoanRequests();
  const { data: purchaseRequests = [] } = usePurchaseRequests();

  const deleteExchangeMutation = useDeleteExchange();
  const deleteLoanMutation = useDeleteLoan();
  const deletePurchaseMutation = useDeletePurchase();

  const [requestedProducts, setRequestedProducts] = useState<ProductType[]>([]);
  const [message, setMessage] = useState('');
  const [type, setType] = useState(WarningMessageType.EMPTY);

  useEffect(() => {
    const loanIds = Array.isArray(loanRequests) ? loanRequests.map((req: any) => req.id_stuff) : [];
    const exchangeIds = Array.isArray(exchangeRequests) ? exchangeRequests.map((req: any) => req.id_stuff) : [];
    const exchangeFriendIds = Array.isArray(exchangeRequests) ? exchangeRequests.map((req: any) => req.id_friend_stuff) : [];
    const purchaseIds = Array.isArray(purchaseRequests) ? purchaseRequests.map((req: any) => req.id_stuff) : [];
    const ids = uniq([...loanIds, ...exchangeIds, ...exchangeFriendIds, ...purchaseIds]);

    if (ids.length > 0) {
      getProductsByIds(mapIds(ids))
        .then(prods => setRequestedProducts(prods as any));
    }
  }, [exchangeRequests, loanRequests, purchaseRequests]);

  const executeDeleteExchange = (_id: string, isLoan = false) => {
    if (isLoan) {
      deleteLoanMutation.mutate(_id, {
        onSuccess: () => {
          setMessage(t('products.loanDeleted'));
          setType(WarningMessageType.SUCCESSFUL);
        },
        onError: () => {
          setMessage(t('products.loanDeleteFailed'));
          setType(WarningMessageType.ERROR);
        },
      });
    } else {
      deleteExchangeMutation.mutate(_id, {
        onSuccess: () => {
          setMessage(t('products.exchangeDeleted'));
          setType(WarningMessageType.SUCCESSFUL);
        },
        onError: () => {
          setMessage(t('products.exchangeDeleteFailed'));
          setType(WarningMessageType.ERROR);
        },
      });
    }
  };

  const totalRequests =
    (Array.isArray(exchangeRequests) ? exchangeRequests.length : 0) +
    (Array.isArray(loanRequests) ? loanRequests.length : 0) +
    (Array.isArray(purchaseRequests) ? purchaseRequests.length : 0);

  return (
    <div className="notifications">
      <WarningMessage message={message} type={type} />
      <div className="notifications__header">
        <h2 className="notifications__title">{t('notifications.title')}</h2>
      </div>

      {totalRequests === 0 && (
        <div className="notifications__empty">{t('notifications.empty')}</div>
      )}

      {Array.isArray(exchangeRequests) && exchangeRequests.length > 0 && (
        <div className="notifications__section">
          <hr />
          <h3 className="notifications__section-title">
            <span>{t('products.exchangeRequests')}</span>
            <span className="notifications__badge">{exchangeRequests.length}</span>
          </h3>
          <ul>
            {exchangeRequests.map((request: ExchangeRequest, index: number) => {
              const requestor = request.id_friend === user.id ? user : friends.filter((f: User) => f.id === request.id_friend)[0];
              const isUserRequestor = user === requestor;
              const rejectText = isUserRequestor ? t('common.cancel') : t('common.reject');
              const ownerProduct = requestedProducts.find((p: ProductType) => p.id === request.id_stuff);
              const requestorProduct = requestedProducts.find((p: ProductType) => p.id === request.id_friend_stuff);

              return (
                // eslint-disable-next-line react/no-array-index-key
                <li className="notifications__request" key={index}>
                  <div className="notifications__request-group">
                    <div className="notifications__request-text">
                      {t('products.productLabel')}{get(ownerProduct, 'name')}
                    </div>
                    <div className="notifications__request-text">
                      {t('products.requestorLabel')}{isUserRequestor ? t('products.me') : requestor ? `${requestor.first_name} ${requestor.last_name} (${requestor.email})` : t('products.unknown')}
                    </div>
                    <div className="notifications__request-text">
                      {t('products.productLabel')}{get(requestorProduct, 'name')}
                    </div>
                  </div>
                  <div className="notifications__request-buttons">
                    {!isUserRequestor && (
                      <div className="notifications__request-button">
                        <Button onClick={() => {}} text={t('common.accept')} disabled size="sm" variant="outline" />
                      </div>
                    )}
                    <div className="notifications__request-button">
                      <Button onClick={() => executeDeleteExchange(request._id)} text={rejectText} size="sm" variant="secondary" />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {Array.isArray(loanRequests) && loanRequests.length > 0 && (
        <div className="notifications__section">
          <hr />
          <h3 className="notifications__section-title">
            <span>{t('products.loanRequests')}</span>
            <span className="notifications__badge">{loanRequests.length}</span>
          </h3>
          <ul>
            {loanRequests.map((request: LoanRequest, index: number) => {
              const requestor = request.id_friend === user.id ? user : friends.filter((f: User) => f.id === request.id_friend)[0];
              const isUserRequestor = user === requestor;
              const rejectText = isUserRequestor ? t('common.cancel') : t('common.reject');
              const product = requestedProducts.find((p: ProductType) => p.id === request.id_stuff);

              return (
                // eslint-disable-next-line react/no-array-index-key
                <li className="notifications__request" key={index}>
                  <div className="notifications__request-group">
                    <div className="notifications__request-text">
                      {t('products.requestorLabel')}{isUserRequestor ? t('products.me') : requestor ? `${requestor.first_name} ${requestor.last_name} (${requestor.email})` : t('products.unknown')}
                    </div>
                    <div className="notifications__request-text">
                      {t('products.productLabel')}{get(product, 'name')}
                    </div>
                  </div>
                  <div className="notifications__request-buttons">
                    {!isUserRequestor && (
                      <div className="notifications__request-button">
                        <Button onClick={() => {}} text={t('common.accept')} disabled size="sm" variant="outline" />
                      </div>
                    )}
                    <div className="notifications__request-button">
                      <Button onClick={() => executeDeleteExchange(request._id, true)} text={rejectText} size="sm" variant="secondary" />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {Array.isArray(purchaseRequests) && purchaseRequests.length > 0 && (
        <div className="notifications__section">
          <hr />
          <h3 className="notifications__section-title">
            <span>{t('products.purchaseRequests')}</span>
            <span className="notifications__badge">{purchaseRequests.length}</span>
          </h3>
          <ul>
            {purchaseRequests.map((request: PurchaseRequest, index: number) => {
              const requestor = request.id_friend === user?.id ? user : friends.filter((f: User) => f.id === request.id_friend)[0];
              const isUserRequestor = user?.id === request.id_friend;
              const rejectText = isUserRequestor ? t('common.cancel') : t('common.reject');
              const product = requestedProducts.find((p: ProductType) => p.id === request.id_stuff);

              return (
                // eslint-disable-next-line react/no-array-index-key
                <li className="notifications__request" key={index}>
                  <div className="notifications__request-group">
                    <div className="notifications__request-text">
                      {t('products.requestorLabel')}{isUserRequestor ? t('products.me') : requestor ? `${requestor.first_name} ${requestor.last_name} (${requestor.email})` : t('products.unknown')}
                    </div>
                    <div className="notifications__request-text">
                      {t('products.productLabel')}{get(product, 'name')}
                    </div>
                    <div className="notifications__request-text">
                      {t('products.costLabel')}{request.cost}
                    </div>
                  </div>
                  <div className="notifications__request-buttons">
                    <div className="notifications__request-button">
                      <Button
                        onClick={() =>
                          deletePurchaseMutation.mutate(request._id, {
                            onSuccess: () => {
                              setMessage(t('products.purchaseDeleted'));
                              setType(WarningMessageType.SUCCESSFUL);
                            },
                            onError: () => {
                              setMessage(t('products.purchaseDeleteFailed'));
                              setType(WarningMessageType.ERROR);
                            },
                          })
                        }
                        text={rejectText}
                        size="sm"
                        variant="secondary"
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Notifications;
