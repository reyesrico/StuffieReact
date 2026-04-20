import React, { useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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
import UserContext from '../../context/UserContext';
import { useDeleteExchange, useDeleteLoan, useDeletePurchase, useAcceptExchange, useAcceptLoan, useAcceptPurchase, useCompleteExchange, useCompleteLoan, useRequestReturnLoan, useCompletePurchase, useAcceptFriendRequest, useRejectFriendRequest, useCancelFriendRequest } from '../../hooks/queries';
import { useNotifications } from '../../hooks/queries/useNotifications';
import ExchangeTab from './notifications/ExchangeTab';
import LoanTab from './notifications/LoanTab';
import BuyTab from './notifications/BuyTab';
import FriendsTab from './notifications/FriendsTab';

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
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const dismissKey = user?.id ? `stuffie_dismissed_notifs_${user.id}` : null;

  useEffect(() => {
    if (!dismissKey) return;
    try {
      const stored = localStorage.getItem(dismissKey);
      if (stored) setDismissedIds(new Set(JSON.parse(stored)));
    } catch { /* ignore */ }
  }, [dismissKey]);

  const handleDismiss = (_id: string) => {
    if (!dismissKey) return;
    setDismissedIds(prev => {
      const next = new Set(prev);
      next.add(_id);
      try { localStorage.setItem(dismissKey, JSON.stringify(Array.from(next))); } catch { /* ignore */ }
      return next;
    });
  };

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

  const activeExchanges = exchangeRequests
    .filter((r: ExchangeRequest) => ['pending', 'accepted'].includes(r.status))
    .filter((r: ExchangeRequest) => !dismissedIds.has(r._id));
  const activeLoans = loanRequests
    .filter((r: LoanRequest) => ['pending', 'active', 'return_requested'].includes(r.status))
    .filter((r: LoanRequest) => !dismissedIds.has(r._id));
  const activePurchases = purchaseRequests
    .filter((r: PurchaseRequest) => ['pending', 'accepted'].includes(r.status))
    .filter((r: PurchaseRequest) => !dismissedIds.has(r._id));

  const visibleTotal = activeExchanges.length + activeLoans.length + activePurchases.length
    + friendRequests.length + sentFriendRequests.length;

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

      {visibleTotal === 0 && (
        <div className="notifications__empty">{t('notifications.empty')}</div>
      )}

      {visibleTotal > 0 && (
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

      {effectiveTab === 'exchange' && (
        <ExchangeTab
          activeExchanges={activeExchanges}
          friends={friends}
          requestedProducts={requestedProducts}
          pendingExchangeId={pendingExchangeId}
          userId={user.id}
          onAccept={executeAcceptExchange}
          onComplete={executeCompleteExchange}
          onDelete={executeDeleteExchange}
          dismissedIds={dismissedIds}
          onDismiss={handleDismiss}
        />
      )}

      {effectiveTab === 'loan' && (
        <LoanTab
          activeLoans={activeLoans}
          friends={friends}
          requestedProducts={requestedProducts}
          pendingLoanId={pendingLoanId}
          userId={user.id}
          onAccept={executeAcceptLoan}
          onComplete={executeCompleteLoan}
          onRequestReturn={executeRequestReturnLoan}
          onDirectDelete={(_id) => deleteLoanMutation.mutate(_id)}
          dismissedIds={dismissedIds}
          onDismiss={handleDismiss}
        />
      )}

      {effectiveTab === 'buy' && (
        <BuyTab
          activePurchases={activePurchases}
          friends={friends}
          requestedProducts={requestedProducts}
          pendingPurchaseId={pendingPurchaseId}
          userId={user.id}
          onAccept={executeAcceptPurchase}
          onComplete={executeCompletePurchase}
          onDelete={executeDeletePurchase}
          dismissedIds={dismissedIds}
          onDismiss={handleDismiss}
        />
      )}

      {effectiveTab === 'friends' && (
        <FriendsTab
          friendRequests={friendRequests}
          sentFriendRequests={sentFriendRequests}
          pendingFriendId={pendingFriendId}
          onFriendRequest={executeFriendRequest}
          setConfirmCancelTarget={setConfirmCancelTarget}
        />
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
