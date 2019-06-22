import React, { Component } from 'react';
import ReactLoading from 'react-loading';
import { connect } from 'react-redux';
import { isEmpty, forEach, map } from 'lodash';

import Apps from '../sections/Apps';
import MainRoutes from './MainRoutes';
import Footer from '../sections/Footer';
import Header from '../sections/Header';
import Menu from '../sections/Menu';

import { fetchCategories } from '../../redux/categories/actions';
import { fetchFriends } from '../../redux/friends/actions';
import { fetchProducts, fetchProductsId } from '../../redux/products/actions';
import { fetchSubCategories } from '../../redux/subcategories/actions';

import './Main.scss';

class Main extends Component {
  state = {
    categories: null,
    friends: null,
    stuff: null,
    objects: null,
    products: {},
    subcategories: null,
  };

  componentDidMount() {
    const { user, fetchProductsId } = this.props;

    fetchProductsId(user.id).then(res => {
      this.setState({ stuff: res.data });
    });
  }

  componentDidUpdate() {
    const { categories, friends, objects, products, stuff, subcategories } = this.state;
    const { fetchCategories, fetchSubCategories, fetchFriends, user } = this.props;

    if (!categories) {
      fetchCategories().then(res => {
        this.setState({ categories: res.data });
      });
    }

    if (!subcategories) {
      fetchSubCategories().then(res => {
        this.setState({ subcategories: res.data });
      });
    }

    if (!friends) {
      fetchFriends(user.email).then(res => this.setState({ friends: res.data }));
    }

    if (stuff && !objects) {
      this.loadStuffObjects();
    }

    if (stuff && objects && isEmpty(products)) {
      this.loadStuffByCategory();
    }
  }

  loadStuffObjects = () => {
    const { fetchProducts } = this.props;
    const { stuff } = this.state;

    if (!stuff) return;

    const ids = map(stuff, object => {
      return {
        id: object.id_stuff
      };
    });

    fetchProducts(ids).then(res => {
      this.setState({ objects: res.data });
    });
  }

  loadStuffByCategory = () => {
    const { categories, objects } = this.state;

    // Setting products by category
    let products = {};
    forEach(categories, category => {
      products = {
        ...products,
        [category.id]: [],
      };
    });

    // Filling products per category
    forEach(objects, object => {
      products[object.category].push(object);
    });

    this.setState({ products });
  }


  render() {
    const { user } = this.props;
    const { categories, friends, products, stuff, subcategories } = this.state;

    if (!stuff || !categories || isEmpty(products)) {
      return <ReactLoading type={"spinningBubbles"} color={"FF0000"} height={250} width={250} />;
    }

    return (
      <div className="stuffie">
        <div className="stuffie__header">
          <Header user={user} />
        </div>
        <div className="stuffie__main">
          <div className="stuffie__menu">
            <Menu user={user} categories={categories} products={products} />
          </div>
          <div className="stuffie__content">
            <MainRoutes
              user={user}
              stuff={stuff}
              categories={categories}
              friends={friends}
              products={products}
              subcategories={subcategories} />
          </div>
          <div className="stuffie__apps">
            <Apps />
          </div>
        </div>
        <div className="stuffie_footer">
          <Footer />
        </div>
      </div>
    );
  }
}

const mapDispatchProps = {
  fetchCategories,
  fetchFriends,
  fetchProducts,
  fetchProductsId,
  fetchSubCategories,
};

export default connect(null, mapDispatchProps)(Main);
