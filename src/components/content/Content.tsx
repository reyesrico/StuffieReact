import React, { Component } from 'react';
import { filter, forEach, isEmpty, map } from 'lodash';
import { getStuffiersList } from '../../services/stuff';
import { getFriends } from '../../services/stuffier';

import FeedRow from './FeedRow';
import FriendProducts from '../types/FriendProducts';
import Loading from '../shared/Loading';
import { ContentProps, ContentState } from './types';
import './Content.scss';

class Content extends Component<ContentProps, ContentState> {
  state = {
    friends: [],
    friendsProducts: [],
  };

  componentDidMount = () => {
    const { user } = this.props;
    let friends: any = [];

    // Getting email friends
    getFriends(user.email).then(res => {
      friends = map(res.data, friend => friend.id_friend);

      if (friends && isEmpty(this.state.friendsProducts)) {
        getStuffiersList(friends).then(res => {;
          const products = res.data;
          const friendsProducts = this.getProductsFromUsers(friends, products);
          this.setState({ friends, friendsProducts });
        });
      }  
    });
  }

  getProductsFromUsers(friends: number[], products: any) {
    let friendsProducts: FriendProducts[] = [];

    forEach(friends, friend => {
      const values = filter(products, p => p.id_stuffier === friend)
        .map(row => row.id_stuff);

      friendsProducts.push({ id_friend: friend, products: [...values] });
    });

    return friendsProducts;
  }

  render() {
    const { subcategories, user } = this.props;
    const { friendsProducts, friends } = this.state;

    if (!friends.length) {
      return (<Loading size="lg" />);
    }

    if (isEmpty(friendsProducts)) {
      return <div>No Friends! Add friends!</div>
    }
    
    return (
      <div className="stuffie-content">
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

export default Content;
