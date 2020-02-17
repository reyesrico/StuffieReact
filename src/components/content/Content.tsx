import React, { Component } from 'react';
import ReactLoading from 'react-loading';
import { filter, forEach, isEmpty, map, find } from 'lodash';
import { getStuffiersList } from '../../services/stuff';
import { getFriends } from '../../services/stuffier';

import FriendProducts from '../types/FriendProducts';
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
    const { user } = this.props;
    const { friendsProducts, friends } = this.state;

    if (!friends.length) {
      return (
        <div>
          <ReactLoading type={"spinningBubbles"} color={"FF0000"} height={50} width={50} />
        </div>
      );
    }

    if (isEmpty(friendsProducts)) {
      return <div>No Friends! Add friends!</div>
    }
    
    return (
      <div>
        <h3>{user.first_name} Feed</h3>
        {map(friendsProducts, (row: FriendProducts, index) => {
          return (
            <div key={index}>
              <h4>{row.id_friend} has {row.products.length} products as stuff</h4>
            <ul>
              {map(row.products, (p, index) => (<li key={index}>{p}</li>))}
            </ul>
          </div>
          )
        })}
      </div>
    );
  }
};

export default Content;
