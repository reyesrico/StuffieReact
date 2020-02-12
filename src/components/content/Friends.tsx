import React, { Component } from 'react';
import ReactLoading from 'react-loading';
import { withTranslation } from 'react-i18next';
import { map } from 'lodash';

import { getStuffiers } from '../../services/stuffier';
import { FriendsProps } from './types';

class Friends extends Component<FriendsProps> {
  state = {
    fullFriends: [],
  };


  componentDidUpdate() {
    const { friends } = this.props;
    const { fullFriends } = this.state;

    if (friends && !fullFriends) {
      const ids = map(friends, friend => {
        return {
          id: friend.id_friend
        };
      });
  
      getStuffiers(ids).then(res => {
        this.setState({ fullFriends: res.data });
      });  
    }
  }

  render() {
    const { t, user } = this.props;
    const { fullFriends } = this.state;

    if (!fullFriends) {
      return (
        <div>
          <ReactLoading type={"spinningBubbles"} color={"FF0000"} height={50} width={50} />
        </div>
      );
    }

    return (
      <div>
        <h3>{t('Friends-Title', { first_name: user.first_name })}</h3>
        <ul>
          {fullFriends.map((friend: any) => (<li key={friend.id}>{friend.first_name} {friend.last_name} - {friend.email}</li>))}
        </ul>
      </div>
    );
  }
};

export default withTranslation()<any>(Friends);
