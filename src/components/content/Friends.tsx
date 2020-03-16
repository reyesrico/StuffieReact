import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';

import Loading from '../shared/Loading';
import { getStuffiers } from '../../services/stuffier';
import { mapFriends } from '../helpers/UserHelper';
import { FriendsProps } from './types';

class Friends extends Component<FriendsProps, any> {
  state = {
    fullFriends: [],
  };

  componentDidMount() {
    const { friends } = this.props;
    const { fullFriends } = this.state;

    if (friends && !fullFriends.length) {
      getStuffiers(mapFriends(friends))
        .then(res => this.setState({ fullFriends: res.data }));  
    }
  }

  render() {
    const { t, user } = this.props;
    const { fullFriends } = this.state;

    if (!fullFriends.length) return (<Loading size="md" />);

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
