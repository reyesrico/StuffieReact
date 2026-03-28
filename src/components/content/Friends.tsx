import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Button from '../shared/Button';
import TextField from '../shared/TextField';
import User from '../types/User';
import UserContext from '../../context/UserContext';
import WarningMessage from '../shared/WarningMessage';
import { useFriends, useFriendRequests } from '../../hooks/queries';
import { addFriend, rejectFriendRequest, sendFriendRequest } from '../../api/friends.api';
import { getUsersByIds } from '../../api/users.api';
import { mapIds } from '../helpers/UserHelper';
import { WarningMessageType } from '../shared/types';

import './Friends.scss';
import { existImage, userImageUrl } from '../../lib/cloudinary';

type FriendRowProps = {
  user: User
}

const FriendRow = ({ user }: FriendRowProps) => {
  const [picture, setPicture] = React.useState<string>();
  const { t } = useTranslation();

  React.useEffect(() => {
    existImage(user.id, "stuffiers/")
      .then(() => setPicture(userImageUrl(user.id)))
      .catch(() => {}); // fallback to default if no image found
  }, [user.id]);

  return (
    <div className='friend-row'>
      <div className='friend-row__description'>
        {picture && (<img src={picture} className="friend-row__photo" alt={t('common.userPicAlt')} />)}
        <div className='friend-row__info'>
          <span className='friend-row__name'>{user.first_name} {user.last_name}</span>
          <span className='friend-row__email'>{user.email}</span>
        </div>
      </div>
    </div>
  );
}

const Friends = () => {
  // let textFieldRef = React.createRef<typeof TextField>();
  const { t } = useTranslation();

  const { user } = useContext(UserContext);
  const { data: friends = [] } = useFriends();
  const { data: friendsRequests = [] } = useFriendRequests();
  const [requests, setRequests] = useState([]);
  const [emailToRequest, setEmailToRequest] = useState('');
  const [message, setMessage] = useState('');
  const [executeStatus, setExecuteStatus] = useState(WarningMessageType.EMPTY);

  useEffect(() => {
    if (friendsRequests.length > 0) {
      getUsersByIds(mapIds(friendsRequests))
      .then((users) => setRequests(users as any));
    }
  }, [friendsRequests]);

  const executeRequest = (friend: User, isAccepted = false) => {
    if (!friend.id || !user.email) return;
    
    const promises: Promise<unknown>[] = [rejectFriendRequest(user.email, friend.id)];
    if (isAccepted) {
      promises.push(addFriend(user.email, friend.id));
    }

    Promise.all(promises)
    .then((_values: any) => {
      !isAccepted && setExecuteStatus(WarningMessageType.WARNING);
      isAccepted && setExecuteStatus(WarningMessageType.SUCCESSFUL);
    })
    .catch(() => setExecuteStatus(WarningMessageType.ERROR));
  }

  const renderRequests = () => {
    return (
      <div className="friends__requests">
        <hr />
        <h3 className="friends__title">
          <div>{t('friends.requests')}</div>
          <div className="friends__warning">{requests.length}</div>
        </h3>
        <ul>
          {requests.map((friend: User, index: number) => {
            return (
              // eslint-disable-next-line react/no-array-index-key
              <li className="friends__request" key={index}>
                <div className="friends__request-text">
                {friend.first_name} {friend.last_name} ({friend.email})
                </div>
                <div className="friends__request-button">
                  <Button onClick={() => executeRequest(friend, true)} text={t('common.accept')} />
                </div>
                <div className="friends__request-button">
                  <Button onClick={() => executeRequest(friend)} text={t('common.reject')} />
                </div>
              </li>
            )}
          )}
        </ul>
        <hr />
      </div>
    )
  }

  const handleRequest = () => {
    sendFriendRequest(emailToRequest, user.id)
    .then(() => {
      setMessage(t('friends.requestSent'));
      setEmailToRequest('');
    })
    .catch(() => {
      setMessage(t('friends.requestFailed'));
      setEmailToRequest('');
    });
  }

  const getMessage = () => {
    const status =
      executeStatus === WarningMessageType.ERROR ? t('friends.notAdded') :
      executeStatus === WarningMessageType.WARNING ? t('friends.rejected') :
      executeStatus === WarningMessageType.SUCCESSFUL ? t('friends.accepted') : null;

    if (!status) return '';

    return t('friends.statusMessage', { email: emailToRequest, status });
  }

  return (
    <div className="friends">
      <h2 className="friends__title">{t('Friends-Title', { first_name: user.first_name })}</h2>
      <WarningMessage message={getMessage()} type={executeStatus}/>
      <div className="friends__list">
        {friends.map((friend: any) => (
          <FriendRow key={friend.id} user={friend} />
        ))}
      </div>
      {requests.length > 0 && renderRequests()}
      <div>
        <h3 className="friends__title">{t('Add-Friend')}</h3>
        <div className="friends__form">
          <TextField
            placeholder={t('friends.emailPlaceholder')}
            type="text"
            name="friend_email"
            value={emailToRequest}
            onChange={(e: any) => setEmailToRequest(e.target.value)}
          />
          <div className="friends__button">
            <Button text={t('friends.requestButton')} onClick={() => handleRequest()} />
          </div>
        </div>
        {message && (<div className="friends__message">{message}</div>)}
      </div>
    </div>
  );
};

export default Friends;
