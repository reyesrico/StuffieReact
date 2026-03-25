import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Button from '../shared/Button';
import State from '../../redux/State';
import TextField from '../shared/TextField';
import User from '../types/User';
import WarningMessage from '../shared/WarningMessage';
import { addFriend, deleteRequest, getStuffiers, requestToBeFriend } from '../../services/stuffier';
import { mapIds } from '../helpers/UserHelper';
import { WarningMessageType } from '../shared/types';

import './Friends.scss';
import { useSelector } from 'react-redux';
import { existImage, userImageUrl } from '../../services/cloudinary-helper';

type FriendRowProps = {
  user: User
}

const FriendRow = ({ user }: FriendRowProps) => {
  const [picture, setPicture] = React.useState<string>();

  React.useEffect(() => {
    existImage(user.id, "stuffiers/")
      .then(() => setPicture(userImageUrl(user.id)))
      .catch(() => {}); // fallback to default if no image found
  }, [user.id]);

  return (
    <div className='friend-row'>
      <div className='friend-row__description'>
        {picture && (<img src={picture} className="friend-row__photo" alt="User Pic" />)}
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

  const user = useSelector((state: State) => state.user);
  const friends = useSelector((state: State) => state.friends);
  const friendsRequests = useSelector((state: State) => state.friendsRequests);
  const [requests, setRequests] = useState([]);
  const [emailToRequest, setEmailToRequest] = useState('');
  const [message, setMessage] = useState('');
  const [executeStatus, setExecuteStatus] = useState(WarningMessageType.EMPTY);

  useEffect(() => {
    if (friendsRequests.length > 0) {
      getStuffiers(mapIds(friendsRequests))
      .then((res: any) => setRequests(res.data));
    }
  }, [friendsRequests]);

  const executeRequest = (friend: User, isAccepted = false) => {
    const promises = [deleteRequest(user.email, friend.id)];
    isAccepted && promises.push(addFriend(user.email, friend.id));

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
          <div>Requests</div>
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
                  <Button onClick={() => executeRequest(friend, true)} text="Accept" />
                </div>
                <div className="friends__request-button">
                  <Button onClick={() => executeRequest(friend)} text="Reject" />
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
    requestToBeFriend(emailToRequest, user.id)
    .then(() => {
      setMessage('Request sent succesfully');
      setEmailToRequest('');
    })
    .catch(() => {
      setMessage('Request couldnt be sent');
      setEmailToRequest('');
    });
  }

  const getMessage = () => {
    const message =
      executeStatus === WarningMessageType.ERROR ? 'was not added' :
      executeStatus === WarningMessageType.WARNING ? 'was rejected!' :
      executeStatus === WarningMessageType.SUCCESSFUL ? 'was accepted!' : null;

    if (!message) return '';

    return `Friend ${emailToRequest} ${message}`;
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
            placeholder="Friend Email"
            type="text"
            name="friend_email"
            value={emailToRequest}
            onChange={(e: any) => setEmailToRequest(e.target.value)}
          />
          <div className="friends__button">
            <Button text="Request" onClick={() => handleRequest()} />
          </div>
        </div>
        {message && (<div className="friends__message">{message}</div>)}
      </div>
    </div>
  );
};

export default Friends;
