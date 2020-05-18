import React, { Component } from 'react';
import { connect } from 'react-redux';
import { map } from 'lodash';
import { withTranslation } from 'react-i18next';

import FeedPost from '../types/FeedPost';
import FeedRow from './FeedRow';
import Loading from '../shared/Loading';
import State from '../../redux/State';
import User from '../types/User';
import { ContentProps, ContentState } from './types';
import { fetchFriendsProducts } from '../../redux/friends/actions';
import { fetchFeed } from '../../redux/feed/actions';
import './Content.scss';

class Content extends Component<ContentProps, ContentState> {
  _isMounted = false;

  state = {
    isLoading: false,
    feed: [],
  };

  componentDidMount() {
    const { feed } = this.props;
    this._isMounted = true;

    if (!feed.length) {
      this.setState({ isLoading: true });
    }

    this.getFeed();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  getFeed = () => {
    const { fetchFriendsProducts, fetchFeed, friends } = this.props;

    fetchFriendsProducts(friends)
    .then((fullFriends: User[]) => fetchFeed(fullFriends))
    .catch(() => console.log('Error Feed Fetched'))
    .finally(() => this.setState({ isLoading: false }));
  }

  render() {
    const { feed, friends, t } = this.props;
    const { isLoading } = this.state;

    if (isLoading) {
      return (
        <div className="content__loading">
          <Loading size="xl" message={t("Loading-Feed")} />
        </div>
      );
    }

    if (!friends.length || !feed.length) {
      return <div>No Friends! Add friends!</div>
    }

    return (
      <div className="content">
        <div className="content__info">
          <div className="content__rows">
            {map(feed, (feedPost: FeedPost, index) => (<FeedRow key={index} feedPost={feedPost} />))}
          </div>
        </div>
      </div>
    );
  }
};

const mapDispatchProps = {
  fetchFriendsProducts,
  fetchFeed
};

const mapStateToProps = (state: State) => ({
  user: state.user,
  friends: state.friends,
  subcategories: state.subcategories,
  feed: state.feed
});

export default connect(mapStateToProps, mapDispatchProps)(withTranslation()<any>(Content));
