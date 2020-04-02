import React, { Component, RefObject } from 'react';
import { withTranslation } from 'react-i18next';

import Button from '../shared/Button';
import Loading from '../shared/Loading';
import TextField from '../shared/TextField';
import User from '../types/User';
import { addFriend, deleteRequest, getStuffiers, getFriendsRequests, requestToBeFriend } from '../../services/stuffier';
import { mapFriends, mapIds } from '../helpers/UserHelper';
import { FriendsProps } from './types';
import './Friends.scss';

class Friends extends Component<FriendsProps, any> {
  textField = React.createRef<TextField>();

  state = {
    fullFriends: [],
    friendsRequests: [],
    emailToRequest: '',
    message: null,
    textfield: null
  };

  componentDidMount() {
    const { friends, user } = this.props;
    const { fullFriends } = this.state;

    if (friends && !fullFriends.length) {
      console.log(friends);
      Promise.all([getStuffiers(mapFriends(friends)), getFriendsRequests(user.email)])
      .then((values: any) => {
        this.setState({ fullFriends: values[0].data });

        if (values[1].data.length > 0) {
          getStuffiers(mapIds(values[1].data))
          .then((res: any) => this.setState({ friendsRequests: res.data }))
        }
      });
    }
  }

  executeRequest = (friend: User, isAccepted = false) => {
    const { user } = this.props;
    let promises = [deleteRequest(user.email, friend.id)];
    isAccepted && promises.push(addFriend(user.email, friend.id));

    Promise.all(promises)
    .then((values: any) => {
      console.log(values[0].data);
      console.log('Request deleted');
      if (isAccepted) {
        console.log(values[1].data);
        console.log('Friend added');
      }
    })
    .catch(err => console.log(err));
  }

  renderRequests = () => {
    const { friendsRequests } = this.state;

    return (
      <div className="friends__requests">
        <hr />
        <h3 className="friends__title">Requests</h3>
        <ul>
          {friendsRequests.map((friend: User, index: number) => {
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

  render() {
    const { t, user } = this.props;
    const { friendsRequests, fullFriends, message, emailToRequest } = this.state;

    if (!fullFriends.length) return (<Loading size="md" />);

    return (
      <div className="friends">
        <h2 className="friends__title">{t('Friends-Title', { first_name: user.first_name })}</h2>
        <ul>
          {fullFriends.map((friend: any) => (<li key={friend.id}>{friend.first_name} {friend.last_name} - {friend.email}</li>))}
        </ul>
        {friendsRequests.length > 0 && this.renderRequests()}
        <hr />
        <div>
          <h3 className="friends__title">Add Friend</h3>
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

export default withTranslation()<any>(Friends);
