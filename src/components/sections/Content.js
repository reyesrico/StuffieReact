// import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactLoading from 'react-loading';
import { forEach, map } from 'lodash';
import { getStuffList } from '../../services/stuff';
import { getFriends } from '../../services/stuffier';

import './Content.css';

class Content extends Component {
  state = {
    friends: [],
    friendsProducts: null,
  };

  componentDidMount() {
    this.loadFriends();
  }

  componentDidUpdate() {
    const { friends } = this.state;
    let friendsProducts = {};

    if (friends && !this.state.friendsProducts) {
      forEach(friends, friend => {
        getStuffList(friend).then(res => {
          const values = res.data;
          friendsProducts = {
            ...friendsProducts,
            [friend]: [...values]
          };
        });
      });
      this.setState({ friendsProducts });
    }
  }

  loadFriends = async () => {
    const { user } = this.props;

    // Getting email friends
    getFriends(user.email).then(res => {
      const friends = map(res.data, friend => friend.id_friend);
      this.setState({ friends });
    });
  }

  render() {
    const { user } = this.props;
    const { friendsProducts, friends } = this.state;

    if (!friendsProducts) {
      return (
        <div>
          <ReactLoading type={"spinningBubbles"} color={"FF0000"} height={50} width={50} />
        </div>
      );
    }

    if (friendsProducts.length === 0) {
      return <div>No Friends! Add friends!</div>
    }
    
    console.log(friendsProducts);
    return (
      <div>
        <h3>{user.first_name} Feed</h3>
        {
          map(friends, (friend, index) => {        
            return (
              <div key={index}>
                <h4>{friend} has {friendsProducts[friend.id_friend]} products as stuff</h4>
                <ul>
                  {/* {friendsProducts[friend].map((object, index) => {
                    return (
                      <li key={index}>{object}</li>
                    )
                  })} */}
                </ul>
              </div>
            )
          })
        }
      </div>
    );
  }
};

export default Content;
