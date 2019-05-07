import React, { Component } from 'react';
import ReactLoading from 'react-loading';

import './Menu.css';

class Menu extends Component {
  render() {
    const { categories } = this.props;

    if (!categories) {
      return (
        <div>
          <ReactLoading type={"spinningBubbles"} color={"FF0000"} height={50} width={50} />;
        </div>
      );
    }

    return (
      <div className='barBlock barMenu'>
        <div className='menu__title'>Menu</div>
        <hr />
        {
          categories && categories.map(category => {
            return <div className="menu__category" key={category.id}>
              {category.name}
            </div>
        })}
        <hr />
        <div className='searchBarGroup'>
          {/* <SearchBar categories={categories} /> */}
        </div>
      </div>
    );
  }
};

export default Menu;
