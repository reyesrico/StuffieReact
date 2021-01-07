import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

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
import { fetchLoanRequests } from '../../redux/loan-requests/actions';
import { fetchPendingProducts } from '../../redux/pending-products/actions';
import { fetchUserRequests } from '../../redux/user-requests/actions';
import { fetchSpotify } from '../../redux/spotify/actions';

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
      fetchFriendsRequests, fetchExchangeRequests, fetchLoanRequests,
      fetchPendingProducts, fetchUserRequests, fetchSpotify } = this.props;

    let promises = [
      fetchCategories(),                  // values[0] -- DO NOT MOVE
      fetchSubCategories(),               // values[1]
      fetchFriends(user.email),           // values[2]
      fetchFriendsRequests(user.email),   // values[3]
      fetchExchangeRequests(user.id),     // values[4]
      fetchLoanRequests(user.id),         // values[5]
      fetchSpotify()                      // values[6]
    ];

    let adminPromises = [
      fetchUserRequests(),                  // values[7]
      fetchPendingProducts()                // values[8]
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
    const { t } = this.props;
    const { isLoading } = this.state;

    if (isLoading) {
      return (
        <div className="fetch-data__loading">
          <Loading size="xl" message={t('Loading-data')} />
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
  fetchLoanRequests,
  fetchPendingProducts,
  fetchUserRequests,
  fetchSpotify
};

export default connect(mapStateToProps, mapDispatchProps)(withTranslation()<any>(FetchData));
