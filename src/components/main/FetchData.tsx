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
import './FetchData.scss';

class FetchData extends Component<FetchDataProps, any> {
  state = {
    isLoading: true
  };

  componentDidMount() {
    this.fetchData();
  }

  fetchData = () => {
    const { user, categories, fetchCategories, fetchFriends,
      fetchSubCategories, fetchProducts, fetchFriendsRequests } = this.props;

    let promises = [
      fetchCategories(),                  // values[0]
      fetchSubCategories(),               // values[1]
      fetchFriends(user.email),           // values[2]
      fetchFriendsRequests(user.email),   // values[3]
    ];

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
  userRequests: state.userRequests,
  categories: state.categories,
  subcategories: state.subcategories,
  friends: state.friends,
  products: state.products
});

const mapDispatchProps = {
  fetchCategories,
  fetchFriends,
  fetchFriendsRequests,
  fetchProducts,
  fetchSubCategories,
};

export default connect(mapStateToProps, mapDispatchProps)(FetchData);
