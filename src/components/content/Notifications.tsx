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
import { useDeleteExchange, useDeleteLoan, useDeletePurchase, useAcceptExchange, useAcceptLoan, useAcceptPurchase, useCompleteExchange, useCompleteLoan, useRequestReturnLoan, useCompletePurchase, useAcceptFriendRequest, useRejectFriendRequest, useCancelFriendRequest } from '../../hooks/queries';
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
  const acceptExchangeMutation = useAcceptExchange();
  const acceptLoanMutation = useAcceptLoan();
  const acceptPurchaseMutation = useAcceptPurchase();
  const completeExchangeMutation = useCompleteExchange();
  const completeLoanMutation = useCompleteLoan();
  const requestReturnLoanMutation = useRequestReturnLoan();
  const completePurchaseMutation = useCompletePurchase();
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

  const executeAcceptExchange = (_id: string) => {
    setPendingExchangeId(_id);
    acceptExchangeMutation.mutate(_id, {
      onSuccess: () => {
        setMessage(t('products.exchangeAccepted'));
        setType(WarningMessageType.SUCCESSFUL);
        setPendingExchangeId(null);
      },
      onError: () => {
        setMessage(t('products.exchangeAcceptFailed'));
        setType(WarningMessageType.ERROR);
        setPendingExchangeId(null);
      },
    });
  };

  const executeAcceptLoan = (_id: string) => {
    setPendingLoanId(_id);
    acceptLoanMutation.mutate(_id, {
      onSuccess: () => {
        setMessage(t('products.loanAccepted'));
        setType(WarningMessageType.SUCCESSFUL);
        setPendingLoanId(null);
      },
      onError: () => {
        setMessage(t('products.loanAcceptFailed'));
        setType(WarningMessageType.ERROR);
        setPendingLoanId(null);
      },
    });
  };

  const executeAcceptPurchase = (_id: string) => {
    setPendingPurchaseId(_id);
    acceptPurchaseMutation.mutate(_id, {
      onSuccess: () => {
        setMessage(t('products.purchaseAccepted'));
        setType(WarningMessageType.SUCCESSFUL);
        setPendingPurchaseId(null);
      },
      onError: () => {
        setMessage(t('products.purchaseAcceptFailed'));
        setType(WarningMessageType.ERROR);
        setPendingPurchaseId(null);
      },
    });
  };

  const executeCompleteExchange = (_id: string) => {
    setPendingExchangeId(_id);
    completeExchangeMutation.mutate(_id, {
      onSuccess: () => {
        setMessage(t('notifications.completeSuccess'));
        setType(WarningMessageType.SUCCESSFUL);
        setPendingExchangeId(null);
      },
      onError: () => {
        setMessage(t('notifications.completeFailed'));
        setType(WarningMessageType.ERROR);
        setPendingExchangeId(null);
      },
    });
  };

  const executeRequestReturnLoan = (_id: string) => {
    setPendingLoanId(_id);
    requestReturnLoanMutation.mutate(_id, {
      onSuccess: () => {
        setMessage(t('notifications.returnRequested'));
        setType(WarningMessageType.SUCCESSFUL);
        setPendingLoanId(null);
      },
      onError: () => {
        setMessage(t('notifications.completeFailed'));
        setType(WarningMessageType.ERROR);
        setPendingLoanId(null);
      },
    });
  };

  const executeCompleteLoan = (_id: string) => {
    setPendingLoanId(_id);
    completeLoanMutation.mutate(_id, {
      onSuccess: () => {
        setMessage(t('notifications.completeSuccess'));
        setType(WarningMessageType.SUCCESSFUL);
        setPendingLoanId(null);
      },
      onError: () => {
        setMessage(t('notifications.completeFailed'));
        setType(WarningMessageType.ERROR);
        setPendingLoanId(null);
      },
    });
  };

  const executeCompletePurchase = (_id: string) => {
    setPendingPurchaseId(_id);
    completePurchaseMutation.mutate(_id, {
      onSuccess: () => {
        setMessage(t('notifications.completeSuccess'));
        setType(WarningMessageType.SUCCESSFUL);
        setPendingPurchaseId(null);
      },
      onError: () => {
        setMessage(t('notifications.completeFailed'));
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

  const activeExchanges = exchangeRequests.filter((r: ExchangeRequest) => ['pending', 'accepted'].includes(r.status));
  const activeLoans = loanRequests.filter((r: LoanRequest) => ['pending', 'active', 'return_requested'].includes(r.status));
  const activePurchases = purchaseRequests.filter((r: PurchaseRequest) => ['pending', 'accepted'].includes(r.status));

  const tabsWithData: NotifTab[] = [
    ...((friendRequests.length || sentFriendRequests.length) ? ['friends' as NotifTab] : []),
    ...(activePurchases.length ? ['buy' as NotifTab] : []),
    ...(activeExchanges.length ? ['exchange' as NotifTab] : []),
    ...(activeLoans.length ? ['loan' as NotifTab] : []),
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
              tab === 'exchange' ? activeExchanges.length :
              tab === 'loan' ? activeLoans.length :
              tab === 'buy' ? activePurchases.length :
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

      {effectiveTab === 'exchange' && (() => {
        const incoming = activeExchanges.filter((r: ExchangeRequest) => r.id_stuffier === user.id);
        const outgoing = activeExchanges.filter((r: ExchangeRequest) => r.id_friend === user.id);
        const incomingPending = incoming.filter((r: ExchangeRequest) => r.status === 'pending');
        const incomingAccepted = incoming.filter((r: ExchangeRequest) => r.status === 'accepted');
        const outgoingPending = outgoing.filter((r: ExchangeRequest) => r.status === 'pending');
        const outgoingAccepted = outgoing.filter((r: ExchangeRequest) => r.status === 'accepted');
        if (!activeExchanges.length) return null;
        return (
          <div className="notifications__section">
            {incomingPending.length > 0 && (
              <>
                <div className="notifications__subsection-label">{t('notifications.incoming')}</div>
                <ul>
                  {incomingPending.map((request: ExchangeRequest, index: number) => {
                    const requester = friends.find((f: User) => f.id === request.id_friend);
                    const ownerProduct = requestedProducts.find((p: ProductType) => p.id === request.id_stuff);
                    const requesterProduct = requestedProducts.find((p: ProductType) => p.id === request.id_friend_stuff);
                    return (
                      // eslint-disable-next-line react/no-array-index-key
                      <li className="notifications__request" key={index}>
                        <div className="notifications__request-group">
                          <div className="notifications__request-text">{t('products.productLabel')}{get(ownerProduct, 'name')}</div>
                          <div className="notifications__request-text">{t('products.requestorLabel')}{requester ? `${requester.first_name} ${requester.last_name}` : t('products.unknown')}</div>
                          <div className="notifications__request-text">{t('products.productLabel')}{get(requesterProduct, 'name')}</div>
                        </div>
                        <div className="notifications__request-buttons">
                          <div className="notifications__request-button">
                            <Button onClick={() => executeAcceptExchange(request._id)} text={t('common.accept')} size="sm" variant="outline" loading={pendingExchangeId === request._id} />
                          </div>
                          <div className="notifications__request-button">
                            <Button onClick={() => executeDeleteExchange(request._id)} text={t('notifications.decline')} size="sm" variant="secondary" loading={pendingExchangeId === request._id} />
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
            {incomingAccepted.length > 0 && (
              <>
                <div className="notifications__subsection-label">{t('notifications.arrangeAndComplete')}</div>
                <ul>
                  {incomingAccepted.map((request: ExchangeRequest, index: number) => {
                    const requester = friends.find((f: User) => f.id === request.id_friend);
                    const ownerProduct = requestedProducts.find((p: ProductType) => p.id === request.id_stuff);
                    const requesterProduct = requestedProducts.find((p: ProductType) => p.id === request.id_friend_stuff);
                    return (
                      // eslint-disable-next-line react/no-array-index-key
                      <li className="notifications__request" key={index}>
                        <div className="notifications__request-group">
                          <div className="notifications__request-text">{t('products.productLabel')}{get(ownerProduct, 'name')}</div>
                          <div className="notifications__request-text">{t('products.requestorLabel')}{requester ? `${requester.first_name} ${requester.last_name}` : t('products.unknown')}</div>
                          <div className="notifications__request-text">{t('products.productLabel')}{get(requesterProduct, 'name')}</div>
                        </div>
                        <div className="notifications__request-buttons">
                          <div className="notifications__request-button">
                            <Button onClick={() => executeCompleteExchange(request._id)} text={t('notifications.confirmTrade')} size="sm" variant="outline" loading={pendingExchangeId === request._id} />
                          </div>
                          <div className="notifications__request-button">
                            <Button onClick={() => executeDeleteExchange(request._id)} text={t('notifications.cancelRequest')} size="sm" variant="secondary" loading={pendingExchangeId === request._id} />
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
            {outgoingPending.length > 0 && (
              <>
                <div className="notifications__subsection-label">{t('notifications.outgoing')}</div>
                <ul>
                  {outgoingPending.map((request: ExchangeRequest, index: number) => {
                    const owner = friends.find((f: User) => f.id === request.id_stuffier);
                    const ownerProduct = requestedProducts.find((p: ProductType) => p.id === request.id_stuff);
                    const myProduct = requestedProducts.find((p: ProductType) => p.id === request.id_friend_stuff);
                    return (
                      // eslint-disable-next-line react/no-array-index-key
                      <li className="notifications__request" key={index}>
                        <div className="notifications__request-group">
                          <div className="notifications__request-text">{t('products.productLabel')}{get(ownerProduct, 'name')}</div>
                          <div className="notifications__request-text">{t('products.requestorLabel')}{owner ? `${owner.first_name} ${owner.last_name}` : t('products.unknown')}</div>
                          <div className="notifications__request-text">{t('products.productLabel')}{get(myProduct, 'name')}</div>
                          <span className="notifications__status-badge">{t('notifications.pendingResponse')}</span>
                        </div>
                        <div className="notifications__request-buttons">
                          <div className="notifications__request-button">
                            <Button onClick={() => executeDeleteExchange(request._id)} text={t('notifications.cancelRequest')} size="sm" variant="secondary" loading={pendingExchangeId === request._id} />
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
            {outgoingAccepted.length > 0 && (
              <>
                {!outgoingPending.length && <div className="notifications__subsection-label">{t('notifications.outgoing')}</div>}
                <ul>
                  {outgoingAccepted.map((request: ExchangeRequest, index: number) => {
                    const owner = friends.find((f: User) => f.id === request.id_stuffier);
                    const ownerProduct = requestedProducts.find((p: ProductType) => p.id === request.id_stuff);
                    const myProduct = requestedProducts.find((p: ProductType) => p.id === request.id_friend_stuff);
                    return (
                      // eslint-disable-next-line react/no-array-index-key
                      <li className="notifications__request" key={index}>
                        <div className="notifications__request-group">
                          <div className="notifications__request-text">{t('products.productLabel')}{get(ownerProduct, 'name')}</div>
                          <div className="notifications__request-text">{t('products.requestorLabel')}{owner ? `${owner.first_name} ${owner.last_name}` : t('products.unknown')}</div>
                          <div className="notifications__request-text">{t('products.productLabel')}{get(myProduct, 'name')}</div>
                          <span className="notifications__status-badge notifications__status-badge--accepted">{t('notifications.ownerAgreed')}</span>
                        </div>
                        <div className="notifications__request-buttons">
                          <div className="notifications__request-button">
                            <Button onClick={() => executeCompleteExchange(request._id)} text={t('notifications.confirmTrade')} size="sm" variant="outline" loading={pendingExchangeId === request._id} />
                          </div>
                          <div className="notifications__request-button">
                            <Button onClick={() => executeDeleteExchange(request._id)} text={t('notifications.cancelRequest')} size="sm" variant="secondary" loading={pendingExchangeId === request._id} />
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </div>
        );
      })()}

      {effectiveTab === 'loan' && (() => {
        const incoming = activeLoans.filter((r: LoanRequest) => r.id_friend === user.id);
        const outgoing = activeLoans.filter((r: LoanRequest) => r.id_stuffier === user.id);
        const incomingPending = incoming.filter((r: LoanRequest) => r.status === 'pending');
        const incomingActive = incoming.filter((r: LoanRequest) => ['active', 'return_requested'].includes(r.status));
        const outgoingPending = outgoing.filter((r: LoanRequest) => r.status === 'pending');
        const outgoingActive = outgoing.filter((r: LoanRequest) => r.status === 'active');
        if (!activeLoans.length) return null;
        return (
          <div className="notifications__section">
            {incomingPending.length > 0 && (
              <>
                <div className="notifications__subsection-label">{t('notifications.incoming')}</div>
                <ul>
                  {incomingPending.map((request: LoanRequest, index: number) => {
                    const borrower = friends.find((f: User) => f.id === request.id_stuffier);
                    const product = requestedProducts.find((p: ProductType) => p.id === request.id_stuff);
                    return (
                      // eslint-disable-next-line react/no-array-index-key
                      <li className="notifications__request" key={index}>
                        <div className="notifications__request-group">
                          <div className="notifications__request-text">{t('products.requestorLabel')}{borrower ? `${borrower.first_name} ${borrower.last_name}` : t('products.unknown')}</div>
                          <div className="notifications__request-text">{t('products.productLabel')}{get(product, 'name')}</div>
                        </div>
                        <div className="notifications__request-buttons">
                          <div className="notifications__request-button">
                            <Button onClick={() => executeAcceptLoan(request._id)} text={t('notifications.approveLoan')} size="sm" variant="outline" loading={pendingLoanId === request._id} />
                          </div>
                          <div className="notifications__request-button">
                            <Button onClick={() => { deleteLoanMutation.mutate(request._id); }} text={t('notifications.decline')} size="sm" variant="secondary" loading={pendingLoanId === request._id} />
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
            {incomingActive.length > 0 && (
              <>
                <div className="notifications__subsection-label">{t('notifications.activeLoan')}</div>
                <ul>
                  {incomingActive.map((request: LoanRequest, index: number) => {
                    const borrower = friends.find((f: User) => f.id === request.id_stuffier);
                    const product = requestedProducts.find((p: ProductType) => p.id === request.id_stuff);
                    const isReturnRequested = request.status === 'return_requested';
                    return (
                      // eslint-disable-next-line react/no-array-index-key
                      <li className="notifications__request" key={index}>
                        <div className="notifications__request-group">
                          <div className="notifications__request-text">{t('products.productLabel')}{get(product, 'name')}</div>
                          <div className="notifications__request-text">{t('notifications.loanedTo')}{borrower ? `${borrower.first_name} ${borrower.last_name}` : t('products.unknown')}</div>
                          {isReturnRequested && <span className="notifications__status-badge notifications__status-badge--accepted">{t('notifications.arrangeReturn')}</span>}
                        </div>
                        <div className="notifications__request-buttons">
                          <div className="notifications__request-button">
                            <Button onClick={() => executeCompleteLoan(request._id)} text={t('notifications.confirmReturned')} size="sm" variant="outline" loading={pendingLoanId === request._id} />
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
            {outgoingPending.length > 0 && (
              <>
                <div className="notifications__subsection-label">{t('notifications.outgoing')}</div>
                <ul>
                  {outgoingPending.map((request: LoanRequest, index: number) => {
                    const owner = friends.find((f: User) => f.id === request.id_friend);
                    const product = requestedProducts.find((p: ProductType) => p.id === request.id_stuff);
                    return (
                      // eslint-disable-next-line react/no-array-index-key
                      <li className="notifications__request" key={index}>
                        <div className="notifications__request-group">
                          <div className="notifications__request-text">{t('products.productLabel')}{get(product, 'name')}</div>
                          <div className="notifications__request-text">{t('products.requestorLabel')}{owner ? `${owner.first_name} ${owner.last_name}` : t('products.unknown')}</div>
                          <span className="notifications__status-badge">{t('notifications.pendingResponse')}</span>
                        </div>
                        <div className="notifications__request-buttons">
                          <div className="notifications__request-button">
                            <Button onClick={() => { deleteLoanMutation.mutate(request._id); }} text={t('notifications.cancelRequest')} size="sm" variant="secondary" loading={pendingLoanId === request._id} />
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
            {outgoingActive.length > 0 && (
              <>
                {!outgoingPending.length && <div className="notifications__subsection-label">{t('notifications.outgoing')}</div>}
                <ul>
                  {outgoingActive.map((request: LoanRequest, index: number) => {
                    const owner = friends.find((f: User) => f.id === request.id_friend);
                    const product = requestedProducts.find((p: ProductType) => p.id === request.id_stuff);
                    return (
                      // eslint-disable-next-line react/no-array-index-key
                      <li className="notifications__request" key={index}>
                        <div className="notifications__request-group">
                          <div className="notifications__request-text">{t('products.productLabel')}{get(product, 'name')}</div>
                          <div className="notifications__request-text">{t('notifications.borrowedFrom')}{owner ? `${owner.first_name} ${owner.last_name}` : t('products.unknown')}</div>
                          <span className="notifications__status-badge notifications__status-badge--accepted">{t('notifications.ownerAgreed')}</span>
                        </div>
                        <div className="notifications__request-buttons">
                          <div className="notifications__request-button">
                            <Button onClick={() => executeRequestReturnLoan(request._id)} text={t('notifications.returnItem')} size="sm" variant="outline" loading={pendingLoanId === request._id} />
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </div>
        );
      })()}

      {effectiveTab === 'buy' && (() => {
        const incoming = activePurchases.filter((r: PurchaseRequest) => r.id_stuffier === user.id);
        const outgoing = activePurchases.filter((r: PurchaseRequest) => r.id_friend === user.id);
        const incomingPending = incoming.filter((r: PurchaseRequest) => r.status === 'pending');
        const incomingAccepted = incoming.filter((r: PurchaseRequest) => r.status === 'accepted');
        const outgoingPending = outgoing.filter((r: PurchaseRequest) => r.status === 'pending');
        const outgoingAccepted = outgoing.filter((r: PurchaseRequest) => r.status === 'accepted');
        if (!activePurchases.length) return null;
        return (
          <div className="notifications__section">
            {incomingPending.length > 0 && (
              <>
                <div className="notifications__subsection-label">{t('notifications.incoming')}</div>
                <ul>
                  {incomingPending.map((request: PurchaseRequest, index: number) => {
                    const buyer = friends.find((f: User) => f.id === request.id_friend);
                    const product = requestedProducts.find((p: ProductType) => p.id === request.id_stuff);
                    return (
                      // eslint-disable-next-line react/no-array-index-key
                      <li className="notifications__request" key={index}>
                        <div className="notifications__request-group">
                          <div className="notifications__request-text">{t('products.requestorLabel')}{buyer ? `${buyer.first_name} ${buyer.last_name}` : t('products.unknown')}</div>
                          <div className="notifications__request-text">{t('products.productLabel')}{get(product, 'name')}</div>
                          <div className="notifications__request-text">{t('products.costLabel')}{request.cost}</div>
                        </div>
                        <div className="notifications__request-buttons">
                          <div className="notifications__request-button">
                            <Button onClick={() => executeAcceptPurchase(request._id)} text={t('common.accept')} size="sm" variant="outline" loading={pendingPurchaseId === request._id} />
                          </div>
                          <div className="notifications__request-button">
                            <Button onClick={() => executeDeletePurchase(request._id)} text={t('notifications.decline')} size="sm" variant="secondary" loading={pendingPurchaseId === request._id} />
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
            {incomingAccepted.length > 0 && (
              <>
                <div className="notifications__subsection-label">{t('notifications.arrangeAndComplete')}</div>
                <ul>
                  {incomingAccepted.map((request: PurchaseRequest, index: number) => {
                    const buyer = friends.find((f: User) => f.id === request.id_friend);
                    const product = requestedProducts.find((p: ProductType) => p.id === request.id_stuff);
                    return (
                      // eslint-disable-next-line react/no-array-index-key
                      <li className="notifications__request" key={index}>
                        <div className="notifications__request-group">
                          <div className="notifications__request-text">{t('products.requestorLabel')}{buyer ? `${buyer.first_name} ${buyer.last_name}` : t('products.unknown')}</div>
                          <div className="notifications__request-text">{t('products.productLabel')}{get(product, 'name')}</div>
                          <div className="notifications__request-text">{t('products.costLabel')}{request.cost}</div>
                        </div>
                        <div className="notifications__request-buttons">
                          <div className="notifications__request-button">
                            <Button onClick={() => executeCompletePurchase(request._id)} text={t('notifications.confirmTransaction')} size="sm" variant="outline" loading={pendingPurchaseId === request._id} />
                          </div>
                          <div className="notifications__request-button">
                            <Button onClick={() => executeDeletePurchase(request._id)} text={t('notifications.cancelRequest')} size="sm" variant="secondary" loading={pendingPurchaseId === request._id} />
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
            {outgoingPending.length > 0 && (
              <>
                <div className="notifications__subsection-label">{t('notifications.outgoing')}</div>
                <ul>
                  {outgoingPending.map((request: PurchaseRequest, index: number) => {
                    const seller = friends.find((f: User) => f.id === request.id_stuffier);
                    const product = requestedProducts.find((p: ProductType) => p.id === request.id_stuff);
                    return (
                      // eslint-disable-next-line react/no-array-index-key
                      <li className="notifications__request" key={index}>
                        <div className="notifications__request-group">
                          <div className="notifications__request-text">{t('products.requestorLabel')}{seller ? `${seller.first_name} ${seller.last_name}` : t('products.unknown')}</div>
                          <div className="notifications__request-text">{t('products.productLabel')}{get(product, 'name')}</div>
                          <div className="notifications__request-text">{t('products.costLabel')}{request.cost}</div>
                          <span className="notifications__status-badge">{t('notifications.pendingResponse')}</span>
                        </div>
                        <div className="notifications__request-buttons">
                          <div className="notifications__request-button">
                            <Button onClick={() => executeDeletePurchase(request._id)} text={t('notifications.cancelRequest')} size="sm" variant="secondary" loading={pendingPurchaseId === request._id} />
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
            {outgoingAccepted.length > 0 && (
              <>
                {!outgoingPending.length && <div className="notifications__subsection-label">{t('notifications.outgoing')}</div>}
                <ul>
                  {outgoingAccepted.map((request: PurchaseRequest, index: number) => {
                    const seller = friends.find((f: User) => f.id === request.id_stuffier);
                    const product = requestedProducts.find((p: ProductType) => p.id === request.id_stuff);
                    return (
                      // eslint-disable-next-line react/no-array-index-key
                      <li className="notifications__request" key={index}>
                        <div className="notifications__request-group">
                          <div className="notifications__request-text">{t('products.requestorLabel')}{seller ? `${seller.first_name} ${seller.last_name}` : t('products.unknown')}</div>
                          <div className="notifications__request-text">{t('products.productLabel')}{get(product, 'name')}</div>
                          <div className="notifications__request-text">{t('products.costLabel')}{request.cost}</div>
                          <span className="notifications__status-badge notifications__status-badge--accepted">{t('notifications.ownerAgreed')}</span>
                        </div>
                        <div className="notifications__request-buttons">
                          <div className="notifications__request-button">
                            <Button onClick={() => executeCompletePurchase(request._id)} text={t('notifications.confirmTransaction')} size="sm" variant="outline" loading={pendingPurchaseId === request._id} />
                          </div>
                          <div className="notifications__request-button">
                            <Button onClick={() => executeDeletePurchase(request._id)} text={t('notifications.cancelRequest')} size="sm" variant="secondary" loading={pendingPurchaseId === request._id} />
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </div>
        );
      })()}
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
