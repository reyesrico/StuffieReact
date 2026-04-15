import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../../shared/Button';
import User from '../../types/User';

interface FriendsTabProps {
  friendRequests: User[];
  sentFriendRequests: User[];
  pendingFriendId: number | null;
  onFriendRequest: (friend: User, isAccepted: boolean) => void;
  setConfirmCancelTarget: (user: User | null) => void;
}

const FriendsTab = ({ friendRequests, sentFriendRequests, pendingFriendId, onFriendRequest, setConfirmCancelTarget }: FriendsTabProps) => {
  const { t } = useTranslation();

  return (
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
                  <Button onClick={() => onFriendRequest(friend, true)} text={pendingFriendId === friend.id ? '…' : t('common.accept')} size="sm" variant="outline" disabled={pendingFriendId !== null} />
                  <Button onClick={() => onFriendRequest(friend, false)} text={t('common.reject')} size="sm" variant="secondary" disabled={pendingFriendId !== null} />
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
  );
};

export default FriendsTab;
