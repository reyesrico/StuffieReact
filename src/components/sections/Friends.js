import React, { Component } from 'react';
import ReactLoading from 'react-loading';
import { map } from 'lodash';

import { getStuffiers, getFriends } from '../services/stuffier';

class Friends extends Component {
  state = {
    friends: null,
    friendsId: null,
  };

  componentDidMount() {
    const { user } = this.props;

    getFriends(user.email).then(res => {
      this.setState({ friendsId: res.data });
    });
  }

  componentDidUpdate() {
    const { friends, friendsId } = this.state;

    if (!friends) {
      const ids = map(friendsId, friend => {
        return {
          id: friend.id_friend
        };
      });
  
      getStuffiers(ids).then(res => {
        this.setState({ friends: res.data });
      });  
    }
  }

  render() {
    const { user } = this.props;
    const { friends } = this.state;

    if (!friends) {
      return (
        <div>
          <ReactLoading type={"spinningBubbles"} color={"FF0000"} height={50} width={50} />
        </div>
      );
    }

    return (
      <div>
        <h3>{user.first_name} Friends</h3>
        <ul>
          {friends.map(friend => (<li key={friend.id}>{friend.first_name} {friend.last_name} - {friend.email}</li>))}
        </ul>
      </div>
    );
  }
};

export default Friends;
