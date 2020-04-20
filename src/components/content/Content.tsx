import React, { Component } from 'react';
import { connect } from 'react-redux';
import { isEmpty, map, sortBy } from 'lodash';

import FeedPost from '../types/FeedPost';
import FeedRow from './FeedRow';
import Loading from '../shared/Loading';
import State from '../../redux/State';
import User from '../types/User';
import { ContentProps, ContentState } from './types';
import { fetchFriendsProducts } from '../../redux/friends/actions';
import './Content.scss';

class Content extends Component<ContentProps, ContentState> {
  state = {
    isLoading: false,
    feed: [],
  };

  componentDidMount = () => {
    const { fetchFriendsProducts, friends } = this.props;

    if (isEmpty(this.state.feed)) {
      this.setState({ isLoading: true });

      fetchFriendsProducts(friends)
      .then((friendsFilled: User[]) => this.generateFeed(friendsFilled))
      .finally(() => this.setState({ isLoading: false }));
    }
  }

  generateFeed(friends: User[]) {
    let feed: FeedPost[] = [];

    friends.forEach((friend: User) => {
      if (friend.products) {
        friend.products.forEach(product => {
          feed.push({
            friend_firstName: friend.first_name || '',
            friend_lastName: friend.last_name || '',
            product,
            date: new Date().toString()
            });  
        })
      }
    });

    this.setState({ feed: sortBy(feed, 'date') });
  }

  render() {
    const { friends } = this.props;
    const { isLoading, feed } = this.state;

    if (isLoading) {
      return (
        <div className="content__loading">
          <Loading size="xl" message="Loading Feed" />
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
};

const mapStateToProps = (state: State) => ({
  user: state.user,
  friends: state.friends,
  subcategories: state.subcategories
});

export default connect(mapStateToProps, mapDispatchProps)(Content);
