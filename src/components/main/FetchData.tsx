import React, { Component } from 'react';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';

import Main from './Main';
import Loading from '../shared/Loading';
import { FetchDataProps } from './types';
import { mapStuff, getProductsMap } from '../helpers/StuffHelper';
import { mapIds } from '../helpers/UserHelper';
// TBR
import { getFriendsRequests } from '../../services/stuffier';
import { fetchCategories } from '../../redux/categories/actions';
import { fetchFriends } from '../../redux/friends/actions';
import { fetchProducts, fetchProductsId } from '../../redux/products/actions';
import { fetchSubCategories } from '../../redux/subcategories/actions';


class FetchData extends Component<FetchDataProps, any> {
  state = {
    categories: [],
    friends: null,
    stuff: null,
    objects: null,
    products: [],
    subcategories: [],
    isLoading: true,
    friendsRequests: []
  };

  componentDidMount() {
    const { user, fetchProductsId, fetchCategories, fetchSubCategories, fetchFriends, fetchProducts } = this.props;
    let promises = [
      fetchProductsId(user.id),         // values[0]
      fetchCategories(),                // values[1]
      fetchSubCategories(),             // values[2]
      fetchFriends(user.email),         // values[3]
      getFriendsRequests(user.email)    // values[4]
    ];

    // Fetching values that don't depend on any.
    Promise.all(promises)
    .then((values: any) => {
      this.setState({
        stuff: values[0].data,
        categories: values[1].data,
        subcategories: values[2].data,
        friends: values[3].data,
        friendsRequests: values[4].data
      });
      return Promise.resolve(values[0].data);
    })
    .then((stuff: any) => fetchProducts(mapStuff(stuff)))
    .then((res: any) => {
      this.setState({ objects: res.data });
      return Promise.resolve(res.data);
    })
    .then((objects: any) => this.setState({ products: getProductsMap(this.state.categories, objects) }))
    .catch((error: any) => console.log(error))
    .finally(() => this.setState({ isLoading: false }));
  }

  render() {
    const { user } = this.props;
    const { categories, friends, friendsRequests, products, stuff, subcategories, isLoading } = this.state;

    if (isLoading) {
      return <Loading size="xl" message="Loading data and products..." />;
    }

    return (
      <Main
        user={user}
        categories={categories}
        friends={friends}
        products={products}
        stuff={stuff}
        subcategories={subcategories}
        friendsRequests={friendsRequests}
      />);
  }
}

const mapDispatchProps = {
  fetchCategories,
  fetchFriends,
  fetchProducts,
  fetchProductsId,
  fetchSubCategories,
};


export default connect(null, mapDispatchProps)(FetchData);
