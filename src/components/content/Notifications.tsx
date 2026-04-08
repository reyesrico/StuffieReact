import React, { useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { get } from 'lodash';
import { useTranslation } from 'react-i18next';

import Button from '../shared/Button';
import Loading from '../shared/Loading';
import Modal from '../shared/Modal';
import ExchangeRequest from '../types/ExchangeRequest';
import LoanRequest from '../types/LoanRequest';
import PurchaseRequest from '../types/PurchaseRequest';
import User from '../types/User';
import WarningMessage from '../shared/WarningMessage';
import { WarningMessageType } from '../shared/types';
import { default as ProductType } from '../types/Product';
import UserContext from '../../context/UserContext';
import { useDeleteExchange, useDeleteLoan, useDeletePurchase, useAcceptFriendRequest, useRejectFriendRequest, useCancelFriendRequest } from '../../hooks/queries';
import { useNotifications } from '../../hooks/queries/useNotifications';

import './Notifications.scss';

type NotifTab = 'exchange' | 'loan' | 'buy' | 'friends';

const Notifications = () => {
  const { user } = useContext(UserContext);
  const { t } = useTranslation();

  const {
    isLoading,
    friends,
    exchangeRequests,
    loanRequests,
    purchaseRequests,
    friendRequests,
    sentFriendRequests,
    rawSentRequests,
    requestedProducts,
    totalRequests,
    removeFriendRequest,
  } = useNotifications();

  const deleteExchangeMutation = useDeleteExchange();
  const deleteLoanMutation = useDeleteLoan();
  const deletePurchaseMutation = useDeletePurchase();
  const acceptFriendMutation = useAcceptFriendRequest();
  const rejectFriendMutation = useRejectFriendRequest();
  const cancelFriendMutation = useCancelFriendRequest();

  const [message, setMessage] = useState('');
  const [type, setType] = useState(WarningMessageType.EMPTY);
  const [activeTab, setActiveTab] = useState<NotifTab>('exchange');
  const [pendingFriendId, setPendingFriendId] = useState<number | null>(null);
  const [pendingExchangeId, setPendingExchangeId] = useState<string | null>(null);
  const [pendingLoanId, setPendingLoanId] = useState<string | null>(null);
  const [pendingPurchaseId, setPendingPurchaseId] = useState<string | null>(null);
  const [confirmCancelTarget, setConfirmCancelTarget] = useState<User | null>(null);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      setMessage('');
      setType(WarningMessageType.EMPTY);
    }, 5000);
    return () => clearTimeout(timer);
  }, [message]);
  const location = useLocation();

  // Reset active tab whenever we navigate away and back to this page
  useEffect(() => {
    setActiveTab('exchange');
  }, [location.key]);

  const executeDeleteExchange = (_id: string, isLoan = false) => {
    if (isLoan) {
      setPendingLoanId(_id);
      deleteLoanMutation.mutate(_id, {
        onSuccess: () => {
          setMessage(t('products.loanDeleted'));
          setType(WarningMessageType.SUCCESSFUL);
          setPendingLoanId(null);
        },
        onError: () => {
          setMessage(t('products.loanDeleteFailed'));
          setType(WarningMessageType.ERROR);
          setPendingLoanId(null);
        },
      });
    } else {
      setPendingExchangeId(_id);
      deleteExchangeMutation.mutate(_id, {
        onSuccess: () => {
          setMessage(t('products.exchangeDeleted'));
          setType(WarningMessageType.SUCCESSFUL);
          setPendingExchangeId(null);
        },
        onError: () => {
          setMessage(t('products.exchangeDeleteFailed'));
          setType(WarningMessageType.ERROR);
          setPendingExchangeId(null);
        },
      });
    }
  };

  const executeDeletePurchase = (_id: string) => {
    setPendingPurchaseId(_id);
    deletePurchaseMutation.mutate(_id, {
      onSuccess: () => {
        setMessage(t('products.purchaseDeleted'));
        setType(WarningMessageType.SUCCESSFUL);
        setPendingPurchaseId(null);
      },
      onError: () => {
        setMessage(t('products.purchaseDeleteFailed'));
        setType(WarningMessageType.ERROR);
        setPendingPurchaseId(null);
      },
    });
  };

  const executeFriendRequest = (friend: User, isAccepted: boolean) => {
    if (!friend.id || !user.id || pendingFriendId !== null) return;
    const name = `${friend.first_name} ${friend.last_name}`;
    setPendingFriendId(friend.id);
    const mutation = isAccepted ? acceptFriendMutation : rejectFriendMutation;
    mutation.mutate(friend.id, {
      onSuccess: () => {
        removeFriendRequest(friend.id!);
        setMessage(isAccepted ? t('friends.accepted', { name }) : t('friends.rejected', { name }));
        setType(isAccepted ? WarningMessageType.SUCCESSFUL : WarningMessageType.WARNING);
        setPendingFriendId(null);
      },
      onError: () => {
        setType(WarningMessageType.ERROR);
        setPendingFriendId(null);
      },
    });
  };

  const tabsWithData: NotifTab[] = [
    ...((friendRequests.length || sentFriendRequests.length) ? ['friends' as NotifTab] : []),
    ...(Array.isArray(purchaseRequests) && purchaseRequests.length ? ['buy' as NotifTab] : []),
    ...(Array.isArray(exchangeRequests) && exchangeRequests.length ? ['exchange' as NotifTab] : []),
    ...(Array.isArray(loanRequests) && loanRequests.length ? ['loan' as NotifTab] : []),
  ];
  const effectiveTab: NotifTab = tabsWithData.includes(activeTab) ? activeTab : (tabsWithData[0] ?? 'exchange');

  if (isLoading) {
    return <Loading size="xl" message={t('common.loading')} />;
  }

  return (
    <div className="notifications">
      <WarningMessage message={message} type={type} />
      <div className="notifications__header">
        <h2 className="notifications__title">{t('notifications.title')}</h2>
      </div>

      {totalRequests === 0 && (
        <div className="notifications__empty">{t('notifications.empty')}</div>
      )}

      {totalRequests > 0 && (
        <div className="notifications__tabs">
          {tabsWithData.map(tab => {
            const count =
              tab === 'exchange' ? exchangeRequests.length :
              tab === 'loan' ? loanRequests.length :
              tab === 'buy' ? purchaseRequests.length :
              friendRequests.length + sentFriendRequests.length;
            const label =
              tab === 'exchange' ? t('notifications.tabExchange') :
              tab === 'loan' ? t('notifications.tabLoan') :
              tab === 'buy' ? t('notifications.tabBuy') :
              t('notifications.tabFriends');
            return (
              <button
                key={tab}
                type="button"
                className={`notifications__tab${effectiveTab === tab ? ' notifications__tab--active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {label}
                <span className="notifications__tab-badge">{count}</span>
              </button>
            );
          })}
        </div>
      )}

      {effectiveTab === 'exchange' && Array.isArray(exchangeRequests) && exchangeRequests.length > 0 && (
        <div className="notifications__section">
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
                        <Button onClick={() => executeDeleteExchange(request._id)} text={t('common.accept')} size="sm" variant="outline" loading={pendingExchangeId === request._id} />
                      </div>
                    )}
                    <div className="notifications__request-button">
                      <Button onClick={() => executeDeleteExchange(request._id)} text={rejectText} size="sm" variant="secondary" loading={pendingExchangeId === request._id} />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {effectiveTab === 'loan' && Array.isArray(loanRequests) && loanRequests.length > 0 && (
        <div className="notifications__section">
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
                        <Button onClick={() => executeDeleteExchange(request._id, true)} text={t('common.accept')} size="sm" variant="outline" loading={pendingLoanId === request._id} />
                      </div>
                    )}
                    <div className="notifications__request-button">
                      <Button onClick={() => executeDeleteExchange(request._id, true)} text={rejectText} size="sm" variant="secondary" loading={pendingLoanId === request._id} />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {effectiveTab === 'buy' && Array.isArray(purchaseRequests) && purchaseRequests.length > 0 && (
        <div className="notifications__section">
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
                    {!isUserRequestor && (
                      <div className="notifications__request-button">
                        <Button
                          onClick={() => executeDeletePurchase(request._id)}
                          text={t('common.accept')}
                          size="sm"
                          variant="outline"
                          loading={pendingPurchaseId === request._id}
                        />
                      </div>
                    )}
                    <div className="notifications__request-button">
                      <Button
                        onClick={() => executeDeletePurchase(request._id)}
                        text={rejectText}
                        size="sm"
                        variant="secondary"
                        loading={pendingPurchaseId === request._id}
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      {effectiveTab === 'friends' && (
        <div className="notifications__section">
          {friendRequests.length > 0 && (
            <>
              <div className="notifications__subsection-label">{t('notifications.incomingRequests')}</div>
              <ul>
                {friendRequests.map((friend: User) => (
                  <li className="notifications__request notifications__request--incoming" key={friend.id}>
                    <div className="notifications__friend-left">
                      <div className="notifications__friend-avatar">
                        {friend.first_name?.[0]?.toUpperCase()}{friend.last_name?.[0]?.toUpperCase()}
                      </div>
                      <div className="notifications__request-group">
                        <div className="notifications__request-name">
                          {friend.first_name} {friend.last_name}
                        </div>
                        <div className="notifications__request-text">{friend.email}</div>
                      </div>
                    </div>
                    <div className="notifications__request-buttons">
                      <Button onClick={() => executeFriendRequest(friend, true)} text={pendingFriendId === friend.id ? '…' : t('common.accept')} size="sm" variant="outline" disabled={pendingFriendId !== null} />
                      <Button onClick={() => executeFriendRequest(friend, false)} text={t('common.reject')} size="sm" variant="secondary" disabled={pendingFriendId !== null} />
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
          {sentFriendRequests.length > 0 && (
            <>
              <div className="notifications__subsection-label notifications__subsection-label--sent">{t('notifications.sentRequests')}</div>
              <ul>
                {sentFriendRequests.map((target: User) => (
                  <li className="notifications__request notifications__request--sent" key={target.id}>
                    <div className="notifications__friend-left">
                      <div className="notifications__friend-avatar notifications__friend-avatar--sent">
                        {target.first_name?.[0]?.toUpperCase()}{target.last_name?.[0]?.toUpperCase()}
                      </div>
                      <div className="notifications__request-group">
                        <div className="notifications__request-name">
                          {target.first_name} {target.last_name}
                        </div>
                        <div className="notifications__request-text">{target.email}</div>
                      </div>
                    </div>
                    <div className="notifications__request-buttons">
                      <span className="notifications__pending-badge">{t('friends.pendingStatus')}</span>
                      <Button
                        onClick={() => setConfirmCancelTarget(target)}
                        text={t('common.cancel')}
                        size="sm"
                        variant="secondary"
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {confirmCancelTarget && (
        <Modal
          title={t('friends.cancelRequestTitle')}
          onClose={() => !cancelFriendMutation.isPending && setConfirmCancelTarget(null)}
          disableBackdropClose={cancelFriendMutation.isPending}
          actions={
            <>
              <Button
                text={t('friends.cancelRequestConfirm')}
                variant="secondary"
                loading={cancelFriendMutation.isPending}
                onClick={() => {
                  const raw = rawSentRequests.find((r: any) => r.user_id === confirmCancelTarget.id);
                  if (raw?._id) {
                    cancelFriendMutation.mutate(raw._id, {
                      onSuccess: () => setConfirmCancelTarget(null),
                    });
                  }
                }}
              />
              <Button
                text={t('common.cancel')}
                variant="outline"
                onClick={() => setConfirmCancelTarget(null)}
                disabled={cancelFriendMutation.isPending}
              />
            </>
          }
        >
          {t('friends.cancelRequestBody', { name: `${confirmCancelTarget.first_name} ${confirmCancelTarget.last_name}` })}
        </Modal>
      )}
    </div>
  );
};

export default Notifications;
