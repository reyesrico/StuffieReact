import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import Button from '../shared/Button';
import Modal from '../shared/Modal';
import TextField from '../shared/TextField';
import EmptyState from '../shared/EmptyState';
import User from '../types/User';
import UserContext from '../../context/UserContext';
import { useFriends, useInvalidateFriends, useSendFriendRequest, useCancelFriendRequest } from '../../hooks/queries';
import { useSentFriendRequests } from '../../hooks/queries/useFriends';
import { getUsersByIds } from '../../api/users.api';
import type Friendship from '../types/Friendship';
import { removeFriend } from '../../api/friends.api';
import { Dismiss20Regular, People20Regular } from '@fluentui/react-icons';

import './Friends.scss';
import { existImage, userImageUrl } from '../../lib/cloudinary';

// ── Friend row card ──────────────────────────────────────────────────────────

type FriendRowProps = {
  user: User;
  onClick: () => void;
  onRemove: () => void;
}

const FriendRow = ({ user, onClick, onRemove }: FriendRowProps) => {
  const [picture, setPicture] = React.useState<string>();
  const { t } = useTranslation();

  React.useEffect(() => {
    existImage(user.id, 'stuffiers/')
      .then(() => setPicture(userImageUrl(user.id!)))
      .catch(() => {});
  }, [user.id]);

  return (
    <div
      className='friend-row friend-row--clickable'
      onClick={onClick}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
      role="button"
      tabIndex={0}
      aria-label={`${user.first_name} ${user.last_name}`}
    >
      <div className='friend-row__description'>
        {picture && <img src={picture} className="friend-row__photo" alt={t('common.userPicAlt')} />}
        <div className='friend-row__info'>
          <span className='friend-row__name'>{user.first_name} {user.last_name}</span>
          <span className='friend-row__email'>{user.email}</span>
        </div>
      </div>
      <div className="friend-row__actions">
        <button
          type="button"
          className="friend-row__remove"
          onClick={e => { e.stopPropagation(); onRemove(); }}
          aria-label={t('friends.removeAriaLabel')}
        >
          <Dismiss20Regular />
        </button>
        <span className="friend-row__chevron">›</span>
      </div>
    </div>
  );
};

// ── Add friend form ──────────────────────────────────────────────────────────

const AddFriendForm = ({ onSent }: { onSent?: () => void }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const sendRequest = useSendFriendRequest();

  const handleRequest = () => {
    if (!email.trim() || sendRequest.isPending) return;
    sendRequest.mutate(email.trim(), {
      onSuccess: () => {
        setMessage(t('friends.requestSent'));
        setIsError(false);
        setEmail('');
        onSent?.();
      },
      onError: () => {
        setMessage(t('friends.requestFailed'));
        setIsError(true);
      },
    });
  };

  return (
    <div className="friends__add-form">
      <p className="friends__add-form-label">{t('friends.addFormLabel')}</p>
      <div className="friends__add-form-row">
        <TextField
          placeholder={t('friends.emailPlaceholder')}
          type="email"
          name="friend_email"
          value={email}
          onChange={(e: any) => setEmail(e.target.value)}
          onKeyPress={(e: any) => e.key === 'Enter' && handleRequest()}
          fullWidth
        />
        <Button
          text={t('friends.requestButton')}
          onClick={handleRequest}
          loading={sendRequest.isPending}
        />
      </div>
      {message && (
        <p className={`friends__add-form-message friends__add-form-message--${isError ? 'error' : 'success'}`}>
          {message}
        </p>
      )}
    </div>
  );
};

// ── Main component ───────────────────────────────────────────────────────────

const Friends = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const { data: friends = [] } = useFriends();
  const { data: sentRequests = [] } = useSentFriendRequests();
  const invalidateFriends = useInvalidateFriends();
  const cancelRequest = useCancelFriendRequest();
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<User | null>(null);
  const [removing, setRemoving] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState<Friendship | null>(null);

  // Resolve user_id numbers in sent requests to User objects for display
  const sentTargetIds = sentRequests.map((r: Friendship) => ({ id: r.user_id }));
  const { data: sentTargetUsers = [] } = useQuery<User[]>({
    queryKey: ['sentRequestTargets', sentTargetIds.map((x: { id: number }) => x.id)],
    queryFn: () => getUsersByIds(sentTargetIds),
    enabled: sentTargetIds.length > 0,
    staleTime: 0,
  });

  const hasFriends = friends.length > 0;

  const handleRemove = () => {
    if (!confirmRemove?.id || !user?.id) return;
    setRemoving(true);
    removeFriend(user.id, confirmRemove.id)
      .then(() => {
        setConfirmRemove(null);
        invalidateFriends();
      })
      .finally(() => setRemoving(false));
 };

  return (
    <div className="friends">
      <div className="friends__header">
        <h2 className="friends__page-title">{t('friends.title')}</h2>
        {hasFriends && (
          <div className="friends__header-actions">
            <Button
              text={showAddPanel ? t('common.cancel') : `+ ${t('Add-Friend')}`}
              onClick={() => setShowAddPanel(p => !p)}
              size="sm"
              variant={showAddPanel ? 'secondary' : 'outline'}
            />
          </div>
        )}
      </div>

      {/* Collapsible add panel — only when friends exist */}
      {hasFriends && showAddPanel && (
        <div className="friends__add-panel">
          <AddFriendForm onSent={() => setShowAddPanel(false)} />
        </div>
      )}

      {/* Empty state with inline add form */}
      {!hasFriends && (
        <div className="friends__empty">
          <EmptyState
            icon={<People20Regular />}
            title={t('friends.noFriendsTitle')}
            description={t('friends.noFriendsDesc')}
          />
          <div className="friends__empty-form">
            <AddFriendForm />
          </div>
        </div>
      )}

      {/* Combined friends + pending sent requests list */}
      {(hasFriends || sentRequests.length > 0) && (
        <div className="friends__list">
          {sentRequests.map((r: Friendship) => {
            const target = sentTargetUsers.find((u: User) => u.id === r.user_id);
            const initials = target
              ? `${target.first_name?.[0] ?? ''}${target.last_name?.[0] ?? ''}`.toUpperCase()
              : '?';
            return (
              <div key={r._id} className="friends__pending-item">
                <div className="friends__pending-avatar">{initials}</div>
                <div className="friends__pending-info">
                  <span className="friends__pending-name">
                    {target ? `${target.first_name} ${target.last_name}` : `#${r.user_id}`}
                  </span>
                  {target && <span className="friends__pending-email">{target.email}</span>}
                </div>
                <span className="friends__pending-badge">{t('friends.pendingStatus')}</span>
                <button
                  type="button"
                  className="friend-row__remove"
                  onClick={() => setConfirmCancel(r)}
                  disabled={cancelRequest.isPending}
                  aria-label={t('friends.cancelRequest')}
                >
                  <Dismiss20Regular />
                </button>
              </div>
            );
          })}
          {friends.map((friend: any) => (
            <FriendRow
              key={friend.id}
              user={friend}
              onClick={() => navigate(`/friends/${friend.id}`)}
              onRemove={() => setConfirmRemove(friend)}
            />
          ))}
        </div>
      )}

      {confirmRemove && (
        <Modal
          title={t('friends.removeTitle')}
          onClose={() => !removing && setConfirmRemove(null)}
          disableBackdropClose={removing}
          actions={
            <>
              <Button
                text={removing ? '…' : t('friends.removeConfirm')}
                variant="secondary"
                onClick={handleRemove}
                disabled={removing}
              />
              <Button
                text={t('common.cancel')}
                variant="outline"
                onClick={() => setConfirmRemove(null)}
                disabled={removing}
              />
            </>
          }
        >
          {t('friends.removeBody', { name: `${confirmRemove.first_name} ${confirmRemove.last_name}` })}
        </Modal>
      )}

      {confirmCancel && (() => {
        const target = sentTargetUsers.find((u: User) => u.id === confirmCancel.user_id);
        const name = target ? `${target.first_name} ${target.last_name}` : `#${confirmCancel.user_id}`;
        return (
          <Modal
            title={t('friends.cancelRequestTitle')}
            onClose={() => !cancelRequest.isPending && setConfirmCancel(null)}
            disableBackdropClose={cancelRequest.isPending}
            actions={
              <>
                <Button
                  text={t('friends.cancelRequestConfirm')}
                  variant="secondary"
                  loading={cancelRequest.isPending}
                  onClick={() => confirmCancel._id && cancelRequest.mutate(confirmCancel._id, {
                    onSuccess: () => setConfirmCancel(null),
                  })}
                />
                <Button
                  text={t('common.cancel')}
                  variant="outline"
                  onClick={() => setConfirmCancel(null)}
                  disabled={cancelRequest.isPending}
                />
              </>
            }
          >
            {t('friends.cancelRequestBody', { name })}
          </Modal>
        );
      })()}
    </div>
  );
};

export default Friends;
