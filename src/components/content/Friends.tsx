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

const Friends = () => {
  let textFieldRef = React.createRef<typeof TextField>();
  const { t } = useTranslation();

  let user = useSelector((state: State) => state.user);
  let friends = useSelector((state: State) => state.friends);
  let friendsRequests = useSelector((state: State) => state.friendsRequests);
  let [requests, setRequests] = useState([]);
  let [emailToRequest, setEmailToRequest] = useState('');
  let [message, setMessage] = useState('');
  let [executeStatus, setExecuteStatus] = useState(WarningMessageType.EMPTY);

  useEffect(() => {
    if (friendsRequests.length > 0) {
      getStuffiers(mapIds(friendsRequests))
      .then((res: any) => setRequests(res.data));
    }
  });

  const executeRequest = (friend: User, isAccepted = false) => {
    let promises = [deleteRequest(user.email, friend.id)];
    isAccepted && promises.push(addFriend(user.email, friend.id));

    Promise.all(promises)
    .then((values: any) => {
      !isAccepted && setExecuteStatus(WarningMessageType.WARNING);
      console.log(values[0].data);
      isAccepted && setExecuteStatus(WarningMessageType.SUCCESSFUL);
      isAccepted && console.log(values[1].data);
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
              <li className="friends__request" key={index}>
                <div className="friends__request-text">
                  {friend.first_name} {friend.last_name} ({friend.email})
                </div>
                <div className="friends__request-button">
                  <Button onClick={() => executeRequest(friend, true)} text="Accept"></Button>
                </div>
                <div className="friends__request-button">
                  <Button onClick={() => executeRequest(friend)} text="Reject"></Button>
                </div>
              </li>
            )}
          )}
        </ul>
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
      <ul>
        {friends.map((friend: any) => (<li key={friend.id}>{friend.first_name} {friend.last_name} - {friend.email}</li>))}
      </ul>
      {requests.length > 0 && renderRequests()}
      <hr />
      <div>
        <h3 className="friends__title">{t('Add-Friend')}</h3>
        <div className="friends__form">
          <TextField
            placeholder="Friend Email"
            type="text"
            name="friend_email"
            value={emailToRequest}
            onChange={(emailToRequest: string) => setEmailToRequest(emailToRequest)}
          />
          <div className="friends__button">
            <Button text="Request" onClick={() => handleRequest()}></Button>
          </div>
        </div>
        {message && (<div className="friends__message">{message}</div>)}
      </div>
    </div>
  );
};

export default Friends;
