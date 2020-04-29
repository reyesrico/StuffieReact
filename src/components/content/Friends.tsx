import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import Button from '../shared/Button';
import State from '../../redux/State';
import TextField from '../shared/TextField';
import User from '../types/User';
import WarningMessage from '../shared/WarningMessage';
import { addFriend, deleteRequest, getStuffiers, requestToBeFriend } from '../../services/stuffier';
import { mapIds } from '../helpers/UserHelper';
import { FriendsProps } from './types';
import { WarningMessageType } from '../shared/types';

import './Friends.scss';

class Friends extends Component<FriendsProps, any> {
  textField = React.createRef<TextField>();

  state = {
    requests: [],
    emailToRequest: '',
    message: null,
    textfield: null,
    executeStatus: WarningMessageType.EMPTY
  };

  componentDidMount() {
    const { friendsRequests } = this.props;

    if (friendsRequests.length > 0) {
      getStuffiers(mapIds(friendsRequests))
      .then((res: any) => this.setState({ requests: res.data }));
    }
  }

  executeRequest = (friend: User, isAccepted = false) => {
    const { user } = this.props;
    let promises = [deleteRequest(user.email, friend.id)];
    isAccepted && promises.push(addFriend(user.email, friend.id));

    Promise.all(promises)
    .then((values: any) => {
      !isAccepted && this.setState({ executeStatus: WarningMessageType.WARNING });
      console.log(values[0].data);
      isAccepted && this.setState({ executeStatus: WarningMessageType.SUCCESSFUL });
      isAccepted && console.log(values[1].data);
    })
    .catch(() => this.setState({ executeStatus: WarningMessageType.ERROR }));
  }

  renderRequests = () => {
    const { requests } = this.state;

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
                  <Button onClick={() => this.executeRequest(friend, true)} text="Accept"></Button>
                </div>
                <div className="friends__request-button">
                  <Button onClick={() => this.executeRequest(friend)} text="Reject"></Button>
                </div>
              </li>
            )}
          )}
        </ul>
      </div>
    )
  }

  handleRequest = () => {
    const { user } = this.props;
    const { emailToRequest } = this.state;

    requestToBeFriend(emailToRequest, user.id)
    .then(() => this.setState({ message: 'Request sent succesfully', emailToRequest: '' }))
    .catch(() => this.setState({ message: 'Request couldnt be sent', emailToRequest: '' }))
  }

  getMessage = () => {
    const { emailToRequest, executeStatus } = this.state;
    const message =
      executeStatus === WarningMessageType.ERROR ? 'was not added' :
      executeStatus === WarningMessageType.WARNING ? 'was rejected!' :
      executeStatus === WarningMessageType.SUCCESSFUL ? 'was accepted!' : null;

    if (!message) return '';

    return `Friend ${emailToRequest} ${message}`;
  }

  render() {
    const { friends, t, user } = this.props;
    const { requests, message, emailToRequest, executeStatus } = this.state;

    return (
      <div className="friends">
        <h2 className="friends__title">{t('Friends-Title', { first_name: user.first_name })}</h2>
        <WarningMessage message={this.getMessage()} type={executeStatus}/>
        <ul>
          {friends.map((friend: any) => (<li key={friend.id}>{friend.first_name} {friend.last_name} - {friend.email}</li>))}
        </ul>
        {requests.length > 0 && this.renderRequests()}
        <hr />
        <div>
          <h3 className="friends__title">{t('Add-Friend')}</h3>
          <div className="friends__form">
            <TextField
              placeholder="Friend Email"
              type="text"
              name="friend_email"
              value={emailToRequest}
              onChange={(emailToRequest: string) => this.setState({ emailToRequest })}
            >
            </TextField>
            <div className="friends__button">
              <Button text="Request" onClick={() => this.handleRequest()}></Button>
            </div>
          </div>
          {message && (<div className="friends__message">{message}</div>)}
        </div>
      </div>
    );
  }
};

const mapStateToProps = (state: State) => ({
  user: state.user,
  friends: state.friends,
  friendsRequests: state.friendsRequests
});

export default connect(mapStateToProps, {})(withTranslation()<any>(Friends));
