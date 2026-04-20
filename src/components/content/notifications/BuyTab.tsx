import React from 'react';
import { get } from 'lodash';
import { useTranslation } from 'react-i18next';
import Button from '../../shared/Button';
import PurchaseRequest from '../../types/PurchaseRequest';
import User from '../../types/User';
import { default as ProductType } from '../../types/Product';

interface BuyTabProps {
  activePurchases: PurchaseRequest[];
  friends: User[];
  requestedProducts: ProductType[];
  pendingPurchaseId: string | null;
  userId: number | undefined;
  dismissedIds: Set<string>;
  onAccept: (_id: string) => void;
  onComplete: (_id: string) => void;
  onDelete: (_id: string) => void;
  onDismiss: (_id: string) => void;
}

const BuyTab = ({ activePurchases, friends, requestedProducts, pendingPurchaseId, userId, dismissedIds, onAccept, onComplete, onDelete, onDismiss }: BuyTabProps) => {
  const { t } = useTranslation();
  const visible = activePurchases.filter(r => !dismissedIds.has(r._id));
  const incoming = visible.filter((r) => r.id_stuffier === userId);
  const outgoing = visible.filter((r) => r.id_friend === userId);
  const incomingPending = incoming.filter((r) => r.status === 'pending');
  const incomingAccepted = incoming.filter((r) => r.status === 'accepted');
  const outgoingPending = outgoing.filter((r) => r.status === 'pending');
  const outgoingAccepted = outgoing.filter((r) => r.status === 'accepted');

  if (!activePurchases.length || !visible.length) return null;

  return (
    <div className="notifications__section">
      {incomingPending.length > 0 && (
        <>
          <div className="notifications__subsection-label">{t('notifications.incoming')}</div>
          <ul>
            {incomingPending.map((request, index) => {
              const buyer = friends.find((f) => f.id === request.id_friend);
              const product = requestedProducts.find((p) => p.id === request.id_stuff);
              return (
                // eslint-disable-next-line react/no-array-index-key
                <li className="notifications__request" key={index}>
                  <div className="notifications__request-group">
                    <div className="notifications__request-text">{t('notifications.from')}{buyer ? `${buyer.first_name} ${buyer.last_name}` : t('products.unknown')}</div>
                    <div className="notifications__request-text">{t('products.productLabel')}{get(product, 'name')}</div>
                    <div className="notifications__request-text">{t('products.costLabel')}{request.cost}</div>
                  </div>
                  <div className="notifications__request-buttons">
                    <div className="notifications__request-button">
                      <Button onClick={() => onAccept(request._id)} text={t('common.accept')} size="sm" variant="outline" loading={pendingPurchaseId === request._id} />
                    </div>
                    <div className="notifications__request-button">
                      <Button onClick={() => onDelete(request._id)} text={t('notifications.decline')} size="sm" variant="secondary" loading={pendingPurchaseId === request._id} />
                    </div>
                  </div>
                  <button className="notifications__dismiss-btn" onClick={() => onDismiss(request._id)} aria-label={t('notifications.dismiss')}>×</button>
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
            {incomingAccepted.map((request, index) => {
              const buyer = friends.find((f) => f.id === request.id_friend);
              const product = requestedProducts.find((p) => p.id === request.id_stuff);
              return (
                // eslint-disable-next-line react/no-array-index-key
                <li className="notifications__request" key={index}>
                  <div className="notifications__request-group">
                    <div className="notifications__request-text">{t('notifications.from')}{buyer ? `${buyer.first_name} ${buyer.last_name}` : t('products.unknown')}</div>
                    <div className="notifications__request-text">{t('products.productLabel')}{get(product, 'name')}</div>
                    <div className="notifications__request-text">{t('products.costLabel')}{request.cost}</div>
                  </div>
                  <div className="notifications__request-buttons">
                    <div className="notifications__request-button">
                      <Button onClick={() => onComplete(request._id)} text={t('notifications.confirmTransaction')} size="sm" variant="outline" loading={pendingPurchaseId === request._id} />
                    </div>
                    <div className="notifications__request-button">
                      <Button onClick={() => onDelete(request._id)} text={t('notifications.cancelRequest')} size="sm" variant="secondary" loading={pendingPurchaseId === request._id} />
                    </div>
                  </div>
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
              const seller = friends.find((f) => f.id === request.id_stuffier);
              const product = requestedProducts.find((p) => p.id === request.id_stuff);
              return (
                // eslint-disable-next-line react/no-array-index-key
                <li className="notifications__request" key={index}>
                  <div className="notifications__request-group">
                    <div className="notifications__request-text">{t('notifications.to')}{seller ? `${seller.first_name} ${seller.last_name}` : t('products.unknown')}</div>
                    <div className="notifications__request-text">{t('products.productLabel')}{get(product, 'name')}</div>
                    <div className="notifications__request-text">{t('products.costLabel')}{request.cost}</div>
                    <span className="notifications__status-badge">{t('notifications.pendingResponse')}</span>
                  </div>
                  <div className="notifications__request-buttons">
                    <div className="notifications__request-button">
                      <Button onClick={() => onDelete(request._id)} text={t('notifications.cancelRequest')} size="sm" variant="secondary" loading={pendingPurchaseId === request._id} />
                    </div>
                  </div>
                  <button className="notifications__dismiss-btn" onClick={() => onDismiss(request._id)} aria-label={t('notifications.dismiss')}>×</button>
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
            {outgoingAccepted.map((request, index) => {
              const seller = friends.find((f) => f.id === request.id_stuffier);
              const product = requestedProducts.find((p) => p.id === request.id_stuff);
              return (
                // eslint-disable-next-line react/no-array-index-key
                <li className="notifications__request" key={index}>
                  <div className="notifications__request-group">
                    <div className="notifications__request-text">{t('notifications.to')}{seller ? `${seller.first_name} ${seller.last_name}` : t('products.unknown')}</div>
                    <div className="notifications__request-text">{t('products.productLabel')}{get(product, 'name')}</div>
                    <div className="notifications__request-text">{t('products.costLabel')}{request.cost}</div>
                    <span className="notifications__status-badge notifications__status-badge--accepted">{t('notifications.waitingSellerConfirm')}</span>
                  </div>
                  <div className="notifications__request-buttons">
                    <div className="notifications__request-button">
                      <Button onClick={() => onDelete(request._id)} text={t('notifications.cancelRequest')} size="sm" variant="secondary" loading={pendingPurchaseId === request._id} />
                    </div>
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

export default BuyTab;
