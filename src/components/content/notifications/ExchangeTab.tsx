import React from 'react';
import { get } from 'lodash';
import { useTranslation } from 'react-i18next';
import Button from '../../shared/Button';
import ExchangeRequest from '../../types/ExchangeRequest';
import User from '../../types/User';
import { default as ProductType } from '../../types/Product';

interface ExchangeTabProps {
  activeExchanges: ExchangeRequest[];
  friends: User[];
  requestedProducts: ProductType[];
  pendingExchangeId: string | null;
  userId: number | undefined;
  onAccept: (_id: string) => void;
  onComplete: (_id: string) => void;
  onDelete: (_id: string) => void;
}

const ExchangeTab = ({ activeExchanges, friends, requestedProducts, pendingExchangeId, userId, onAccept, onComplete, onDelete }: ExchangeTabProps) => {
  const { t } = useTranslation();
  const incoming = activeExchanges.filter((r) => r.id_stuffier === userId);
  const outgoing = activeExchanges.filter((r) => r.id_friend === userId);
  const incomingPending = incoming.filter((r) => r.status === 'pending');
  const incomingAccepted = incoming.filter((r) => r.status === 'accepted');
  const outgoingPending = outgoing.filter((r) => r.status === 'pending');
  const outgoingAccepted = outgoing.filter((r) => r.status === 'accepted');

  if (!activeExchanges.length) return null;

  return (
    <div className="notifications__section">
      {incomingPending.length > 0 && (
        <>
          <div className="notifications__subsection-label">{t('notifications.incoming')}</div>
          <ul>
            {incomingPending.map((request, index) => {
              const requester = friends.find((f) => f.id === request.id_friend);
              const ownerProduct = requestedProducts.find((p) => p.id === request.id_stuff);
              const requesterProduct = requestedProducts.find((p) => p.id === request.id_friend_stuff);
              return (
                // eslint-disable-next-line react/no-array-index-key
                <li className="notifications__request" key={index}>
                  <div className="notifications__request-group">
                    <div className="notifications__request-text">{t('notifications.theyOffer')}{get(requesterProduct, 'name')}</div>
                    <div className="notifications__request-text">{t('notifications.from')}{requester ? `${requester.first_name} ${requester.last_name}` : t('products.unknown')}</div>
                    <div className="notifications__request-text">{t('notifications.theyWant')}{get(ownerProduct, 'name')}</div>
                  </div>
                  <div className="notifications__request-buttons">
                    <div className="notifications__request-button">
                      <Button onClick={() => onAccept(request._id)} text={t('common.accept')} size="sm" variant="outline" loading={pendingExchangeId === request._id} />
                    </div>
                    <div className="notifications__request-button">
                      <Button onClick={() => onDelete(request._id)} text={t('notifications.decline')} size="sm" variant="secondary" loading={pendingExchangeId === request._id} />
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
            {incomingAccepted.map((request, index) => {
              const requester = friends.find((f) => f.id === request.id_friend);
              const ownerProduct = requestedProducts.find((p) => p.id === request.id_stuff);
              const requesterProduct = requestedProducts.find((p) => p.id === request.id_friend_stuff);
              return (
                // eslint-disable-next-line react/no-array-index-key
                <li className="notifications__request" key={index}>
                  <div className="notifications__request-group">
                    <div className="notifications__request-text">{t('notifications.theyOffer')}{get(requesterProduct, 'name')}</div>
                    <div className="notifications__request-text">{t('notifications.from')}{requester ? `${requester.first_name} ${requester.last_name}` : t('products.unknown')}</div>
                    <div className="notifications__request-text">{t('notifications.theyWant')}{get(ownerProduct, 'name')}</div>
                  </div>
                  <div className="notifications__request-buttons">
                    <div className="notifications__request-button">
                      <Button onClick={() => onComplete(request._id)} text={t('notifications.confirmTrade')} size="sm" variant="outline" loading={pendingExchangeId === request._id} />
                    </div>
                    <div className="notifications__request-button">
                      <Button onClick={() => onDelete(request._id)} text={t('notifications.cancelRequest')} size="sm" variant="secondary" loading={pendingExchangeId === request._id} />
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
            {outgoingPending.map((request, index) => {
              const owner = friends.find((f) => f.id === request.id_stuffier);
              const ownerProduct = requestedProducts.find((p) => p.id === request.id_stuff);
              const myProduct = requestedProducts.find((p) => p.id === request.id_friend_stuff);
              return (
                // eslint-disable-next-line react/no-array-index-key
                <li className="notifications__request" key={index}>
                  <div className="notifications__request-group">
                    <div className="notifications__request-text">{t('notifications.youOffer')}{get(myProduct, 'name')}</div>
                    <div className="notifications__request-text">{t('notifications.to')}{owner ? `${owner.first_name} ${owner.last_name}` : t('products.unknown')}</div>
                    <div className="notifications__request-text">{t('notifications.youWant')}{get(ownerProduct, 'name')}</div>
                    <span className="notifications__status-badge">{t('notifications.pendingResponse')}</span>
                  </div>
                  <div className="notifications__request-buttons">
                    <div className="notifications__request-button">
                      <Button onClick={() => onDelete(request._id)} text={t('notifications.cancelRequest')} size="sm" variant="secondary" loading={pendingExchangeId === request._id} />
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
            {outgoingAccepted.map((request, index) => {
              const owner = friends.find((f) => f.id === request.id_stuffier);
              const ownerProduct = requestedProducts.find((p) => p.id === request.id_stuff);
              const myProduct = requestedProducts.find((p) => p.id === request.id_friend_stuff);
              return (
                // eslint-disable-next-line react/no-array-index-key
                <li className="notifications__request" key={index}>
                  <div className="notifications__request-group">
                    <div className="notifications__request-text">{t('notifications.youOffer')}{get(myProduct, 'name')}</div>
                    <div className="notifications__request-text">{t('notifications.to')}{owner ? `${owner.first_name} ${owner.last_name}` : t('products.unknown')}</div>
                    <div className="notifications__request-text">{t('notifications.youWant')}{get(ownerProduct, 'name')}</div>
                    <span className="notifications__status-badge notifications__status-badge--accepted">{t('notifications.ownerAgreed')}</span>
                  </div>
                  <div className="notifications__request-buttons">
                    <div className="notifications__request-button">
                      <Button onClick={() => onComplete(request._id)} text={t('notifications.confirmTrade')} size="sm" variant="outline" loading={pendingExchangeId === request._id} />
                    </div>
                    <div className="notifications__request-button">
                      <Button onClick={() => onDelete(request._id)} text={t('notifications.cancelRequest')} size="sm" variant="secondary" loading={pendingExchangeId === request._id} />
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
};

export default ExchangeTab;
