import React, { Component } from 'react';
import { connect } from 'react-redux';

import Loading from '../shared/Loading';
import Main from './Main';
import State from '../../redux/State';
import { FetchDataProps } from './types';

import { fetchCategories } from '../../redux/categories/actions';
import { fetchFriends } from '../../redux/friends/actions';
import { fetchFriendsRequests } from '../../redux/friends-requests/actions';
import { fetchProducts } from '../../redux/products/actions';
import { fetchSubCategories } from '../../redux/subcategories/actions';
import { fetchExchangeRequests } from '../../redux/exchange-requests/actions';
import { fetchPendingProducts } from '../../redux/pending-products/actions';
import { fetchUserRequests } from '../../redux/user-requests/actions';

import './FetchData.scss';

class FetchData extends Component<FetchDataProps, any> {
  state = {
    isLoading: true
  };

  componentDidMount() {
    this.fetchData();
  }

  fetchData = () => {
    const { user, fetchCategories, fetchFriends, fetchSubCategories, fetchProducts,
      fetchFriendsRequests, fetchExchangeRequests,   fetchPendingProducts, fetchUserRequests } = this.props;

    let promises = [
      fetchCategories(),                  // values[0]
      fetchSubCategories(),               // values[1]
      fetchFriends(user.email),           // values[2]
      fetchFriendsRequests(user.email),   // values[3]
      fetchExchangeRequests(user.id)      // values[4]
    ];

    let adminPromises = [
      fetchUserRequests(),                  // values[5]
      fetchPendingProducts()                // values[6]
    ];

    if (user.admin) {
      promises = [...promises, ...adminPromises];
    }

    Promise.all(promises)
    .then((values: any) => fetchProducts(user, values[0].data))
    .catch((error: any) => console.log(error))
    .finally(() => this.setState({ isLoading: false }));
  }

  render() {
    const { isLoading } = this.state;

    if (isLoading) {
      return (
        <div className="fetch-data__loading">
          <Loading size="xl" message="Loading data and products..." />
        </div>
      );
    }

    return (
      <Main />);
  }
}

const mapStateToProps = (state: State) => ({
  user: state.user,
});

const mapDispatchProps = {
  fetchCategories,
  fetchFriends,
  fetchFriendsRequests,
  fetchProducts,
  fetchSubCategories,
  fetchExchangeRequests,
  fetchPendingProducts,
  fetchUserRequests
};

export default connect(mapStateToProps, mapDispatchProps)(FetchData);