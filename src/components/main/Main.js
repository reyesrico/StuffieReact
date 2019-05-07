import React, { Component } from 'react';
import { connect } from 'react-redux';
import ReactLoading from 'react-loading';

import Apps from '../sections/Apps';
import MainRoutes from './MainRoutes';
import Footer from '../sections/Footer';
import Header from '../sections/Header';
import Menu from '../sections/Menu';
import { fetchCategories } from '../../redux/categories/actions';
import { getStuffList } from '../../services/stuff';

import './Main.css';

class Main extends Component {
  state = {
    categories: null,
    stuff: null
  };

  componentDidMount() {
    const { user } = this.props;
    const { stuff } = this.state;

    if (!stuff) {
      getStuffList(user.id).then(res => {
        this.setState({ stuff: res.data });
      });
    }
  }

  componentDidUpdate() {
    const { categories } = this.state;
    const { fetchCategories } = this.props;

    if (!categories) {
      fetchCategories().then(res => {
        this.setState({ categories: res.data });
      });
    }
  }

  render() {
    const { user } = this.props;
    const { categories, stuff } = this.state;

    if (!stuff || !categories) return <ReactLoading type={"spinningBubbles"} color={"FF0000"} height={250} width={250} />;

    return (
      <div className="stuffie">
        <div className="stuffie__header">
          <Header user={user} />
        </div>
        <div className="stuffie__main">
          <div className="stuffie__menu">
            <Menu user={user} categories={categories} />
          </div>
          <div className="stuffie__content">
            <MainRoutes user={user} stuff={stuff} categories={categories}/>
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
};

export default connect(null, mapDispatchProps)(Main);
