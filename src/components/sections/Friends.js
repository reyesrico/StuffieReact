import React, { Component } from 'react';
import ReactLoading from 'react-loading';

import { getFriends } from '../services/stuffier';

class Friends extends Component {
  state = {
    friends: null,
  };

  componentDidMount() {
    const { user } = this.props;

    getFriends(user.email).then(res => {
      this.setState({ friends: res.data });
    });
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
          {friends.map((friend, index) => (<li key={index}>{friend.email_friend}</li>))}
        </ul>
      </div>
    );
  }
};

export default Friends;
