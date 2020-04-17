import React, { Component } from 'react';
import { connect } from 'react-redux';
import { filter, forEach, isEmpty, map } from 'lodash';
import { getStuffiersList } from '../../services/stuff';

import FeedRow from './FeedRow';
import FriendProducts from '../types/FriendProducts';
import Loading from '../shared/Loading';
import State from '../../redux/State';
import { ContentProps, ContentState } from './types';
import './Content.scss';

class Content extends Component<ContentProps, ContentState> {
  state = {
    isLoading: false,
    friendsProducts: [],
  };

  componentDidMount = () => {
    const { friends } = this.props;

    if (isEmpty(this.state.friendsProducts)) {
      this.setState({ isLoading: true });

      getStuffiersList(friends)
      .then(res => {
        const products = res.data;
        const friendsProducts = this.getProductsFromUsers(products);
        this.setState({ friendsProducts });
      })
      .finally(() => this.setState({ isLoading: false }));
    }
  }

  getProductsFromUsers(products: any) {
    let friendsProducts: FriendProducts[] = [];

    forEach(this.props.friends, friend => {
      const values = filter(products, p => p.id_stuffier === friend.id)
        .map(row => row.id_stuff);

      friendsProducts.push({ id_friend: friend, products: [...values] });
    });

    return friendsProducts;
  }

  render() {
    const { friends, subcategories, user } = this.props;
    const { isLoading, friendsProducts } = this.state;

    if (isLoading) {
      return (
        <div className="content__loading">
          <Loading size="xl" message="Loading Feed" />
        </div>
      );
    }

    if (!friends.length || isEmpty(friendsProducts)) {
      return <div>No Friends! Add friends!</div>
    }

    return (
      <div className="content">
        <div className="content__info">
          {map(friendsProducts, (row: FriendProducts, index) => {
            return (
              <div key={index} className="content__rows">
                {map(row.products, (p: number, index) => (<FeedRow key={index} user={user} product={p} subcategories={subcategories} />))}
              </div>
            )
          })}
        </div>
      </div>
    );
  }
};

const mapStateToProps = (state: State) => ({
  user: state.user,
  friends: state.friends,
  subcategories: state.subcategories
});

export default connect(mapStateToProps, {})(Content);
