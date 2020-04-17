import React, { Component } from 'react';
import { connect } from 'react-redux';

import Loading from '../shared/Loading';
import Main from './Main';
import State from '../../redux/State';
import { FetchDataProps } from './types';
import { mapStuff, getProductsMap } from '../helpers/StuffHelper';

import { fetchCategories } from '../../redux/categories/actions';
import { fetchFriends } from '../../redux/friends/actions';
import { fetchFriendsRequests } from '../../redux/friends-requests/actions';
import { fetchProducts, fetchProductsId } from '../../redux/products/actions';
import { fetchSubCategories } from '../../redux/subcategories/actions';
import './FetchData.scss';

class FetchData extends Component<FetchDataProps, any> {
  state = {
    stuff: null,
    objects: null,
    products: null,
    isLoading: true,
    friendsRequests: []
  };

  componentDidMount() {
    this.fetchData();
  }

  fetchData = () => {
    const { user, fetchProductsId, fetchCategories, fetchSubCategories,
      fetchFriends, fetchProducts, fetchFriendsRequests } = this.props;

    let promises = [
      fetchProductsId(user.id),         // values[0]
      fetchCategories(),                // values[1]
      fetchSubCategories(),             // values[2]
      fetchFriends(user.email),         // values[3]
      fetchFriendsRequests(user.email),   // values[4]
    ];

    // Fetching values that don't depend on any.
    Promise.all(promises)
    .then((values: any) => {
      console.log(values);
      this.setState({
        stuff: values[0].data,
        // categories: values[1].data,
        // subcategories: values[2].data,
        // friends: values[3].data,
        // friendsRequests: values[4].data
      });
      return Promise.resolve(values[0].data);
    })
    .then((stuff: any) => fetchProducts(mapStuff(stuff)))
    .then((res: any) => {
      this.setState({ objects: res.data });
      return Promise.resolve(res.data);
    })
    .then((objects: any) => this.setState({ products: getProductsMap(this.props.categories, objects) }))
    .catch((error: any) => console.log(error))
    .finally(() => this.setState({ isLoading: false }));
  }


  render() {
    const { products, stuff,  isLoading } = this.state;

    if (isLoading) {
      return (
        <div className="fetch-data__loading">
          <Loading size="xl" message="Loading data and products..." />
        </div>
      );
    }

    return (
      <Main
        products={products}
        stuff={stuff}
      />);
  }
}

const mapStateToProps = (state: State) => ({
  user: state.user,
  userRequests: state.userRequests,
  categories: state.categories,
  subcategories: state.subcategories,
  friends: state.friends,
  // products: any
});

const mapDispatchProps = {
  fetchCategories,
  fetchFriends,
  fetchFriendsRequests,
  fetchProducts,
  fetchProductsId,
  fetchSubCategories,
};

export default connect(mapStateToProps, mapDispatchProps)(FetchData);
