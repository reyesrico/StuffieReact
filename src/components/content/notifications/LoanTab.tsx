import React from 'react';
import { get } from 'lodash';
import { useTranslation } from 'react-i18next';
import Button from '../../shared/Button';
import LoanRequest from '../../types/LoanRequest';
import User from '../../types/User';
import { default as ProductType } from '../../types/Product';

interface LoanTabProps {
  activeLoans: LoanRequest[];
  friends: User[];
  requestedProducts: ProductType[];
  pendingLoanId: string | null;
  userId: number | undefined;
  dismissedIds: Set<string>;
  onAccept: (_id: string) => void;
  onComplete: (_id: string) => void;
  onRequestReturn: (_id: string) => void;
  onDirectDelete: (_id: string) => void;
  onDismiss: (_id: string) => void;
}

const LoanTab = ({ activeLoans, friends, requestedProducts, pendingLoanId, userId, dismissedIds, onAccept, onComplete, onRequestReturn, onDirectDelete, onDismiss }: LoanTabProps) => {
  const { t } = useTranslation();
  // id_stuffier = owner (receives the borrow request = incoming)
  // id_friend = borrower (sent the request = outgoing)
  const visible = activeLoans.filter(r => !dismissedIds.has(r._id));
  const incoming = visible.filter((r) => r.id_stuffier === userId);
  const outgoing = visible.filter((r) => r.id_friend === userId);
  const incomingPending = incoming.filter((r) => r.status === 'pending');
  const incomingActive = incoming.filter((r) => ['active', 'return_requested'].includes(r.status));
  const outgoingPending = outgoing.filter((r) => r.status === 'pending');
  const outgoingActive = outgoing.filter((r) => r.status === 'active');
  const outgoingReturnRequested = outgoing.filter((r) => r.status === 'return_requested');

  if (!activeLoans.length || !visible.length) return null;

  return (
    <div className="notifications__section">
      {incomingPending.length > 0 && (
        <>
          <div className="notifications__subsection-label">{t('notifications.incoming')}</div>
          <ul>
            {incomingPending.map((request, index) => {
              const borrower = friends.find((f) => f.id === request.id_friend);
              const product = requestedProducts.find((p) => p.id === request.id_stuff);
              return (
                // eslint-disable-next-line react/no-array-index-key
                <li className="notifications__request" key={index}>
                  <div className="notifications__request-group">
                    <div className="notifications__request-text">{t('products.requestorLabel')}{borrower ? `${borrower.first_name} ${borrower.last_name}` : t('products.unknown')}</div>
                    <div className="notifications__request-text">{t('products.productLabel')}{get(product, 'name')}</div>
                  </div>
                  <div className="notifications__request-buttons">
                    <div className="notifications__request-button">
                      <Button onClick={() => onAccept(request._id)} text={t('notifications.approveLoan')} size="sm" variant="outline" loading={pendingLoanId === request._id} />
                    </div>
                    <div className="notifications__request-button">
                      <Button onClick={() => onDirectDelete(request._id)} text={t('notifications.decline')} size="sm" variant="secondary" loading={pendingLoanId === request._id} />
                    </div>
                  </div>
                  <button className="notifications__dismiss-btn" onClick={() => onDismiss(request._id)} aria-label={t('notifications.dismiss')}>×</button>
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
            {incomingActive.map((request, index) => {
              const borrower = friends.find((f) => f.id === request.id_friend);
              const product = requestedProducts.find((p) => p.id === request.id_stuff);
              const isReturnRequested = request.status === 'return_requested';
              return (
                // eslint-disable-next-line react/no-array-index-key
                <li className="notifications__request" key={index}>
                  <div className="notifications__request-group">
                    <div className="notifications__request-text">{t('products.productLabel')}{get(product, 'name')}</div>
                    <div className="notifications__request-text">{t('notifications.loanedTo')}{borrower ? `${borrower.first_name} ${borrower.last_name}` : t('products.unknown')}</div>
                    {isReturnRequested
                      ? <span className="notifications__status-badge notifications__status-badge--accepted">{t('notifications.arrangeReturn')}</span>
                      : <span className="notifications__status-badge">{t('notifications.waitingBorrowerReturn')}</span>
                    }
                  </div>
                  {isReturnRequested && (
                    <div className="notifications__request-buttons">
                      <div className="notifications__request-button">
                        <Button onClick={() => onComplete(request._id)} text={t('notifications.confirmReturned')} size="sm" variant="outline" loading={pendingLoanId === request._id} />
                      </div>
                    </div>
                  )}
                  <button className="notifications__dismiss-btn" onClick={() => onDismiss(request._id)} aria-label={t('notifications.dismiss')}>×</button>
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
            {outgoingPending.map((request, index) => {
              const owner = friends.find((f) => f.id === request.id_stuffier);
              const product = requestedProducts.find((p) => p.id === request.id_stuff);
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
                      <Button onClick={() => onDirectDelete(request._id)} text={t('notifications.cancelRequest')} size="sm" variant="secondary" loading={pendingLoanId === request._id} />
                    </div>
                  </div>
                  <button className="notifications__dismiss-btn" onClick={() => onDismiss(request._id)} aria-label={t('notifications.dismiss')}>×</button>
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
            {outgoingActive.map((request, index) => {
              const owner = friends.find((f) => f.id === request.id_stuffier);
              const product = requestedProducts.find((p) => p.id === request.id_stuff);
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
                      <Button onClick={() => onRequestReturn(request._id)} text={t('notifications.returnItem')} size="sm" variant="outline" loading={pendingLoanId === request._id} />
                    </div>
                  </div>
                  <button className="notifications__dismiss-btn" onClick={() => onDismiss(request._id)} aria-label={t('notifications.dismiss')}>×</button>
                </li>
              );
            })}
          </ul>
        </>
      )}
      {outgoingReturnRequested.length > 0 && (
        <>
          {!outgoingPending.length && !outgoingActive.length && <div className="notifications__subsection-label">{t('notifications.outgoing')}</div>}
          <ul>
            {outgoingReturnRequested.map((request, index) => {
              const owner = friends.find((f) => f.id === request.id_stuffier);
              const product = requestedProducts.find((p) => p.id === request.id_stuff);
              return (
                // eslint-disable-next-line react/no-array-index-key
                <li className="notifications__request" key={index}>
                  <div className="notifications__request-group">
                    <div className="notifications__request-text">{t('products.productLabel')}{get(product, 'name')}</div>
                    <div className="notifications__request-text">{t('notifications.borrowedFrom')}{owner ? `${owner.first_name} ${owner.last_name}` : t('products.unknown')}</div>
                    <span className="notifications__status-badge">{t('notifications.waitingOwnerConfirm')}</span>
                  </div>
                  <button className="notifications__dismiss-btn" onClick={() => onDismiss(request._id)} aria-label={t('notifications.dismiss')}>×</button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
};

export default LoanTab;
