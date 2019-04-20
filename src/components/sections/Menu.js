import React, { Component } from 'react';
import ReactLoading from 'react-loading';

import { getCategories } from '../services/stuff';

class Menu extends Component {
  state=  {
    categories: null,
  };

  componentDidMount() {
    const { categories } = this.state;

    if (!categories) {
      getCategories().then(res => {
        this.setState({ categories: res.data });
      });
    }
  }

  render() {
    const { categories } = this.state;

    if (!categories) {
      return (
        <div>
          <ReactLoading type={"spinningBubbles"} color={"FF0000"} height={50} width={50} />;
        </div>
      );
    }

    return (
      <div className='barBlock barMenu'>
        <div className='menuName'>Menu</div>
        <hr />
        {categories && categories.map(category => <div key={category.id}>{category.name}</div>) }
        <hr />
        <div className='searchBarGroup'>
          {/* <SearchBar categories={categories} /> */}
        </div>
      </div>
    );
  }
};

export default Menu;
