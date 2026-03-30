import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import Button from '../shared/Button';
import TextField from '../shared/TextField';
import EmptyState from '../shared/EmptyState';
import User from '../types/User';
import UserContext from '../../context/UserContext';
import { useFriends } from '../../hooks/queries';
import { sendFriendRequest } from '../../api/friends.api';

import './Friends.scss';
import { existImage, userImageUrl } from '../../lib/cloudinary';

// ── Friend row card ──────────────────────────────────────────────────────────

type FriendRowProps = {
  user: User;
  onClick: () => void;
}

const FriendRow = ({ user, onClick }: FriendRowProps) => {
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
      <span className="friend-row__chevron">›</span>
    </div>
  );
};

// ── Add friend form ──────────────────────────────────────────────────────────

const AddFriendForm = ({ onSent }: { onSent?: () => void }) => {
  const { t } = useTranslation();
  const { user } = useContext(UserContext);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleRequest = () => {
    if (!email.trim()) return;
    sendFriendRequest(email.trim(), user.id)
      .then(() => {
        setMessage(t('friends.requestSent'));
        setIsError(false);
        setEmail('');
        onSent?.();
      })
      .catch(() => {
        setMessage(t('friends.requestFailed'));
        setIsError(true);
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
        <Button text={t('friends.requestButton')} onClick={handleRequest} />
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
  const { data: friends = [] } = useFriends();
  const [showAddPanel, setShowAddPanel] = useState(false);

  const hasFriends = friends.length > 0;

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
            icon={<span>👥</span>}
            title={t('friends.noFriendsTitle')}
            description={t('friends.noFriendsDesc')}
          />
          <div className="friends__empty-form">
            <AddFriendForm />
          </div>
        </div>
      )}

      {/* Friends list */}
      {hasFriends && (
        <div className="friends__list">
          {friends.map((friend: any) => (
            <FriendRow
              key={friend.id}
              user={friend}
              onClick={() => navigate(`/friends/${friend.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Friends;
